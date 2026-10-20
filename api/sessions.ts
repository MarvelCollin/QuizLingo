import { newId, requireScope } from './_lib/auth.js';
import { getDb } from './_lib/db.js';
import { handle, HttpError, json, readJson } from './_lib/http.js';
import * as validate from './_lib/validate.js';

type Body = { mode?: unknown; level?: unknown; total?: unknown; correct?: unknown };

// Saves the summary of one finished practice round
export const POST = handle(async (request) => {
  const scope = requireScope(request);
  const body = await readJson<Body>(request);
  const session = {
    id: newId(),
    mode: validate.mode(body.mode),
    level: validate.level(body.level),
    total: validate.count(body.total, 2000),
    correct: validate.count(body.correct, 2000),
    createdAt: Date.now(),
  };
  if (session.total === 0) throw new HttpError(400, 'A round needs at least one answer.');
  if (session.correct > session.total) throw new HttpError(400, 'Correct answers cannot exceed the total.');

  const db = await getDb();
  const result = await db.execute({
    sql: `INSERT INTO practice_sessions (id, user_id, mode, level, total, correct, created_at)
          SELECT :id, user_id, :mode, :level, :total, :correct, :createdAt
          FROM sessions WHERE id = :sid AND expires_at > :now`,
    args: { ...scope, ...session },
  });
  if (result.rowsAffected === 0) throw new HttpError(401, 'Please sign in to continue.');
  return json({ session }, { status: 201 });
});
