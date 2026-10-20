import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { InStatement, ResultSet, TransactionMode } from '@libsql/client';
import { getDb } from './db.js';
import { HttpError, parseCookies } from './http.js';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const COOKIE = 'ql_session';
const SESSION_DAYS = 30;
// OWASP's minimum for scrypt is N=2^16, r=8, p=2. Older hashes keep their own parameters and are upgraded at sign in.
const SCRYPT = { N: 65536, r: 8, p: 2, maxmem: 160 * 1024 * 1024 };

export type User = { id: string; email: string; name: string };

export const newId = () => randomBytes(16).toString('hex');

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${hash.toString('base64')}`;
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [scheme, n, r, p, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = await scryptAsync(password, Buffer.from(salt, 'base64'), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT.maxmem,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

export const needsRehash = (stored: string): boolean => {
  const [scheme, n, r, p] = stored.split('$');
  return scheme !== 'scrypt' || Number(n) < SCRYPT.N || Number(r) < SCRYPT.r || Number(p) < SCRYPT.p;
};

// Only a hash of the session token is stored, so a database leak does not leak live sessions
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

const cookie = (value: string, maxAge: number) =>
  `${COOKIE}=${value}; Path=/quizlingo; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

export const newSession = (userId: string): { statement: InStatement; cookie: string } => {
  const token = randomBytes(32).toString('base64url');
  const now = Date.now();
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return {
    statement: {
      sql: 'INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
      args: [hashToken(token), userId, now, now + maxAge * 1000],
    },
    cookie: cookie(token, maxAge),
  };
};

export const destroySession = async (request: Request): Promise<string> => {
  const token = parseCookies(request)[COOKIE];
  if (token) {
    const db = await getDb();
    await db.execute({ sql: 'DELETE FROM sessions WHERE id = ?', args: [hashToken(token)] });
  }
  return cookie('', 0);
};

export type Scope = { sid: string; now: number };

export const CURRENT_USER = '(SELECT user_id FROM sessions WHERE id = :sid AND expires_at > :now)';

const userLookup = (scope: Scope): InStatement => ({
  sql: `SELECT users.id, users.email, users.name FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.id = :sid AND sessions.expires_at > :now`,
  args: scope,
});

const toUser = (result: ResultSet): User | null => {
  const row = result.rows[0];
  if (!row) return null;
  return { id: String(row.id), email: String(row.email), name: String(row.name) };
};

const readScope = (request: Request): Scope | null => {
  const token = parseCookies(request)[COOKIE];
  return token ? { sid: hashToken(token), now: Date.now() } : null;
};

const signInRequired = () => new HttpError(401, 'Please sign in to continue.');

export const requireScope = (request: Request): Scope => {
  const scope = readScope(request);
  if (!scope) throw signInRequired();
  return scope;
};

export const getUser = async (request: Request): Promise<User | null> => {
  const scope = readScope(request);
  if (!scope) return null;
  const db = await getDb();
  return toUser(await db.execute(userLookup(scope)));
};

export const queryAsUser = async (
  request: Request,
  statements: (scope: Scope) => InStatement[],
  mode: TransactionMode = 'read',
): Promise<{ user: User; results: ResultSet[] }> => {
  const scope = requireScope(request);
  const db = await getDb();
  const [lookup, ...results] = await db.batch([userLookup(scope), ...statements(scope)], mode);
  const user = toUser(lookup);
  if (!user) throw signInRequired();
  return { user, results };
};

// Login throttling: at most 10 failed attempts per email in 15 minutes
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;

export const loginAttempts = (email: string): InStatement => ({
  sql: 'SELECT COUNT(*) AS n FROM login_attempts WHERE email = ? AND attempted_at > ?',
  args: [email, Date.now() - WINDOW_MS],
});

export const assertLoginAllowed = (attempts: ResultSet) => {
  if (Number(attempts.rows[0]?.n ?? 0) >= MAX_FAILURES) {
    throw new HttpError(429, 'Too many failed attempts. Wait 15 minutes, then try again.');
  }
};

export const recordLoginFailure = async (email: string) => {
  const db = await getDb();
  const now = Date.now();
  await db.batch(
    [
      { sql: 'INSERT INTO login_attempts (email, attempted_at) VALUES (?, ?)', args: [email, now] },
      { sql: 'DELETE FROM login_attempts WHERE attempted_at < ?', args: [now - WINDOW_MS] },
    ],
    'write',
  );
};

export const clearLoginFailures = (email: string): InStatement => ({
  sql: 'DELETE FROM login_attempts WHERE email = ?',
  args: [email],
});

export const normalizeEmail = (value: unknown): string => {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'Enter a valid email address.');
  }
  return email;
};

export const validatePassword = (value: unknown): string => {
  const password = typeof value === 'string' ? value : '';
  if (password.length < 8) throw new HttpError(400, 'Use at least 8 characters for your password.');
  if (password.length > 200) throw new HttpError(400, 'Use at most 200 characters for your password.');
  return password;
};
