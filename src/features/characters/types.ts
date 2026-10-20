import type { Hanzi } from '../study/types';
import type { HskLevel } from '../vocabulary/types';

export type CharacterLevelFilter = 'all' | `${HskLevel}`;

export type CharacterFilters = { q: string; level: CharacterLevelFilter; isWriteOnly: boolean; page: number };

export type StrokePlayerProps = { char: string; size?: number };

export type WritingPadProps = { char: string; size?: number; onDone: (mistakes: number) => void; isHintShown: boolean };

export type CharacterRowsProps = { rows: Hanzi[] };

export type CharacterChoice = { label: string; isCorrect: boolean };

export type CharacterQuestion = { hanzi: Hanzi; options: CharacterChoice[] };

export type CharacterQuizProps = { question: CharacterQuestion; onAnswer: (isCorrect: boolean) => void; onNext: () => void };

export type WritingTaskProps = { hanzi: Hanzi; onAnswer: (isCorrect: boolean) => void; onNext: () => void };

export type CharacterPracticeKind = 'quiz' | 'writing';

export type CharacterPracticePageProps = { kind: CharacterPracticeKind };

export type CharacterRoundViewProps = {
  kind: CharacterPracticeKind;
  items: Hanzi[];
  pool: Hanzi[];
  level: HskLevel;
  onRestart: () => void;
  onEnd: () => void;
};
