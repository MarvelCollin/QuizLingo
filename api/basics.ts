import { CURRENT_USER, getUser, queryAsUser, requireScope } from './_lib/auth.js';
import { getDb } from './_lib/db.js';
import { handle, HttpError, json, readJson } from './_lib/http.js';
import * as validate from './_lib/validate.js';

const toLesson = (row: Record<string, unknown>) => ({
  lesson: String(row.lesson),
  best: Number(row.best),
  attempts: Number(row.attempts),
  completedAt: row.completed_at === null ? null : Number(row.completed_at),
});

export const GET = handle(async (request) => {
  const {
    results: [result],
  } = await queryAsUser(request, (scope) => [
    {
      sql: `SELECT lesson, best, attempts, completed_at FROM basics_progress WHERE user_id = ${CURRENT_USER}`,
      args: scope,
    },
  ]);
  return json({ lessons: result.rows.map((row) => toLesson(row as Record<string, unknown>)) });
});

export const DELETE = handle(async (request) => {
  const scope = requireScope(request);
  const db = await getDb();
  const [lookup, removed] = await db.batch(
    [
      { sql: 'SELECT user_id FROM sessions WHERE id = :sid AND expires_at > :now', args: scope },
      { sql: `DELETE FROM basics_progress WHERE user_id = ${CURRENT_USER}`, args: scope },
    ],
    'write',
  );
  if (lookup.rows.length === 0) throw new HttpError(401, 'Please sign in to continue.');
  return json({ removed: removed.rowsAffected });
});

type Body = { lesson?: unknown; score?: unknown; passed?: unknown };

const MAX_LESSONS = 200;

export const POST = handle(async (request) => {
  const scope = requireScope(request);
  const body = await readJson<Body>(request);
  if (typeof body.passed !== 'boolean') throw new HttpError(400, 'Send passed: true or false.');
  const attempt = {
    lesson: validate.lesson(body.lesson),
    score: validate.percent(body.score),
    completedAt: body.passed ? scope.now : null,
  };

  const db = await getDb();
  const [saved, row] = await db.batch(
    [
      {
        sql: `INSERT INTO basics_progress (user_id, lesson, best, attempts, completed_at, updated_at)
              SELECT user_id, :lesson, :score, 1, :completedAt, :now FROM sessions WHERE id = :sid AND expires_at > :now
                AND ((SELECT COUNT(*) FROM basics_progress WHERE user_id = sessions.user_id) < :cap
                  OR EXISTS (SELECT 1 FROM basics_progress WHERE user_id = sessions.user_id AND lesson = :lesson))
              ON CONFLICT (user_id, lesson) DO UPDATE SET
                best = MAX(best, excluded.best),
                attempts = attempts + 1,
                completed_at = COALESCE(completed_at, excluded.completed_at),
                updated_at = excluded.updated_at`,
        args: { ...scope, ...attempt, cap: MAX_LESSONS },
      },
      {
        sql: `SELECT lesson, best, attempts, completed_at FROM basics_progress
              WHERE user_id = ${CURRENT_USER} AND lesson = :lesson`,
        args: { ...scope, lesson: attempt.lesson },
      },
    ],
    'write',
  );
  if (saved.rowsAffected === 0) {
    if (!(await getUser(request))) throw new HttpError(401, 'Please sign in to continue.');
    throw new HttpError(400, 'This account has saved the most lessons it can.');
  }
  return json({ lesson: toLesson(row.rows[0] as Record<string, unknown>) }, { status: 201 });
});
