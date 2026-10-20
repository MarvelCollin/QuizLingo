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
  // Hash anyway when the account does not exist, so response time does not reveal which emails are registered
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
    // Expired sessions are of no use, so they are removed as people sign in
    { sql: 'DELETE FROM sessions WHERE expires_at < ?', args: [Date.now()] },
  ];
  // A hash made with weaker settings is replaced now that the password is known
  if (needsRehash(String(row.password_hash))) {
    statements.push({ sql: 'UPDATE users SET password_hash = ? WHERE id = ?', args: [await hashPassword(password), String(row.id)] });
  }
  await db.batch(statements, 'write');
  const user = { id: String(row.id), email: String(row.email), name: String(row.name) };
  return json({ user }, { headers: { 'Set-Cookie': session.cookie } });
});
