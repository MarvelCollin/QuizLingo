import { describe, expect, it } from 'vitest';
import { buildWeakQuiz } from '../../src/features/basics/build-lesson';
import type { QuizAnswer, QuizQuestion } from '../../src/features/basics/types';
import { CLEAR_STREAK, readWeakSpots, recordAnswers, weakKeys } from '../../src/features/basics/weak-spots';
import type { RawAudioIndex } from '../../src/features/study/types';
import { loadWords, readData } from '../fixtures';

const memory = () => {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => void data.set(key, value) };
};

const answer = (lesson: string, id: string, isRight: boolean): QuizAnswer => {
  const question: QuizQuestion = {
    id,
    lesson,
    prompt: 'p',
    options: [
      { label: 'right', isCorrect: true },
      { label: 'wrong', isCorrect: false },
    ],
  };
  return { question, chosen: isRight ? 0 : 1 };
};

describe('weak spots', () => {
  it('files a miss, counts repeats and clears after right answers in a row', () => {
    const store = memory();
    recordAnswers('u1', [answer('tones-1', 'h1', false)], 1, store);
    recordAnswers('u1', [answer('tones-1', 'h1', false)], 2, store);
    expect(readWeakSpots('u1', store)['tones-1/h1']).toMatchObject({ misses: 2, streak: 0 });

    for (let i = 0; i < CLEAR_STREAK - 1; i++) recordAnswers('u1', [answer('tones-1', 'h1', true)], 3 + i, store);
    expect(readWeakSpots('u1', store)['tones-1/h1']).toMatchObject({ streak: CLEAR_STREAK - 1 });
    recordAnswers('u1', [answer('tones-1', 'h1', true)], 9, store);
    expect(readWeakSpots('u1', store)).toEqual({});
  });

  it('resets the run when a cleared-to-be question is missed again', () => {
    const store = memory();
    recordAnswers('u1', [answer('tones-1', 'h1', false)], 1, store);
    recordAnswers('u1', [answer('tones-1', 'h1', true)], 2, store);
    recordAnswers('u1', [answer('tones-1', 'h1', false)], 3, store);
    expect(readWeakSpots('u1', store)['tones-1/h1']).toMatchObject({ misses: 2, streak: 0 });
  });

  it('ignores right answers to questions that were never missed', () => {
    const store = memory();
    expect(recordAnswers('u1', [answer('tones-1', 'h1', true)], 1, store)).toEqual({});
  });

  it('keeps one list per account', () => {
    const store = memory();
    recordAnswers('u1', [answer('tones-1', 'h1', false)], 1, store);
    expect(readWeakSpots('u2', store)).toEqual({});
  });

  it('puts the questions missed most first', () => {
    const store = memory();
    recordAnswers('u1', [answer('a', '1', false), answer('b', '2', false)], 1, store);
    recordAnswers('u1', [answer('b', '2', false)], 2, store);
    expect(weakKeys(readWeakSpots('u1', store))).toEqual(['b/2', 'a/1']);
  });

  it('works when storage is missing or holds junk', () => {
    expect(readWeakSpots('u1', undefined)).toEqual({});
    expect(readWeakSpots('u1', { getItem: () => 'not json' })).toEqual({});
    expect(recordAnswers('u1', [answer('a', '1', false)], 1, undefined)).toHaveProperty('a/1');
  });

  it('skips answers that do not know their lesson', () => {
    const store = memory();
    const loose = answer('x', 'y', false);
    delete loose.question.lesson;
    expect(recordAnswers('u1', [loose], 1, store)).toEqual({});
  });

  it('keeps only the most recent entries once the list is long', () => {
    const store = memory();
    const many = Array.from({ length: 80 }, (_, i) => answer('tones-1', `q${i}`, false));
    expect(Object.keys(recordAnswers('u1', many, 5, store)).length).toBeLessThanOrEqual(60);
  });
});

describe('weak quiz', () => {
  const ctx = { vocabulary: loadWords(), audioWords: new Set(readData<RawAudioIndex>('audio.json').words) };

  it('rebuilds the questions that were missed and skips ones that no longer exist', () => {
    const questions = buildWeakQuiz(['tones-1/h1', 'words-1/w-你好', 'nope-1/x', 'tones-1/gone'], ctx);
    expect(questions.map((q) => q.id)).toEqual(['h1', 'w-你好']);
    for (const q of questions) expect(q.options.filter((o) => o.isCorrect)).toHaveLength(1);
    expect(questions[0].lesson).toBe('tones-1');
  });

  it('ties a word question to the review schedule', () => {
    const [question] = buildWeakQuiz(['words-2/w-三'], ctx);
    expect(question.srsWord).toBe('三');
  });
});
