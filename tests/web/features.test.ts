import { describe, expect, it } from 'vitest';
import { applyCharacterFilters, filtersFromParams, filtersToParams } from '../../src/features/characters/filters';
import { compareSpeech, PASS_SCORE } from '../../src/features/speaking/recognition';
import type { Hanzi } from '../../src/features/study/types';
import { buildMockPaper } from '../../src/features/tests/build-mock';
import { MOCK_FORMATS } from '../../src/features/tests/mock-format';
import { isAnswered, isRight, scoreSections } from '../../src/features/tests/mock-score';
import type { MockAnswer } from '../../src/features/tests/mock-types';
import { toneItemsFor } from '../../src/features/tones/build-tone-items';
import { LEVELS } from '../../src/features/vocabulary/constants';
import { word } from '../fixtures';
import { loadSentences, loadWords, readData } from '../fixtures';
import type { ListeningTest } from '../../src/features/tests/types';

const hanzi: Hanzi[] = [
  { char: '好', level: 1, writeLevel: 2, pinyin: 'hǎo', numeric: 'hao3', meanings: ['good'], words: ['好'] },
  { char: '经', level: 4, writeLevel: 0, pinyin: 'jīng', numeric: 'jing1', meanings: ['to pass through'], words: ['经济'] },
];

describe('character filters', () => {
  it('round trips through the URL', () => {
    const filters = filtersFromParams(new URLSearchParams('q=good&level=4&write=1&page=2'));
    expect(filters).toEqual({ q: 'good', level: '4', isWriteOnly: true, page: 2 });
    expect(filtersToParams(filters).toString()).toBe('q=good&level=4&write=1&page=2');
  });

  it('searches by character, pinyin and meaning, and filters by level and writing', () => {
    const base = { q: '', level: 'all' as const, isWriteOnly: false, page: 1 };
    expect(applyCharacterFilters(hanzi, { ...base, q: 'hao' })).toHaveLength(1);
    expect(applyCharacterFilters(hanzi, { ...base, q: 'pass' })[0].char).toBe('经');
    expect(applyCharacterFilters(hanzi, { ...base, isWriteOnly: true })[0].char).toBe('好');
    expect(applyCharacterFilters(hanzi, { ...base, level: '4' })[0].char).toBe('经');
  });
});

describe('speech matching', () => {
  it('scores a perfect reading at 100 and ignores punctuation', () => {
    expect(compareSpeech('我喜欢学习。', '我喜欢学习').score).toBe(100);
  });

  it('marks characters that were not heard', () => {
    const result = compareSpeech('我喜欢学习', '我喜欢');
    expect(result.score).toBeLessThan(PASS_SCORE);
    expect(result.marks.filter((m) => !m.isHeard).map((m) => m.char)).toEqual(['学', '习']);
  });

  it('gives no score for silence', () => {
    expect(compareSpeech('你好', '').score).toBe(0);
  });
});

describe('tone items', () => {
  const words = [word('好看', 1, 'hǎokàn', 'good-looking', 'hao3 kan4'), word('妈', 1, 'mā', 'mum', 'ma1')];
  const audio = { words: new Set(['好看']), syllables: new Set(['hao3', 'kan4', 'ma1']) };

  it('builds single syllables only when a recording exists', () => {
    const items = toneItemsFor(words, audio, 'syllable', 1);
    expect(items.map((i) => i.sound).sort()).toEqual(['hao3', 'kan4', 'ma1']);
    for (const item of items) {
      expect(item.options).toHaveLength(4);
      expect(item.options.filter((o) => o.isCorrect)).toHaveLength(1);
    }
  });

  it('builds basics from every recorded syllable with the tone marks in tone order', () => {
    const items = toneItemsFor(words, { ...audio, syllables: new Set([...audio.syllables, 'lv3']) }, 'basic', 4);
    expect(items.map((i) => i.sound).sort()).toEqual(['hao3', 'kan4', 'lv3', 'ma1']);
    const lv = items.find((i) => i.sound === 'lv3')!;
    expect(lv.prompt).toBe('lü');
    expect(lv.answer).toBe('lǚ');
    expect(lv.options.findIndex((o) => o.isCorrect)).toBe(2);
    expect(items.find((i) => i.sound === 'ma1')?.hanzi).toBe('妈');
  });

  it('builds tone pairs from recorded two character words', () => {
    const [pair] = toneItemsFor(words, audio, 'pair', 1);
    expect(pair.answer).toBe('hǎo kàn');
    expect(pair.options.find((o) => o.isCorrect)?.label).toBe('hǎo kàn');
    expect(new Set(pair.options.map((o) => o.label)).size).toBe(4);
  });
});

describe('mock tests', () => {
  const words = loadWords();

  it('follow the HSK 3.0 layout and fill every part at every level', () => {
    for (const level of LEVELS) {
      const tests = readData<Omit<ListeningTest, 'level'>[]>(`listening-${level}.json`).map((t) => ({ ...t, level }));
      const paper = buildMockPaper(level, loadSentences(level), words, tests);
      const format = MOCK_FORMATS[level];
      expect(paper.sections.map((s) => s.key)).toEqual(format.sections.map((s) => s.key));
      paper.sections.forEach((section, i) => {
        expect(section.items, `HSK ${level} ${section.label}`).toHaveLength(format.sections[i].count);
        for (const item of section.items) {
          if (item.kind === 'choice') {
            expect(item.answer).toBeGreaterThanOrEqual(0);
            expect(item.answer).toBeLessThan(item.options.length);
            expect(new Set(item.options).size).toBe(item.options.length);
          } else {
            expect([...item.pieces.join('')].sort().join('')).toBe([...item.target].sort().join(''));
          }
        }
      });
      expect(new Set(paper.sections.flatMap((s) => s.items.map((i) => i.id))).size).toBe(paper.sections.reduce((n, s) => n + s.items.length, 0));
    }
  });

  it('score each part out of 100', () => {
    const tests = readData<Omit<ListeningTest, 'level'>[]>('listening-1.json').map((t) => ({ ...t, level: 1 as const }));
    const paper = buildMockPaper(1, loadSentences(1), words, tests);
    const perfect: MockAnswer[][] = paper.sections.map((s) =>
      s.items.map((item) => (item.kind === 'choice' ? item.answer : item.target.split('').map((_, i) => i))),
    );
    const blank: MockAnswer[][] = paper.sections.map((s) => s.items.map(() => null));
    const choicePerfect = perfect.map((list, s) => list.map((a, i) => (paper.sections[s].items[i].kind === 'choice' ? a : null)));
    expect(scoreSections(paper, blank).every((r) => r.points === 0)).toBe(true);
    expect(scoreSections(paper, choicePerfect).every((r) => r.points === 100)).toBe(true);
    expect(isAnswered(null)).toBe(false);
    expect(isAnswered([])).toBe(false);
    expect(isAnswered(2)).toBe(true);
  });

  it('marks word order answers right only in the original order', () => {
    const item = { kind: 'order' as const, id: 'o', instruction: '', english: '', pieces: ['学习', '我', '喜欢'], target: '我喜欢学习', explanation: '', transcript: '' };
    expect(isRight(item, [1, 2, 0])).toBe(true);
    expect(isRight(item, [0, 1, 2])).toBe(false);
  });
});
