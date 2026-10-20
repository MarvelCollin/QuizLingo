import { shuffle } from '../../lib/random';
import { markTone, splitSyllable } from '../vocabulary/pinyin';
import type { Word } from '../vocabulary/types';
import { CHECKPOINT_LENGTH, OPTION_COUNT, WORD_QUIZ_LENGTH } from './constants';
import { ALL_LESSONS, lessonById } from './curriculum';
import type { BuildContext, LearnCard, Lesson, LessonContent, QuestionSeed, QuizQuestion, WordSpec } from './types';

const PAIR_QUIZ_LENGTH = 8;

export const toQuestion = ({ answer, wrong, ...rest }: QuestionSeed): QuizQuestion => ({
  ...rest,
  options: shuffle([
    { label: answer, isCorrect: true },
    ...shuffle(wrong)
      .slice(0, OPTION_COUNT - 1)
      .map((label) => ({ label, isCorrect: false })),
  ]),
});

const allSpecs = (): WordSpec[] =>
  ALL_LESSONS.flatMap((lesson) => (lesson.source.kind === 'words' ? lesson.source.words : []));

const wordCards = (specs: WordSpec[], vocabulary: Map<string, Word>): LearnCard[] =>
  specs.map((spec) => {
    const word = vocabulary.get(spec.hanzi);
    return {
      id: `card-${spec.hanzi}`,
      title: spec.hanzi,
      subtitle: word?.readings[0]?.pinyin ?? word?.pinyin,
      note: spec.gloss,
      word: spec.hanzi,
    };
  });

// One question per word, rotating through three ways of asking so a round does not feel repetitive
const wordSeeds = (specs: WordSpec[], vocabulary: Map<string, Word>): QuestionSeed[] => {
  const pool = allSpecs();
  return shuffle(specs).map((spec, index) => {
    const others = shuffle(pool.filter((other) => other.gloss !== spec.gloss && other.hanzi !== spec.hanzi));
    const pinyin = vocabulary.get(spec.hanzi)?.readings[0]?.pinyin ?? '';
    const base = { id: `w-${spec.hanzi}`, srsWord: spec.hanzi, explain: `${spec.hanzi} ${pinyin}, ${spec.gloss}` };
    const kind = index % 3;
    if (kind === 0) {
      return { ...base, prompt: 'What does this word mean?', word: spec.hanzi, answer: spec.gloss, wrong: others.map((o) => o.gloss) };
    }
    if (kind === 1) {
      return { ...base, prompt: 'What does this word mean?', hanzi: spec.hanzi, answer: spec.gloss, wrong: others.map((o) => o.gloss) };
    }
    return {
      ...base,
      prompt: `Which word means "${spec.gloss}"?`,
      isHanzi: true,
      answer: spec.hanzi,
      wrong: others.map((o) => o.hanzi),
    };
  });
};

// Tone pair questions come from real HSK 1 words that have a recording
const pairSeeds = ({ vocabulary, audioWords }: BuildContext): QuestionSeed[] => {
  const tones = [1, 2, 3, 4];
  const seeds = vocabulary
    .filter((w) => w.level === 1 && [...w.hanzi].length === 2 && w.readings.length === 1 && audioWords.has(w.hanzi))
    .flatMap((word): QuestionSeed[] => {
      const parts = word.readings[0].numeric.split(' ').map(splitSyllable);
      if (parts.length !== 2 || parts.some((part) => !part || part.tone > 4)) return [];
      const [first, second] = parts as { base: string; tone: number }[];
      const label = (a: number, b: number) => `${markTone(first.base, a)} ${markTone(second.base, b)}`;
      const answer = label(first.tone, second.tone);
      const wrong = tones.flatMap((a) => tones.map((b) => label(a, b))).filter((l) => l !== answer);
      return [
        {
          id: `p-${word.hanzi}`,
          prompt: 'Which tones do you hear?',
          word: word.hanzi,
          answer,
          wrong,
          explain: `${word.hanzi} ${word.pinyin}, ${word.meaning}`,
        },
      ];
    });
  return shuffle(seeds);
};

const rawSeedsOf = (lesson: Lesson, ctx: BuildContext, vocabulary: Map<string, Word>): QuestionSeed[] => {
  const { source } = lesson;
  if (source.kind === 'static') return shuffle(source.questions);
  if (source.kind === 'words') return wordSeeds(source.words, vocabulary);
  if (source.kind === 'pairs') return pairSeeds(ctx);
  return [];
};

// Each question remembers its lesson, so a miss can be filed under it
const seedsOf = (lesson: Lesson, ctx: BuildContext, vocabulary: Map<string, Word>): QuestionSeed[] =>
  rawSeedsOf(lesson, ctx, vocabulary).map((seed) => ({ ...seed, lesson: lesson.id }));

// Takes questions from each lesson in turn, so a milestone covers everything and no lesson dominates
const mixed = (from: string[], ctx: BuildContext, vocabulary: Map<string, Word>): QuestionSeed[] => {
  const lanes = from.flatMap((id) => {
    const lesson = lessonById(id);
    return lesson ? [seedsOf(lesson, ctx, vocabulary)] : [];
  });
  const picked: QuestionSeed[] = [];
  for (let round = 0; picked.length < CHECKPOINT_LENGTH && lanes.some((lane) => lane.length > round); round++) {
    for (const lane of shuffle(lanes)) {
      if (lane[round] && picked.length < CHECKPOINT_LENGTH) picked.push(lane[round]);
    }
  }
  return shuffle(picked);
};

export const buildLesson = (lesson: Lesson, ctx: BuildContext): LessonContent => {
  const vocabulary = new Map(ctx.vocabulary.map((word) => [word.hanzi, word]));
  const { source } = lesson;
  if (source.kind === 'static') {
    return { cards: source.cards, questions: seedsOf(lesson, ctx, vocabulary).map(toQuestion) };
  }
  if (source.kind === 'words') {
    const seeds = seedsOf(lesson, ctx, vocabulary).slice(0, WORD_QUIZ_LENGTH);
    return { cards: wordCards(source.words, vocabulary), questions: seeds.map(toQuestion) };
  }
  if (source.kind === 'pairs') {
    return { cards: source.cards, questions: seedsOf(lesson, ctx, vocabulary).slice(0, PAIR_QUIZ_LENGTH).map(toQuestion) };
  }
  return { cards: [], questions: mixed(source.from, ctx, vocabulary).map(toQuestion) };
};

// A quiz made of the questions someone keeps missing, the ones missed most first
export const buildWeakQuiz = (keys: string[], ctx: BuildContext): QuizQuestion[] => {
  const vocabulary = new Map(ctx.vocabulary.map((word) => [word.hanzi, word]));
  const lessons = new Map<string, QuestionSeed[]>();
  const questions: QuizQuestion[] = [];
  for (const key of keys) {
    const [lessonId, ...rest] = key.split('/');
    const id = rest.join('/');
    const lesson = lessonById(lessonId);
    if (!lesson) continue;
    if (!lessons.has(lessonId)) lessons.set(lessonId, seedsOf(lesson, ctx, vocabulary));
    const seed = lessons.get(lessonId)!.find((s) => s.id === id);
    if (seed) questions.push(toQuestion(seed));
  }
  return questions;
};
