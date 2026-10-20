import type { WordProgress } from '../progress/types';
import type { ApiMode } from '../progress/types';
import type { Word } from '../vocabulary/types';

export type PracticeModeId = 'flashcard' | 'meaning' | 'listening' | 'pinyin';
export type WordSetId = 'due' | 'new' | 'all';
export type LevelFilter = 'all' | '1' | '2' | '3';
export type RoundSize = '10' | '20' | '30';

export type PracticeMode = { id: PracticeModeId; label: string; detail: string; apiMode: ApiMode };

export type RoundConfig = { mode: PracticeModeId; set: WordSetId; level: LevelFilter; size: RoundSize };

export type ChoiceOption = { label: string; detail?: string; isHanzi: boolean; isCorrect: boolean };

export type Question = { word: Word; options: ChoiceOption[] };

export type AnswerRecord = { word: Word; isCorrect: boolean };

export type WordRevealProps = { word: Word };

export type RoundProps = {
  words: Word[];
  pool: Word[];
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

export type RoundRunnerProps = { vocabulary: Word[]; progress: Map<string, WordProgress>; config: RoundConfig };

export type ListenButtonProps = { text: string; label?: string; size?: 'md' | 'lg'; className?: string };

export type KeyHintProps = { children: string };

export type FlashcardProps = { word: Word; onGrade: (isCorrect: boolean) => void };

export type ChoiceQuestionProps = {
  question: Question;
  mode: Exclude<PracticeModeId, 'flashcard'>;
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
