import type { HskLevel } from '../vocabulary/types';

export type ToneKind = 'syllable' | 'pair';

export type ToneOption = { label: string; isCorrect: boolean };

export type ToneItem = {
  key: string;
  kind: ToneKind;
  sound: string;
  answer: string;
  hanzi: string;
  meaning: string;
  options: ToneOption[];
};

export type ToneQuestionProps = { item: ToneItem; onAnswer: (isCorrect: boolean) => void; onNext: () => void };

export type ToneRoundProps = { kind: ToneKind; level: HskLevel; items: ToneItem[]; onRestart: () => void; onEnd: () => void };
