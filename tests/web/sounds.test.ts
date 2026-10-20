// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { pickRound, soundItemsFor } from '../../src/features/sounds/build-sound-items';
import { SOUND_GROUPS } from '../../src/features/sounds/pairs';
import type { RawAudioIndex } from '../../src/features/study/types';
import { markTone, splitSyllable } from '../../src/features/vocabulary/pinyin';
import { readData } from '../fixtures';

const recorded = new Set(readData<RawAudioIndex>('audio.json').syllables);

describe('sound pairs', () => {
  it('has plenty of recordings for every group', () => {
    for (const group of SOUND_GROUPS) expect(soundItemsFor(group, recorded).length, group.id).toBeGreaterThan(20);
  });

  it('asks about a recording that exists and offers it next to a different syllable', () => {
    for (const group of SOUND_GROUPS) {
      for (const item of soundItemsFor(group, recorded)) {
        expect(recorded.has(item.sound), item.key).toBe(true);
        expect(item.options).toHaveLength(2);
        const right = item.options.filter((o) => o.isCorrect);
        expect(right).toHaveLength(1);
        expect(right[0].label).toBe(item.answer);
        const parts = splitSyllable(item.sound)!;
        expect(markTone(parts.base, parts.tone)).toBe(item.answer);
        expect(new Set(item.options.map((o) => o.label)).size).toBe(2);
        expect(item.tip.length).toBeGreaterThan(10);
      }
    }
  });

  it('never repeats a recording in one round and keeps its length', () => {
    for (const group of SOUND_GROUPS) {
      const round = pickRound(soundItemsFor(group, recorded), 15);
      expect(round).toHaveLength(15);
      expect(new Set(round.map((item) => item.key)).size).toBe(15);
    }
  });

  it('returns what it has when a round is longer than the pool', () => {
    expect(pickRound([], 15)).toEqual([]);
  });
});
