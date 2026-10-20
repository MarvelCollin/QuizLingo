import { describe, expect, it } from 'vitest';
import { buildQuestion } from '../../src/features/practice/build-question';
import { buildSentenceQuestion, hasSentence } from '../../src/features/practice/build-sentence-question';
import { pickRoundWords, wordsForMode, wordsInLevel, wordsInSet } from '../../src/features/practice/pick-words';
import { configFromParams, configToSearch, highestLevel } from '../../src/features/practice/round-config';
import type { WordProgress } from '../../src/features/progress/types';
import { buildSentenceIndex, isWordToken } from '../../src/features/study/api';
import { sentence, word } from '../fixtures';

const pool = [
  word('你', 1, 'nǐ', 'you'),
  word('好', 1, 'hǎo', 'good'),
  word('我', 1, 'wǒ', 'I'),
  word('他', 1, 'tā', 'he'),
  word('她', 1, 'tā', 'she'),
  word('学习', 1, 'xuéxí', 'to study'),
  word('老师', 1, 'lǎoshī', 'teacher'),
  word('学生', 1, 'xuésheng', 'student'),
  word('喜欢', 1, 'xǐhuan', 'to like'),
  word('经济', 4, 'jīngjì', 'economy'),
];

const index = buildSentenceIndex([
  sentence(1, ['我', '喜欢', '学习', '。'], 'I like studying.'),
  sentence(2, ['你', '好', '！'], 'Hello!'),
  sentence(3, ['老师', '喜欢', '学生', '。'], 'The teacher likes the students.'),
  sentence(4, ['他', '是', '老师', '。'], 'He is a teacher.'),
  sentence(5, ['我', '是', '学生', '。'], 'I am a student.'),
]);

describe('buildQuestion', () => {
  it('has four options with exactly one right answer', () => {
    for (const mode of ['meaning', 'pinyin', 'listening'] as const) {
      const question = buildQuestion(pool[5], mode, pool);
      expect(question.options).toHaveLength(4);
      expect(question.options.filter((o) => o.isCorrect)).toHaveLength(1);
      expect(new Set(question.options.map((o) => o.label)).size).toBe(4);
    }
  });

  it('never offers a word that sounds the same in listening mode', () => {
    for (let i = 0; i < 20; i++) {
      const question = buildQuestion(pool[3], 'listening', pool);
      expect(question.options.map((o) => o.label)).not.toContain('她');
    }
  });

  it('has no options for flashcards', () => {
    expect(buildQuestion(pool[0], 'flashcard', pool).options).toEqual([]);
  });
});

describe('sentence questions', () => {
  it('tells which words have a sentence', () => {
    expect(hasSentence(pool[8], 'reading', index)).toBe(true);
    expect(hasSentence(pool[9], 'reading', index)).toBe(false);
    expect(isWordToken('。')).toBe(false);
    expect(isWordToken('学习')).toBe(true);
  });

  it('builds reading questions with the right translation among the options', () => {
    const question = buildSentenceQuestion(pool[8], 'reading', pool, index)!;
    const right = question.options.filter((o) => o.isCorrect);
    expect(right).toHaveLength(1);
    expect(right[0].label).toBe(question.sentence.english);
    expect(question.sentence.tokens).toContain('喜欢');
  });

  it('builds gap questions whose right option is the hidden word', () => {
    const question = buildSentenceQuestion(pool[5], 'gap', pool, index)!;
    expect(question.options.find((o) => o.isCorrect)?.label).toBe('学习');
  });

  it('shuffles word order pieces so they do not already form the sentence', () => {
    const question = buildSentenceQuestion(pool[6], 'order', pool, index)!;
    const target = question.sentence.tokens.filter(isWordToken);
    expect([...question.pieces].sort()).toEqual([...target].sort());
    expect(question.pieces.join('')).not.toBe(target.join(''));
  });

  it('keeps only words with a sentence for sentence modes', () => {
    expect(wordsForMode(pool, 'reading', index).map((w) => w.hanzi)).not.toContain('经济');
    expect(wordsForMode(pool, 'flashcard', index)).toHaveLength(pool.length);
    expect(wordsForMode(pool, 'reading', undefined)).toEqual([]);
  });
});

describe('picking round words', () => {
  const now = Date.now();
  const progress = new Map<string, WordProgress>([
    ['你', { word: '你', level: 1, box: 1, correct: 1, wrong: 0, dueAt: now - 1000, lastSeenAt: now }],
    ['好', { word: '好', level: 1, box: 2, correct: 2, wrong: 0, dueAt: now + 86400000, lastSeenAt: now }],
  ]);

  it('filters by level', () => {
    expect(wordsInLevel(pool, '4').map((w) => w.hanzi)).toEqual(['经济']);
    expect(wordsInLevel(pool, 'all')).toHaveLength(pool.length);
  });

  it('separates due and new words', () => {
    expect(wordsInSet(pool, 'due', progress, now).map((w) => w.hanzi)).toEqual(['你']);
    expect(wordsInSet(pool, 'new', progress, now)).toHaveLength(pool.length - 2);
  });

  it('respects the round size', () => {
    const words = pickRoundWords(pool, { mode: 'flashcard', set: 'all', level: '1', size: '10' }, progress, now);
    expect(words).toHaveLength(9);
  });
});

describe('round config in the URL', () => {
  it('reads and writes every option', () => {
    const config = configFromParams(new URLSearchParams('mode=order&set=due&level=7&size=20'));
    expect(config).toEqual({ mode: 'order', set: 'due', level: '7', size: '20' });
    expect(configToSearch(config)).toBe('?mode=order&set=due&level=7&size=20');
  });

  it('falls back to defaults for unknown values', () => {
    expect(configFromParams(new URLSearchParams('mode=hack&level=10'))).toEqual({ mode: 'flashcard', set: 'new', level: '1', size: '10' });
  });

  it('maps a level filter to the highest level it needs', () => {
    expect(highestLevel('all')).toBe(7);
    expect(highestLevel('3')).toBe(3);
  });
});
