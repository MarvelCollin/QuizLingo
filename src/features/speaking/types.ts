import type { Sentence } from '../study/types';
import type { HskLevel } from '../vocabulary/types';

export type RecognitionResultList = ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }>;

export type Recognizer = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((event: { results: RecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export type RecognizerConstructor = new () => Recognizer;

export type CharMark = { char: string; isHeard: boolean };

export type SpeakingTaskProps = { sentence: Sentence; onAnswer: (isCorrect: boolean) => void; onNext: () => void };

export type SpeakingRoundProps = { level: HskLevel; items: Sentence[]; onRestart: () => void };
