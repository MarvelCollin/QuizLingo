import {
  assertLoginAllowed,
  clearLoginFailures,
  hashPassword,
  loginAttempts,
  needsRehash,
  newSession,
  normalizeEmail,
  recordLoginFailure,
  verifyPassword,
} from '../_lib/auth.js';
import { getDb } from '../_lib/db.js';
import { handle, HttpError, json, readJson } from '../_lib/http.js';

type Body = { email?: unknown; password?: unknown };

export const POST = handle(async (request) => {
  const body = await readJson<Body>(request);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';

  const db = await getDb();
  const [attempts, result] = await db.batch(
    [loginAttempts(email), { sql: 'SELECT id, email, name, password_hash FROM users WHERE email = ?', args: [email] }],
    'read',
  );
  assertLoginAllowed(attempts);
  const row = result.rows[0];
  const valid = row
    ? await verifyPassword(password, String(row.password_hash))
    : (await hashPassword(password), false);

  if (!row || !valid) {
    await recordLoginFailure(email);
    throw new HttpError(401, 'That email and password do not match.');
  }

  const session = newSession(String(row.id));
  const statements = [
    clearLoginFailures(email),
    session.statement,
    { sql: 'DELETE FROM sessions WHERE expires_at < ?', args: [Date.now()] },
  ];
  if (needsRehash(String(row.password_hash))) {
    statements.push({ sql: 'UPDATE users SET password_hash = ? WHERE id = ?', args: [await hashPassword(password), String(row.id)] });
  }
  await db.batch(statements, 'write');
  const user = { id: String(row.id), email: String(row.email), name: String(row.name) };
  return json({ user }, { headers: { 'Set-Cookie': session.cookie } });
});
