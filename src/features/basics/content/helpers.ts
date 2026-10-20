import { markTone } from '../../vocabulary/pinyin';
import { TONE_NAMES } from '../constants';
import type { LearnCard, QuestionSeed, ToneNumber } from '../types';

export const marked = (base: string, tone: ToneNumber) => markTone(base, tone);

export const toneName = (tone: ToneNumber) => TONE_NAMES[tone];

type InitialSpec = { initial: string; samples: [string, string]; hint: string };

// A sound lesson: one card per sound, and two listening questions per sound
export const soundLesson = (specs: InitialSpec[], kind: 'initial' | 'final', everyLabel: string[]) => {
  const cards: LearnCard[] = specs.map((spec) => ({
    id: `card-${spec.initial}`,
    title: spec.initial,
    subtitle: spec.samples.map((s) => marked(s.slice(0, -1), Number(s.slice(-1)) as ToneNumber)).join('  '),
    note: spec.hint,
    sound: spec.samples[0],
  }));
  const questions: QuestionSeed[] = specs.flatMap((spec) =>
    spec.samples.map((sample, index) => {
      const others = everyLabel.filter((label) => label !== spec.initial);
      const near = specs.filter((s) => s.initial !== spec.initial).map((s) => s.initial);
      const wrong = [...near, ...others.filter((label) => !near.includes(label))].slice(0, 3);
      return {
        id: `q-${spec.initial}-${index}`,
        prompt: kind === 'initial' ? 'Which first sound do you hear?' : 'Which vowel sound do you hear?',
        sound: sample,
        answer: spec.initial,
        wrong,
        explain: `${spec.initial}: ${spec.hint}`,
      };
    }),
  );
  return { cards, questions };
};
