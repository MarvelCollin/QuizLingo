import {
  createSession,
  hashPassword,
  newId,
  normalizeEmail,
  validatePassword,
} from '../_lib/auth.js';
import { getDb } from '../_lib/db.js';
import { handle, HttpError, json, readJson } from '../_lib/http.js';

type Body = { name?: unknown; email?: unknown; password?: unknown };

export const POST = handle(async (request) => {
  const body = await readJson<Body>(request);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (name.length < 1 || name.length > 60) throw new HttpError(400, 'Enter a name between 1 and 60 characters.');
  const email = normalizeEmail(body.email);
  const password = validatePassword(body.password);

  const db = await getDb();
  const existing = await db.execute({ sql: 'SELECT 1 FROM users WHERE email = ?', args: [email] });
  if (existing.rows.length > 0) throw new HttpError(409, 'An account with this email already exists. Sign in instead.');

  const user = { id: newId(), email, name };
  await db.execute({
    sql: 'INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [user.id, email, name, await hashPassword(password), Date.now()],
  });
  const cookie = await createSession(user.id);
  return json({ user }, { status: 201, headers: { 'Set-Cookie': cookie } });
});
