import { hashPassword, newId, newSession, normalizeEmail, validatePassword } from '../_lib/auth.js';
import { getDb } from '../_lib/db.js';
import { handle, HttpError, json, readJson } from '../_lib/http.js';
import { limitRate } from '../_lib/rate-limit.js';

type Body = { name?: unknown; email?: unknown; password?: unknown };

const isTakenEmail = (error: unknown) =>
  error instanceof Error && error.message.includes('UNIQUE constraint failed: users.email');

const HOUR = 60 * 60 * 1000;

export const POST = handle(async (request) => {
  // Checked first, since hashing a password is the costly part and an account costs a row
  await limitRate(request, 'register', 10, HOUR, 'Too many accounts were created from this network. Try again in an hour.');
  const body = await readJson<Body>(request);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (name.length < 1 || name.length > 60) throw new HttpError(400, 'Enter a name between 1 and 60 characters.');
  const email = normalizeEmail(body.email);
  const password = validatePassword(body.password);

  const user = { id: newId(), email, name };
  const session = newSession(user.id);
  const db = await getDb();
  try {
    await db.batch(
      [
        {
          sql: 'INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
          args: [user.id, email, name, await hashPassword(password), Date.now()],
        },
        session.statement,
      ],
      'write',
    );
  } catch (error) {
    if (isTakenEmail(error)) throw new HttpError(409, 'An account with this email already exists. Sign in instead.');
    throw error;
  }
  return json({ user }, { status: 201, headers: { 'Set-Cookie': session.cookie } });
});
