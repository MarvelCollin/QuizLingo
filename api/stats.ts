import { CURRENT_USER, queryAsUser } from './_lib/auth.js';
import { handle, json } from './_lib/http.js';
import { MASTERED_BOX } from './_lib/srs.js';

const DAY = 24 * 60 * 60 * 1000;

// Day number in the viewer's time zone. tz is Date.getTimezoneOffset() from the browser.
const dayOf = (time: number, tz: number) => Math.floor((time - tz * 60 * 1000) / DAY);

export const GET = handle(async (request) => {
  const params = new URL(request.url).searchParams;
  const tzParam = Number(params.get('tz'));
  const tz = Number.isFinite(tzParam) && Math.abs(tzParam) <= 14 * 60 ? tzParam : 0;

  const {
    results: [levels, totals, sessions, days],
  } = await queryAsUser(request, (scope) => [
    {
      sql: `SELECT level, COUNT(*) AS seen, SUM(box >= :mastered) AS mastered, SUM(due_at <= :now) AS due
            FROM word_progress WHERE user_id = ${CURRENT_USER} GROUP BY level`,
      args: { ...scope, mastered: MASTERED_BOX },
    },
    {
      sql: `SELECT COALESCE(SUM(correct), 0) AS correct, COALESCE(SUM(wrong), 0) AS wrong
            FROM word_progress WHERE user_id = ${CURRENT_USER}`,
      args: scope,
    },
    {
      sql: `SELECT id, mode, level, total, correct, created_at FROM practice_sessions
            WHERE user_id = ${CURRENT_USER} ORDER BY created_at DESC LIMIT 10`,
      args: scope,
    },
    {
      sql: `SELECT created_at, total FROM practice_sessions WHERE user_id = ${CURRENT_USER} AND created_at > :since`,
      args: { ...scope, since: scope.now - 400 * DAY },
    },
  ]);
  const now = Date.now();

  // Answers per day for the last 14 days, and the run of consecutive practice days up to today
  const today = dayOf(now, tz);
  const perDay = new Map<number, number>();
  for (const row of days.rows) {
    const day = dayOf(Number(row.created_at), tz);
    perDay.set(day, (perDay.get(day) ?? 0) + Number(row.total));
  }
  let streak = 0;
  for (let day = perDay.has(today) ? today : today - 1; perDay.has(day); day--) streak++;
  const activity = Array.from({ length: 14 }, (_, i) => {
    const day = today - 13 + i;
    return { date: new Date(day * DAY + tz * 60 * 1000).toISOString(), answers: perDay.get(day) ?? 0 };
  });

  const correct = Number(totals.rows[0]?.correct ?? 0);
  const wrong = Number(totals.rows[0]?.wrong ?? 0);

  return json({
    levels: levels.rows.map((row) => ({
      level: Number(row.level),
      seen: Number(row.seen),
      mastered: Number(row.mastered ?? 0),
      due: Number(row.due ?? 0),
    })),
    answers: { correct, wrong },
    streak,
    activity,
    recent: sessions.rows.map((row) => ({
      id: String(row.id),
      mode: String(row.mode),
      level: Number(row.level),
      total: Number(row.total),
      correct: Number(row.correct),
      createdAt: Number(row.created_at),
    })),
  });
});
