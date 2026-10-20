import {
  checkLoginAllowed,
  clearLoginFailures,
  createSession,
  hashPassword,
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
  await checkLoginAllowed(email);

  const db = await getDb();
  const result = await db.execute({
    sql: 'SELECT id, email, name, password_hash FROM users WHERE email = ?',
    args: [email],
  });
  const row = result.rows[0];
  // Hash anyway when the account does not exist, so response time does not reveal which emails are registered
  const valid = row
    ? await verifyPassword(password, String(row.password_hash))
    : (await hashPassword(password), false);

  if (!row || !valid) {
    await recordLoginFailure(email);
    throw new HttpError(401, 'That email and password do not match.');
  }

  await clearLoginFailures(email);
  const cookie = await createSession(String(row.id));
  const user = { id: String(row.id), email: String(row.email), name: String(row.name) };
  return json({ user }, { headers: { 'Set-Cookie': cookie } });
});
