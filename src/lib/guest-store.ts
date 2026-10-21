import { MASTERED_BOX, review } from './srs';

const PREFIX = 'quizlingo-guest-v1';
const DAY = 24 * 60 * 60 * 1000;
const MAX_ROUNDS = 1000;
const MAX_LESSONS = 200;
const MAX_RESULTS = 100;

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type Progress = { word: string; level: number; box: number; correct: number; wrong: number; dueAt: number; lastSeenAt: number };
type Round = { id: string; mode: string; level: number; total: number; correct: number; createdAt: number };
type Lesson = { lesson: string; best: number; attempts: number; completedAt: number | null };

export class GuestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const browserStore = (): Store | undefined => {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
};

const read = <T>(store: Store | undefined, name: string): T[] => {
  try {
    const parsed: unknown = JSON.parse(store?.getItem(`${PREFIX}:${name}`) ?? '[]');
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

const write = (store: Store | undefined, name: string, rows: unknown[]) => {
  try {
    store?.setItem(`${PREFIX}:${name}`, JSON.stringify(rows));
  } catch {
    throw new GuestError(507, 'This browser has no room left to save guest progress. Create an account to keep going.');
  }
};

const isLevel = (value: unknown) => Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 7;

const isCount = (value: unknown) => Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 2000;

const newId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const saveAnswers = (store: Store | undefined, body: unknown, now: number) => {
  const results = (body as { results?: unknown })?.results;
  if (!Array.isArray(results) || results.length === 0 || results.length > MAX_RESULTS) {
    throw new GuestError(400, `Send between 1 and ${MAX_RESULTS} results.`);
  }
  const state = new Map(read<Progress>(store, 'progress').map((p) => [p.word, p]));
  const touched: string[] = [];
  for (const result of results as { word?: unknown; level?: unknown; correct?: unknown }[]) {
    if (typeof result.word !== 'string' || result.word.length === 0 || result.word.length > 16) {
      throw new GuestError(400, 'Each result needs a word of 1 to 16 characters.');
    }
    if (!isLevel(result.level) || typeof result.correct !== 'boolean') throw new GuestError(400, 'Each result needs a level and correct.');
    const current = state.get(result.word) ?? {
      word: result.word,
      level: result.level as number,
      box: 0,
      correct: 0,
      wrong: 0,
      dueAt: now,
      lastSeenAt: now,
    };
    const next = review(current.box, result.correct, now);
    state.set(result.word, {
      ...current,
      level: result.level as number,
      box: next.box,
      dueAt: next.dueAt,
      lastSeenAt: now,
      correct: current.correct + (result.correct ? 1 : 0),
      wrong: current.wrong + (result.correct ? 0 : 1),
    });
    if (!touched.includes(result.word)) touched.push(result.word);
  }
  write(store, 'progress', [...state.values()]);
  return { progress: touched.map((word) => state.get(word)!) };
};

const saveRound = (store: Store | undefined, body: unknown, now: number) => {
  const input = (body ?? {}) as { mode?: unknown; level?: unknown; total?: unknown; correct?: unknown };
  if (typeof input.mode !== 'string' || !isLevel(input.level) || !isCount(input.total) || !isCount(input.correct)) {
    throw new GuestError(400, 'A round needs a mode, a level and its counts.');
  }
  if (input.total === 0) throw new GuestError(400, 'A round needs at least one answer.');
  if ((input.correct as number) > (input.total as number)) throw new GuestError(400, 'Correct answers cannot exceed the total.');
  const round: Round = {
    id: newId(),
    mode: input.mode,
    level: input.level as number,
    total: input.total as number,
    correct: input.correct as number,
    createdAt: now,
  };
  write(store, 'rounds', [...read<Round>(store, 'rounds'), round].slice(-MAX_ROUNDS));
  return { session: round };
};

const dayOf = (time: number, tz: number) => Math.floor((time - tz * 60 * 1000) / DAY);

const stats = (store: Store | undefined, tz: number, now: number) => {
  const progress = read<Progress>(store, 'progress');
  const rounds = read<Round>(store, 'rounds');
  const byLevel = new Map<number, { level: number; seen: number; mastered: number; due: number }>();
  for (const p of progress) {
    const row = byLevel.get(p.level) ?? { level: p.level, seen: 0, mastered: 0, due: 0 };
    row.seen += 1;
    if (p.box >= MASTERED_BOX) row.mastered += 1;
    if (p.dueAt <= now) row.due += 1;
    byLevel.set(p.level, row);
  }
  const today = dayOf(now, tz);
  const perDay = new Map<number, number>();
  for (const round of rounds) {
    if (round.createdAt <= now - 400 * DAY) continue;
    const day = dayOf(round.createdAt, tz);
    perDay.set(day, (perDay.get(day) ?? 0) + round.total);
  }
  let streak = 0;
  for (let day = perDay.has(today) ? today : today - 1; perDay.has(day); day--) streak++;
  return {
    levels: [...byLevel.values()].sort((a, b) => a.level - b.level),
    answers: {
      correct: progress.reduce((sum, p) => sum + p.correct, 0),
      wrong: progress.reduce((sum, p) => sum + p.wrong, 0),
    },
    streak,
    activity: Array.from({ length: 14 }, (_, i) => {
      const day = today - 13 + i;
      return { date: new Date(day * DAY + tz * 60 * 1000).toISOString(), answers: perDay.get(day) ?? 0 };
    }),
    recent: [...rounds].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10),
  };
};

const saveLesson = (store: Store | undefined, body: unknown, now: number) => {
  const input = (body ?? {}) as { lesson?: unknown; score?: unknown; passed?: unknown };
  if (typeof input.passed !== 'boolean') throw new GuestError(400, 'Send passed: true or false.');
  if (typeof input.lesson !== 'string' || input.lesson.length === 0 || input.lesson.length > 40) {
    throw new GuestError(400, 'Send a lesson id.');
  }
  if (!Number.isInteger(input.score) || (input.score as number) < 0 || (input.score as number) > 100) {
    throw new GuestError(400, 'Score must be a whole number from 0 to 100.');
  }
  const lessons = read<Lesson>(store, 'basics');
  const existing = lessons.find((l) => l.lesson === input.lesson);
  if (!existing && lessons.length >= MAX_LESSONS) throw new GuestError(400, 'This browser has saved the most lessons it can.');
  const lesson: Lesson = existing
    ? {
        ...existing,
        best: Math.max(existing.best, input.score as number),
        attempts: existing.attempts + 1,
        completedAt: existing.completedAt ?? (input.passed ? now : null),
      }
    : { lesson: input.lesson, best: input.score as number, attempts: 1, completedAt: input.passed ? now : null };
  write(store, 'basics', [...lessons.filter((l) => l.lesson !== lesson.lesson), lesson]);
  return { lesson };
};

export const guestRequest = (
  path: string,
  method: string,
  body: unknown,
  store: Store | undefined = browserStore(),
  now = Date.now(),
): unknown => {
  const url = new URL(path, 'http://guest');
  const route = `${method} ${url.pathname}`;
  if (route === 'GET /progress') return { progress: read<Progress>(store, 'progress') };
  if (route === 'POST /progress') return saveAnswers(store, body, now);
  if (route === 'POST /sessions') return saveRound(store, body, now);
  if (route === 'GET /stats') {
    const tz = Number(url.searchParams.get('tz'));
    return stats(store, Number.isFinite(tz) && Math.abs(tz) <= 14 * 60 ? tz : 0, now);
  }
  if (route === 'GET /basics') return { lessons: read<Lesson>(store, 'basics') };
  if (route === 'POST /basics') return saveLesson(store, body, now);
  if (route === 'DELETE /basics') {
    const removed = read<Lesson>(store, 'basics').length;
    store?.removeItem(`${PREFIX}:basics`);
    return { removed };
  }
  throw new GuestError(404, 'This needs an account. Sign in or create one to use it.');
};
