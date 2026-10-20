import type { QuizAnswer, WeakSpots } from './types';

const KEY = 'quizlingo-weak-spots-v1';
export const CLEAR_STREAK = 2;
const MAX_ENTRIES = 60;

export const questionKey = (lesson: string, id: string) => `${lesson}/${id}`;

export const readWeakSpots = (user: string, storage: Pick<Storage, 'getItem'> | undefined = safeStorage()): WeakSpots => {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(`${KEY}:${user}`) ?? '{}');
    return parsed && typeof parsed === 'object' ? (parsed as WeakSpots) : {};
  } catch {
    return {};
  }
};

const write = (user: string, spots: WeakSpots, storage: Pick<Storage, 'setItem'> | undefined): boolean => {
  try {
    storage?.setItem(`${KEY}:${user}`, JSON.stringify(spots));
    return true;
  } catch {
    return false;
  }
};

function safeStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

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
  const kept = Object.entries(spots)
    .sort(([, a], [, b]) => b.at - a.at)
    .slice(0, MAX_ENTRIES);
  const result = Object.fromEntries(kept);
  write(user, result, storage);
  return result;
};

export const weakKeys = (spots: WeakSpots): string[] =>
  Object.entries(spots)
    .sort(([, a], [, b]) => b.misses - a.misses || b.at - a.at)
    .map(([key]) => key);
