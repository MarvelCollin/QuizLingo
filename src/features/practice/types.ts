import type { WordProgress } from '../progress/types';
import type { ApiMode } from '../progress/types';
import type { Sentence, SentenceIndex } from '../study/types';
import type { Word } from '../vocabulary/types';

export type WordModeId = 'flashcard' | 'meaning' | 'listening' | 'pinyin';
export type SentenceModeId = 'reading' | 'sentence-listening' | 'gap' | 'order';
export type PracticeModeId = WordModeId | SentenceModeId;
export type WordSetId = 'due' | 'new' | 'all';
export type LevelFilter = 'all' | '1' | '2' | '3' | '4' | '5' | '6' | '7';
export type RoundSize = '10' | '20' | '30';

export type PracticeMode = {
  id: PracticeModeId;
  label: string;
  detail: string;
  apiMode: ApiMode;
  usesSentences: boolean;
  needsVoice: boolean;
};

export type RoundConfig = { mode: PracticeModeId; set: WordSetId; level: LevelFilter; size: RoundSize };

export type ChoiceOption = { label: string; detail?: string; isHanzi: boolean; isCorrect: boolean };

export type Question = { word: Word; options: ChoiceOption[] };

export type SentenceQuestion = { word: Word; sentence: Sentence; options: ChoiceOption[]; pieces: string[] };

export type AnswerRecord = { word: Word; isCorrect: boolean };

export type WordRevealProps = { word: Word; isExampleShown?: boolean };

export type RoundProps = {
  words: Word[];
  pool: Word[];
  sentences: SentenceIndex;
  config: RoundConfig;
  onPracticeWords: (words: Word[]) => void;
  onNewRound: () => void;
};

export type RoundSummaryProps = {
  records: AnswerRecord[];
  unsavedCount: number;
  isSaving: boolean;
  saveError: Error | null;
  onRetrySave: () => void;
  onPracticeWords: (words: Word[]) => void;
  onNewRound: () => void;
};

export type RoundRunnerProps = {
  vocabulary: Word[];
  progress: Map<string, WordProgress>;
  sentences: SentenceIndex;
  config: RoundConfig;
};

export type ListenButtonProps = { text: string; label?: string; size?: 'md' | 'lg'; className?: string };

export type KeyHintProps = { children: string };

export type FlashcardProps = { word: Word; onGrade: (isCorrect: boolean) => void };

export type ChoiceQuestionProps = {
  question: Question;
  mode: Exclude<WordModeId, 'flashcard'>;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
};

export type ChoiceOptionProps = {
  option: ChoiceOption;
  index: number;
  isAnswered: boolean;
  isChosen: boolean;
  onChoose: () => void;
};

export type SentenceChoiceProps = {
  question: SentenceQuestion;
  mode: Exclude<SentenceModeId, 'order'>;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
};

export type WordOrderProps = {
  question: SentenceQuestion;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
};

export type AnswerFooterProps = { isCorrect: boolean; question: SentenceQuestion; onNext: () => void };

export type ToolMissed = { key: string; main: string; detail: string };

export type ToolSummaryProps = {
  title: string;
  correct: number;
  total: number;
  missed: ToolMissed[];
  isSaving: boolean;
  onRestart: () => void;
  backTo: string;
  backLabel: string;
};

export type ToolHeaderProps = { label: string; index: number; total: number; correct: number; answered: number; onEnd: () => void };
