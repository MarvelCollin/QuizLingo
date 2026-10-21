import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { RawAudioIndex, RawHanzi, RawSentence } from '../../src/features/study/types';
import type { RawWord } from '../../src/features/vocabulary/types';
import { DATA, readData } from '../fixtures';

const LEVELS = [1, 2, 3, 4, 5, 6, 7];
const words = readData<RawWord[]>('words.min.json');
const levelOf = new Map(words.map((w) => [w.s, w.l]));

describe('word list', () => {
  it('has every HSK 3.0 level with the syllabus word counts', () => {
    const perLevel = LEVELS.map((l) => words.filter((w) => w.l === l).length);
    expect(perLevel).toEqual([300, 197, 491, 990, 1579, 1777, 5562]);
    expect(words).toHaveLength(10896);
    expect(new Set(words.map((w) => w.s)).size).toBe(words.length);
  });

  it('gives every word a reading with pinyin, numeric pinyin and a meaning', () => {
    for (const w of words) {
      expect(w.f.length, w.s).toBeGreaterThan(0);
      for (const form of w.f) {
        expect(form.i.y, w.s).toBeTruthy();
        expect(form.i.n, w.s).toBeTruthy();
        expect(form.m.length, w.s).toBeGreaterThan(0);
      }
    }
  });
});

describe('example sentences', () => {
  it('are split into words that rebuild the sentence and stay within their level', () => {
    let total = 0;
    for (const level of LEVELS) {
      const sentences = readData<RawSentence[]>(`sentences-${level}.min.json`);
      total += sentences.length;
      for (const s of sentences) {
        expect(s.w.join(''), String(s.i)).toBe(s.z);
        expect(s.p).toHaveLength(s.w.length);
        expect(s.l).toBe(level);
        expect(s.e.length).toBeGreaterThan(0);
        for (const token of s.w) {
          if (levelOf.has(token)) expect(levelOf.get(token)!, `${s.z} ${token}`).toBeLessThanOrEqual(level);
        }
      }
    }
    expect(total).toBeGreaterThan(10000);
  });
});

describe('characters', () => {
  const hanzi = readData<RawHanzi[]>('hanzi.min.json');

  it('lists 3,088 characters with 1,200 to write', () => {
    expect(hanzi).toHaveLength(3088);
    expect(hanzi.filter((h) => h.x > 0)).toHaveLength(1200);
    expect(LEVELS.map((l) => hanzi.filter((h) => h.l === l).length)).toEqual([246, 125, 284, 441, 431, 413, 1148]);
    expect(LEVELS.map((l) => hanzi.filter((h) => h.x === l).length)).toEqual([0, 100, 150, 150, 150, 150, 500]);
  });

  it('gives every character a reading, a meaning and stroke data', () => {
    const strokes = new Set(readdirSync(join(DATA, 'strokes')));
    for (const h of hanzi) {
      expect(h.y, h.c).toBeTruthy();
      expect(h.m.length, h.c).toBeGreaterThan(0);
      expect(strokes.has(`${h.c}.json`), h.c).toBe(true);
    }
    expect(strokes.has('ARPHICPL.TXT')).toBe(true);
  });
});

describe('recordings', () => {
  const audio = readData<RawAudioIndex>('audio.json');
  const folder = join(process.cwd(), 'public', 'audio');

  it('has a file on disk for every listed word and syllable', () => {
    expect(audio.words.length).toBeGreaterThan(6000);
    for (const w of audio.words) expect(existsSync(join(folder, 'words', `${w}.mp3`)), w).toBe(true);
    for (const s of audio.syllables) expect(existsSync(join(folder, 'syllables', `${s}.mp3`)), s).toBe(true);
    for (const w of audio.words) expect(levelOf.has(w), w).toBe(true);
  });
});

type ListeningFile = {
  id: string;
  title: string;
  lines: { speaker: string; zh: string; py: string; en: string }[];
  questions: { prompt: string; options: string[]; answer: number; line: number; explanation: string }[];
}[];

describe('listening tests', () => {
  it('have valid scripts and questions at every level', () => {
    const ids = new Set<string>();
    for (const level of LEVELS) {
      const tests = readData<ListeningFile>(`listening-${level}.json`);
      expect(tests.length, `HSK ${level}`).toBeGreaterThanOrEqual(4);
      for (const test of tests) {
        expect(test.id.startsWith(`l${level}-`)).toBe(true);
        expect(ids.has(test.id)).toBe(false);
        ids.add(test.id);
        for (const line of test.lines) {
          expect(['男', '女', '旁白']).toContain(line.speaker);
          expect(line.zh && line.py && line.en, test.id).toBeTruthy();
        }
        for (const q of test.questions) {
          expect(q.options.length).toBeGreaterThanOrEqual(3);
          expect(new Set(q.options).size).toBe(q.options.length);
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThan(q.options.length);
          expect(q.line).toBeGreaterThanOrEqual(0);
          expect(q.line).toBeLessThan(test.lines.length);
          expect(q.explanation.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

type GrammarFile = { id: string; point: string; title: string; explanation: string; examples: { zh: string; py: string; en: string }[] }[];

describe('grammar notes', () => {
  it('cover every syllabus grammar point with two examples', () => {
    const counts = LEVELS.map((level) => {
      const points = readData<GrammarFile>(`grammar-${level}.json`);
      points.forEach((p, i) => {
        expect(p.id).toBe(`g${level}-${String(i + 1).padStart(3, '0')}`);
        expect((p.point || (p as { detail?: string }).detail) && p.title && p.explanation, p.id).toBeTruthy();
        expect(p.examples, p.id).toHaveLength(2);
        for (const e of p.examples) expect(e.zh && e.py && e.en, p.id).toBeTruthy();
      });
      return points.length;
    });
    expect(counts).toEqual([70, 78, 96, 95, 70, 50, 134]);
  });
});
