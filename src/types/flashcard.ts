export interface IPronunciation {
  y?: string;
  n?: string;
  w?: string;
  b?: string;
  g?: string;
}

export interface IForm {
  t: string;
  i: IPronunciation;
  m: string[];
  c: string[];
}

export interface IWord {
  s: string;
  r: string;
  q: number;
  p: string[];
  l?: number;
  f: IForm[];
}

export interface IFlashcard {
  simplified: string;
  traditional: string;
  pinyin: string;
  meanings: string[];
  level: number;
}

export interface IQuizOption {
  text: string;
  isCorrect: boolean;
}

export interface IAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export type Mode = 'flashcard' | 'quiz';
export type HSKLevel = 1 | 2 | 3;
