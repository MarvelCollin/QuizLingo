import type { QuizAnswer, WeakSpots } from './types';

const KEY = 'quizlingo-weak-spots-v1';
// Two right answers in a row clear a weak spot
export const CLEAR_STREAK = 2;
const MAX_ENTRIES = 60;

export const questionKey = (lesson: string, id: string) => `${lesson}/${id}`;

// Storage can be missing or full, for instance in a private window, and the app must work without it
// Each account on a shared browser keeps its own list, filed under the user id
export const readWeakSpots = (user: string, storage: Pick<Storage, 'getItem'> | undefined = safeStorage()): WeakSpots => {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(`${KEY}:${user}`) ?? '{}');
    return parsed && typeof parsed === 'object' ? (parsed as WeakSpots) : {};
  } catch {
    return {};
  }
};

const write = (user: string, spots: WeakSpots, storage: Pick<Storage, 'setItem'> | undefined) => {
  try {
    storage?.setItem(`${KEY}:${user}`, JSON.stringify(spots));
  } catch {
    // Nothing to do. Weak spots are a convenience.
  }
};

function safeStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

// Files each answer: a miss adds the question, a right answer moves it toward being cleared
export const recordAnswers = (
  user: string,
  answers: QuizAnswer[],
  now = Date.now(),
  storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = safeStorage(),
): WeakSpots => {
  const spots = readWeakSpots(user, storage);
  for (const { question, chosen } of answers) {
    if (!question.lesson) continue;
    const key = questionKey(question.lesson, question.id);
    const isRight = question.options[chosen].isCorrect;
    const entry = spots[key];
    if (!isRight) spots[key] = { misses: (entry?.misses ?? 0) + 1, streak: 0, at: now };
    else if (entry) {
      if (entry.streak + 1 >= CLEAR_STREAK) delete spots[key];
      else spots[key] = { ...entry, streak: entry.streak + 1 };
    }
  }
  // Keep the most recent entries if the list ever grows large
  const kept = Object.entries(spots)
    .sort(([, a], [, b]) => b.at - a.at)
    .slice(0, MAX_ENTRIES);
  const result = Object.fromEntries(kept);
  write(user, result, storage);
  return result;
};

// Question keys with the most misses first
export const weakKeys = (spots: WeakSpots): string[] =>
  Object.entries(spots)
    .sort(([, a], [, b]) => b.misses - a.misses || b.at - a.at)
    .map(([key]) => key);
