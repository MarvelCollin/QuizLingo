const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

export const INTERVALS = [10 * MINUTE, 1 * DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];
export const MAX_BOX = INTERVALS.length - 1;
export const MASTERED_BOX = 4;

export type Review = { box: number; dueAt: number };

export const review = (box: number, correct: boolean, now: number): Review => {
  const next = correct ? Math.min(box + 1, MAX_BOX) : 0;
  return { box: next, dueAt: now + INTERVALS[next] };
};
