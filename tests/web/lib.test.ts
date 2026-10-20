import { describe, expect, it } from 'vitest';
import { percent, plural, timeAgo } from '../../src/lib/format';
import { shuffle } from '../../src/lib/random';
import { levelLabel, LEVELS } from '../../src/features/vocabulary/constants';
import { markTone, plainPinyin, splitSyllable } from '../../src/features/vocabulary/pinyin';

describe('format helpers', () => {
  it('rounds percentages and guards against division by zero', () => {
    expect(percent(1, 3)).toBe(33);
    expect(percent(5, 0)).toBe(0);
  });

  it('pluralises with thousands separators', () => {
    expect(plural(1, 'word')).toBe('1 word');
    expect(plural(1579, 'word')).toBe('1,579 words');
  });

  it('describes recent times relative to now', () => {
    const now = Date.now();
    expect(timeAgo(now - 5 * 60000, now)).toBe('5 minutes ago');
    expect(timeAgo(now - 3 * 3600000, now)).toBe('3 hours ago');
    expect(timeAgo(now - 2 * 86400000, now)).toBe('2 days ago');
  });
});

describe('shuffle', () => {
  it('keeps every item and does not change the input', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const output = shuffle(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...output].sort()).toEqual(input);
  });
});

describe('levels', () => {
  it('covers HSK 1 to 9 with band 7-9 as level 7', () => {
    expect(LEVELS).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(levelLabel(3)).toBe('HSK 3');
    expect(levelLabel(7)).toBe('HSK 7-9');
  });
});

describe('pinyin helpers', () => {
  it('matches pinyin with or without tones and spaces', () => {
    expect(plainPinyin('nǐ hǎo')).toBe('nihao');
    expect(plainPinyin('Nǚ’ér')).toBe('nuer');
  });

  it('puts the tone mark on the right vowel', () => {
    expect(markTone('hao', 3)).toBe('hǎo');
    expect(markTone('xue', 2)).toBe('xué');
    expect(markTone('gou', 4)).toBe('gòu');
    expect(markTone('liu', 2)).toBe('liú');
    expect(markTone('lv', 4)).toBe('lǜ');
    expect(markTone('ma', 5)).toBe('ma');
  });

  it('splits numeric syllables', () => {
    expect(splitSyllable('hao3')).toEqual({ base: 'hao', tone: 3 });
    expect(splitSyllable('lu:4')).toEqual({ base: 'lv', tone: 4 });
    expect(splitSyllable('not pinyin')).toBeNull();
  });
});
