import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pinyin } from 'pinyin-pro';
import { describe, expect, it } from 'vitest';
import { ALL_LESSONS, checkpointOf, STAGES } from '../../src/features/basics/curriculum';
import type { LearnCard, QuestionSeed } from '../../src/features/basics/types';
import type { RawAudioIndex } from '../../src/features/study/types';
import type { RawWord } from '../../src/features/vocabulary/types';
import { DATA, readData } from '../fixtures';

const audio = readData<RawAudioIndex>('audio.json');
const syllables = new Set(audio.syllables);

const staticLessons = ALL_LESSONS.flatMap((lesson) => (lesson.source.kind === 'static' ? [lesson] : []));
const cards = (): LearnCard[] =>
  ALL_LESSONS.flatMap((lesson) => (lesson.source.kind === 'static' || lesson.source.kind === 'pairs' ? lesson.source.cards : []));
const seeds = (): QuestionSeed[] => staticLessons.flatMap((lesson) => (lesson.source.kind === 'static' ? lesson.source.questions : []));

describe('starter path structure', () => {
  it('gives every lesson a unique id and ends each stage with its milestone', () => {
    const ids = ALL_LESSONS.map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const stage of STAGES) {
      expect(checkpointOf(stage).source.kind).toBe('checkpoint');
      expect(stage.lessons.filter((lesson) => lesson.source.kind === 'checkpoint')).toHaveLength(1);
      const [check] = stage.lessons.slice(-1);
      if (check.source.kind !== 'checkpoint') throw new Error('milestone missing');
      const others = stage.lessons.slice(0, -1).map((lesson) => lesson.id);
      expect(check.source.from).toEqual(others);
    }
  });

  it('writes lesson ids that the server accepts', () => {
    for (const lesson of ALL_LESSONS) expect(lesson.id).toMatch(/^[a-z0-9-]{1,40}$/);
  });

  it('keeps semicolons and em dashes out of every sentence a learner reads', () => {
    const text = JSON.stringify(STAGES);
    expect(text).not.toMatch(/;|—/);
  });
});

describe('starter path questions', () => {
  it('has a wrong answer that differs from the right one in every static question', () => {
    for (const q of seeds()) {
      expect(q.wrong.length, q.id).toBeGreaterThanOrEqual(1);
      expect(q.wrong, q.id).not.toContain(q.answer);
      expect(new Set(q.wrong).size, q.id).toBe(q.wrong.length);
    }
  });

  it('gives each static lesson enough questions to pass or miss', () => {
    for (const lesson of staticLessons) {
      if (lesson.source.kind !== 'static') continue;
      expect(lesson.source.questions.length, lesson.id).toBeGreaterThanOrEqual(4);
      expect(new Set(lesson.source.questions.map((q) => q.id)).size, lesson.id).toBe(lesson.source.questions.length);
    }
  });
});

describe('starter path data', () => {
  it('only plays syllables that have a recording', () => {
    const used = [...cards().map((c) => c.sound), ...seeds().map((q) => q.sound)].filter((s): s is string => Boolean(s));
    expect(used.length).toBeGreaterThan(100);
    const missing = used.filter((sound) => !syllables.has(sound) || !existsSync(join(process.cwd(), 'public', 'audio', 'syllables', `${sound}.mp3`)));
    expect(missing).toEqual([]);
  });

  it('animates only characters that have stroke data', () => {
    const chars = cards().flatMap((c) => (c.strokeChar ? [c.strokeChar] : []));
    expect(chars.length).toBeGreaterThan(10);
    expect(chars.filter((char) => !existsSync(join(DATA, 'strokes', `${char}.json`)))).toEqual([]);
  });

  it('teaches only HSK 1 words that exist in the word list', () => {
    const level1 = new Set(readData<RawWord[]>('words.min.json').filter((w) => w.l === 1).map((w) => w.s));
    const taught = ALL_LESSONS.flatMap((lesson) => (lesson.source.kind === 'words' ? lesson.source.words.map((w) => w.hanzi) : []));
    expect(taught.length).toBeGreaterThanOrEqual(50);
    expect(taught.filter((hanzi) => !level1.has(hanzi))).toEqual([]);
  });

  it('never repeats a gloss inside one word lesson, so no question has two right answers', () => {
    for (const lesson of ALL_LESSONS) {
      if (lesson.source.kind !== 'words') continue;
      const glosses = lesson.source.words.map((w) => w.gloss);
      expect(new Set(glosses).size, lesson.id).toBe(glosses.length);
    }
  });
});

describe('starter path sentences', () => {
  const lines = () =>
    ALL_LESSONS.flatMap((lesson) =>
      lesson.source.kind === 'static' && lesson.id.startsWith('sentences-')
        ? lesson.source.cards.map((card) => ({ zh: card.title, pinyin: card.subtitle ?? '' }))
        : [],
    );

  it('uses only characters that appear in HSK 1 words', () => {
    const known = new Set(
      readData<RawWord[]>('words.min.json')
        .filter((w) => w.l === 1)
        .flatMap((w) => [...w.s]),
    );
    const outside = lines().flatMap(({ zh }) => [...zh].filter((char) => !/[！？，。]/.test(char) && !known.has(char)));
    expect(lines().length).toBeGreaterThanOrEqual(20);
    expect(outside).toEqual([]);
  });

  it('spells every sentence the way a dictionary does, apart from changing tones and neutral syllables', () => {
    const letters = (text: string) => text.toLowerCase().replace(/[^a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/g, '');
    const bare = (char: string) => char.normalize('NFD').replace(/[̀-ͯ]/g, '');
    // 不 and 一 are written as they are said, and a neutral syllable has no mark where a dictionary gives one
    const base = (text: string) => letters(text.replace(/yí|yì/g, 'yī').replace(/bú/g, 'bù'));
    for (const { zh, pinyin: written } of lines()) {
      const expected = letters(pinyin(zh, { toneType: 'symbol', toneSandhi: false, type: 'string' }));
      const mine = base(written);
      expect(mine.length, zh).toBe(expected.length);
      const differing = [...mine].filter((char, i) => char !== expected[i] && char !== bare(expected[i]));
      expect(differing, zh).toEqual([]);
    }
  });
});
