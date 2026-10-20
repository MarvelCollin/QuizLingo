import type { Word } from '../vocabulary/types';

export type ToneNumber = 1 | 2 | 3 | 4 | 5;

// One thing to look at and listen to before the quiz
export type LearnCard = {
  id: string;
  title: string;
  subtitle?: string;
  note?: string;
  sound?: string;
  word?: string;
  tones?: ToneNumber[];
  strokeChar?: string;
};

// A question before its options are shuffled
export type QuestionSeed = {
  id: string;
  prompt: string;
  sound?: string;
  word?: string;
  hanzi?: string;
  tones?: ToneNumber[];
  isHanzi?: boolean;
  srsWord?: string;
  answer: string;
  wrong: string[];
  explain?: string;
};

export type WordSpec = { hanzi: string; gloss: string };

export type LessonSource =
  | { kind: 'static'; cards: LearnCard[]; questions: QuestionSeed[] }
  | { kind: 'words'; words: WordSpec[] }
  | { kind: 'pairs'; cards: LearnCard[] }
  | { kind: 'checkpoint'; from: string[] };

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  source: LessonSource;
};

export type Stage = {
  id: string;
  title: string;
  blurb: string;
  lessons: Lesson[];
};

export type QuizOption = { label: string; isCorrect: boolean };

export type QuizQuestion = Omit<QuestionSeed, 'answer' | 'wrong'> & { options: QuizOption[] };

export type LessonContent = { cards: LearnCard[]; questions: QuizQuestion[] };

export type BuildContext = { vocabulary: Word[]; audioWords: Set<string> };

export type LessonProgress = { lesson: string; best: number; attempts: number; completedAt: number | null };

export type LessonStatus = 'locked' | 'open' | 'tried' | 'done';

export type LessonState = { lesson: Lesson; stage: Stage; status: LessonStatus; best: number; isCheckpoint: boolean };

export type StageState = {
  stage: Stage;
  lessons: LessonState[];
  doneCount: number;
  isDone: boolean;
  isLocked: boolean;
};

export type AttemptInput = { lesson: string; score: number; passed: boolean };
