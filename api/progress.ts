import { CURRENT_USER, queryAsUser } from './_lib/auth.js';
import { getDb } from './_lib/db.js';
import { handle, HttpError, json, readJson } from './_lib/http.js';
import { review } from './_lib/srs.js';
import * as validate from './_lib/validate.js';

const toProgress = (row: Record<string, unknown>) => ({
  word: String(row.word),
  level: Number(row.level),
  box: Number(row.box),
  correct: Number(row.correct),
  wrong: Number(row.wrong),
  dueAt: Number(row.due_at),
  lastSeenAt: Number(row.last_seen_at),
});

export const GET = handle(async (request) => {
  const {
    results: [result],
  } = await queryAsUser(request, (scope) => [
    {
      sql: `SELECT word, level, box, correct, wrong, due_at, last_seen_at FROM word_progress
            WHERE user_id = ${CURRENT_USER}`,
      args: scope,
    },
  ]);
  return json({ progress: result.rows.map((row) => toProgress(row as Record<string, unknown>)) });
});

type Body = { results?: unknown };
type Result = { word: string; level: number; correct: boolean };

const MAX_RESULTS = 100;
const MAX_WORDS = 12000;

export const POST = handle(async (request) => {
  const body = await readJson<Body>(request);
  if (!Array.isArray(body.results) || body.results.length === 0 || body.results.length > MAX_RESULTS) {
    throw new HttpError(400, `Send between 1 and ${MAX_RESULTS} results.`);
  }
  const results: Result[] = body.results.map((item: Record<string, unknown>) => {
    if (typeof item?.correct !== 'boolean') throw new HttpError(400, 'Each result needs correct: true or false.');
    return { word: validate.word(item.word), level: validate.level(item.level), correct: item.correct };
  });

  const words = [...new Set(results.map((r) => r.word))];
  const {
    user,
    results: [existing, total],
  } = await queryAsUser(request, (scope) => [
    {
      sql: `SELECT word, level, box, correct, wrong, due_at, last_seen_at FROM word_progress
            WHERE user_id = ${CURRENT_USER} AND word IN (${words.map((_, i) => `:w${i}`).join(',')})`,
      args: { ...scope, ...Object.fromEntries(words.map((w, i) => [`w${i}`, w])) },
    },
    { sql: `SELECT COUNT(*) AS n FROM word_progress WHERE user_id = ${CURRENT_USER}`, args: scope },
  ]);
  if (Number(total.rows[0]?.n ?? 0) + words.length - existing.rows.length > MAX_WORDS) {
    throw new HttpError(400, 'This account has saved the most words it can.');
  }

  const state = new Map(
    existing.rows.map((row) => {
      const p = toProgress(row as Record<string, unknown>);
      return [p.word, p];
    }),
  );
  const now = Date.now();
  for (const result of results) {
    const current = state.get(result.word) ?? {
      word: result.word,
      level: result.level,
      box: 0,
      correct: 0,
      wrong: 0,
      dueAt: now,
      lastSeenAt: now,
    };
    const next = review(current.box, result.correct, now);
    state.set(result.word, {
      ...current,
      level: result.level,
      box: next.box,
      dueAt: next.dueAt,
      lastSeenAt: now,
      correct: current.correct + (result.correct ? 1 : 0),
      wrong: current.wrong + (result.correct ? 0 : 1),
    });
  }

  const updated = words.map((w) => state.get(w)!);
  const db = await getDb();
  await db.batch(
    updated.map((p) => ({
      sql: `INSERT INTO word_progress (user_id, word, level, box, correct, wrong, due_at, last_seen_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (user_id, word) DO UPDATE SET
              level = excluded.level, box = excluded.box, correct = excluded.correct,
              wrong = excluded.wrong, due_at = excluded.due_at, last_seen_at = excluded.last_seen_at`,
      args: [user.id, p.word, p.level, p.box, p.correct, p.wrong, p.dueAt, p.lastSeenAt],
    })),
    'write',
  );
  return json({ progress: updated });
});
