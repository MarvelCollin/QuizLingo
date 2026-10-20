// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildLesson } from '../../src/features/basics/build-lesson';
import { CHECKPOINT_LENGTH } from '../../src/features/basics/constants';
import { contourOf } from '../../src/features/basics/contour';
import { ALL_LESSONS, lessonById, STAGES } from '../../src/features/basics/curriculum';
import { buildPath } from '../../src/features/basics/path-state';
import type { LessonProgress } from '../../src/features/basics/types';
import type { RawAudioIndex } from '../../src/features/study/types';
import { loadWords, readData } from '../fixtures';

const ctx = { vocabulary: loadWords(), audioWords: new Set(readData<RawAudioIndex>('audio.json').words) };

const passed = (...ids: string[]): LessonProgress[] =>
  ids.map((lesson) => ({ lesson, best: 100, attempts: 1, completedAt: 1 }));

const statusOf = (progress: LessonProgress[], id: string) =>
  buildPath(progress)
    .stages.flatMap((s) => s.lessons)
    .find((l) => l.lesson.id === id)!.status;

describe('starter path progress', () => {
  it('opens the first lesson and the first milestone for a new learner, and locks the rest', () => {
    const path = buildPath([]);
    expect(path.next?.lesson.id).toBe('start-1');
    expect(statusOf([], 'start-1')).toBe('open');
    expect(statusOf([], 'start-2')).toBe('locked');
    expect(statusOf([], 'start-check')).toBe('open');
    expect(statusOf([], 'tones-1')).toBe('locked');
    expect(path.percent).toBe(0);
    expect(path.stagesDone).toBe(0);
  });

  it('opens a lesson once the one before it is passed', () => {
    expect(statusOf(passed('start-1'), 'start-2')).toBe('open');
    expect(buildPath(passed('start-1')).next?.lesson.id).toBe('start-2');
  });

  it('marks a lesson as tried when it was attempted but not passed', () => {
    const tried: LessonProgress[] = [{ lesson: 'start-1', best: 50, attempts: 2, completedAt: null }];
    expect(statusOf(tried, 'start-1')).toBe('tried');
    expect(buildPath(tried).next?.lesson.id).toBe('start-1');
  });

  it('lets someone test out of a stage and unlocks the next one', () => {
    const progress = passed('start-check');
    const path = buildPath(progress);
    expect(path.stagesDone).toBe(1);
    expect(statusOf(progress, 'start-2')).toBe('open');
    expect(statusOf(progress, 'tones-1')).toBe('open');
    expect(statusOf(progress, 'tones-2')).toBe('locked');
    expect(path.next?.lesson.id).toBe('tones-1');
  });

  it('counts every lesson of a stage once its milestone is passed', () => {
    const path = buildPath(passed('start-check'));
    expect(path.lessonsDone).toBe(STAGES[0].lessons.length);
    expect(path.percent).toBe(Math.round((STAGES[0].lessons.length / ALL_LESSONS.length) * 100));
  });

  it('finishes with no next step when every milestone is passed', () => {
    const milestones = STAGES.map((stage) => stage.lessons[stage.lessons.length - 1].id);
    const path = buildPath(passed(...milestones));
    expect(path.next).toBeNull();
    expect(path.percent).toBe(100);
    expect(path.stagesDone).toBe(STAGES.length);
  });
});

describe('starter path lessons', () => {
  it('builds every lesson with questions that have exactly one right option', () => {
    for (const lesson of ALL_LESSONS) {
      const { questions } = buildLesson(lesson, ctx);
      expect(questions.length, lesson.id).toBeGreaterThanOrEqual(3);
      for (const q of questions) {
        expect(q.options.filter((o) => o.isCorrect), `${lesson.id} ${q.id}`).toHaveLength(1);
        expect(q.options.length, `${lesson.id} ${q.id}`).toBeGreaterThanOrEqual(2);
        expect(q.options.length, `${lesson.id} ${q.id}`).toBeLessThanOrEqual(4);
        expect(new Set(q.options.map((o) => o.label)).size, `${lesson.id} ${q.id}`).toBe(q.options.length);
      }
    }
  });

  it('ties a word lesson to the review schedule', () => {
    const { cards, questions } = buildLesson(lessonById('words-1')!, ctx);
    expect(cards).toHaveLength(7);
    expect(cards[0]).toMatchObject({ title: '你好', subtitle: 'nǐ hǎo', note: 'hello' });
    expect(questions.length).toBeGreaterThan(0);
    for (const q of questions) expect(q.srsWord).toBeTruthy();
  });

  it('asks about tone pairs of words that have a recording', () => {
    const { questions } = buildLesson(lessonById('tones-4')!, ctx);
    expect(questions).toHaveLength(8);
    for (const q of questions) {
      expect(q.options).toHaveLength(4);
      expect(ctx.audioWords.has(q.word!)).toBe(true);
    }
  });

  it('mixes every lesson of the stage into a milestone', () => {
    const stage = STAGES.find((s) => s.id === 'words')!;
    const { questions } = buildLesson(stage.lessons[stage.lessons.length - 1], ctx);
    expect(questions).toHaveLength(CHECKPOINT_LENGTH);
    const words = new Set(stage.lessons.flatMap((l) => (l.source.kind === 'words' ? l.source.words.map((w) => w.hanzi) : [])));
    for (const q of questions) expect(words.has(q.srsWord!)).toBe(true);
  });

  it('keeps wrong answers out of a question that has fewer than three', () => {
    const { questions } = buildLesson(lessonById('tones-3')!, ctx);
    const mark = questions.find((q) => q.id === 'm1')!;
    expect(mark.options.map((o) => o.label).sort()).toEqual(['haǒ', 'hǎo']);
  });
});

describe('tone contours', () => {
  it('draws one segment per syllable and widens the picture for each', () => {
    expect(contourOf([1]).segments).toHaveLength(1);
    expect(contourOf([1, 4]).segments).toHaveLength(2);
    expect(contourOf([1, 4, 2]).width).toBeGreaterThan(contourOf([1, 4]).width);
  });

  it('keeps tone 1 level, lifts tone 2 and drops tone 4', () => {
    const [flat] = contourOf([1]).segments;
    const [rising] = contourOf([2]).segments;
    const [falling] = contourOf([4]).segments;
    expect(flat.start[1]).toBe(flat.end[1]);
    expect(rising.end[1]).toBeLessThan(rising.start[1]);
    expect(falling.end[1]).toBeGreaterThan(falling.start[1]);
  });

  it('curves tone 3 down and back up and keeps the neutral tone short', () => {
    const [dip] = contourOf([3]).segments;
    expect(dip.d.match(/C/g)).toHaveLength(2);
    expect(dip.end[1]).toBeLessThan(dip.start[1]);
    const [neutral] = contourOf([5]).segments;
    const [flat] = contourOf([1]).segments;
    expect(neutral.isNeutral).toBe(true);
    expect(neutral.end[0] - neutral.start[0]).toBeLessThan(flat.end[0] - flat.start[0]);
  });
});
