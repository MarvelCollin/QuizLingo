import type { WordProgress } from '../progress/types';
import type { Word } from '../vocabulary/types';

export const RETRY_GAP = 3;
export const SPACING_GAP = 5;
export const SESSION_GOAL = 2;

export type SessionState = {
  queue: Word[];
  total: number;
  streaks: Map<string, number>;
  misses: Map<string, number>;
  fresh: Set<string>;
  done: Word[];
  attempts: number;
};

export const startSession = (words: Word[], progress: Map<string, WordProgress>): SessionState => ({
  queue: words,
  total: words.length,
  streaks: new Map(),
  misses: new Map(),
  fresh: new Set(words.filter((w) => (progress.get(w.hanzi)?.box ?? 0) === 0).map((w) => w.hanzi)),
  done: [],
  attempts: 0,
});

const insertAt = (queue: Word[], word: Word, gap: number) => {
  const at = Math.min(gap, queue.length);
  return [...queue.slice(0, at), word, ...queue.slice(at)];
};

export const goalFor = (state: SessionState, word: Word) =>
  state.fresh.has(word.hanzi) || state.misses.has(word.hanzi) ? SESSION_GOAL : 1;

export const afterAnswer = (state: SessionState, isCorrect: boolean): SessionState => {
  const [word, ...rest] = state.queue;
  if (!word) return state;
  const key = word.hanzi;
  const streak = isCorrect ? (state.streaks.get(key) ?? 0) + 1 : 0;
  const misses = isCorrect ? state.misses : new Map(state.misses).set(key, (state.misses.get(key) ?? 0) + 1);
  const next = { ...state, streaks: new Map(state.streaks).set(key, streak), misses, attempts: state.attempts + 1 };
  if (!isCorrect) return { ...next, queue: insertAt(rest, word, RETRY_GAP) };
  if (streak >= goalFor(next, word)) return { ...next, queue: rest, done: [...state.done, word] };
  return { ...next, queue: insertAt(rest, word, SPACING_GAP) };
};
