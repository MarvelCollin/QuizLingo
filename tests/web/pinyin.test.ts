// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildChart, FINALS, finalOf, INITIALS } from '../../src/features/pinyin/chart';
import type { RawAudioIndex } from '../../src/features/study/types';
import { readData } from '../fixtures';

const recorded = readData<RawAudioIndex>('audio.json').syllables;

describe('pinyin chart', () => {
  it('files a syllable under its true initial and final', () => {
    const cases: [string, string, string][] = [
      ['ba', 'b', 'a'],
      ['zhang', 'zh', 'ang'],
      ['zhi', 'zh', 'i'],
      ['ai', '', 'ai'],
      ['er', '', 'er'],
      ['jiu', 'j', 'iu'],
      ['ju', 'j', 'ü'],
      ['xuan', 'x', 'üan'],
      ['lv', 'l', 'ü'],
      ['lve', 'l', 'üe'],
      ['yi', 'y', 'i'],
      ['you', 'y', 'iu'],
      ['yue', 'y', 'üe'],
      ['yong', 'y', 'iong'],
      ['wu', 'w', 'u'],
      ['wei', 'w', 'ui'],
      ['wen', 'w', 'un'],
    ];
    for (const [base, initial, final] of cases) expect(finalOf(base), base).toEqual({ initial, final });
  });

  it('places every recorded syllable on the chart', () => {
    const chart = buildChart(recorded);
    const bases = new Set([...recorded].map((name) => name.slice(0, -1)));
    const placed = new Set(chart.cells.values());
    const lost = [...bases].filter((base) => !placed.has(base));
    expect(lost).toEqual([]);
  });

  it('uses only known rows and columns and one syllable per cell', () => {
    const chart = buildChart(recorded);
    expect(chart.initials.every((initial) => INITIALS.includes(initial))).toBe(true);
    expect(chart.finals.every((final) => FINALS.includes(final))).toBe(true);
    expect(chart.cells.size).toBe(new Set(chart.cells.values()).size);
  });

  it('knows which tones each syllable has', () => {
    const chart = buildChart(['ma1', 'ma2', 'ma5', 'ba4', 'x']);
    expect([...chart.tones.get('ma')!].sort()).toEqual([1, 2, 5]);
    expect(chart.tones.has('x')).toBe(false);
  });
});
