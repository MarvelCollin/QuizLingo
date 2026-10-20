import type { IForm } from './IForm';

export interface IWord {
  s: string;
  r: string;
  q: number;
  p: string[];
  l?: number;
  f: IForm[];
}
