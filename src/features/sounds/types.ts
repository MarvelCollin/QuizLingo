export type SoundPair = { a: string; b: string; kind: 'initial' | 'final'; tip: string };

export type SoundGroup = { id: string; label: string; detail: string; pairs: SoundPair[] };

export type SoundItem = {
  key: string;
  sound: string;
  answer: string;
  options: { label: string; isCorrect: boolean }[];
  tip: string;
};

export type SoundQuestionProps = { item: SoundItem; onAnswer: (isCorrect: boolean) => void; onNext: () => void };

export type SoundRoundProps = { group: SoundGroup; items: SoundItem[]; onRestart: () => void; onEnd: () => void };
