import type { Lesson, Stage } from '../types';
import { soundLesson } from './helpers';

type Spec = Parameters<typeof soundLesson>[0][number];

const ALL: Spec[] = [
  { initial: 'b', samples: ['bo1', 'bu4'], hint: 'Like the p in "spin". No puff of air.' },
  { initial: 'p', samples: ['po1', 'pa4'], hint: 'Like the p in "pin", with a strong puff of air. A tissue held in front of your mouth should move.' },
  { initial: 'm', samples: ['mo1', 'ma1'], hint: 'Like the m in "mom".' },
  { initial: 'f', samples: ['fo2', 'fu4'], hint: 'Like the f in "fan".' },
  { initial: 'd', samples: ['de2', 'di4'], hint: 'Like the t in "star". No puff of air.' },
  { initial: 't', samples: ['te4', 'ta1'], hint: 'Like the t in "top", with a puff of air.' },
  { initial: 'n', samples: ['ne4', 'na2'], hint: 'Like the n in "net".' },
  { initial: 'l', samples: ['le4', 'la1'], hint: 'Like the l in "light".' },
  { initial: 'g', samples: ['ge1', 'gu3'], hint: 'Like the k in "sky". No puff of air.' },
  { initial: 'k', samples: ['ke1', 'ku4'], hint: 'Like the k in "kite", with a puff of air.' },
  { initial: 'h', samples: ['he2', 'hu3'], hint: 'Like the h in "hat" but rougher, from the back of the throat.' },
  { initial: 'j', samples: ['ji1', 'ju2'], hint: 'Like the j in "jeep", with the tongue flat and the lips spread.' },
  { initial: 'q', samples: ['qi1', 'qu4'], hint: 'Like the ch in "cheese", with a strong puff of air.' },
  { initial: 'x', samples: ['xi1', 'xu2'], hint: 'Like the sh in "she", with the lips spread in a smile.' },
  { initial: 'zh', samples: ['zhi1', 'zhu4'], hint: 'Like the j in "judge", with the tongue tip curled back.' },
  { initial: 'ch', samples: ['chi1', 'chu2'], hint: 'Like the ch in "church", with the tongue curled back and a puff of air.' },
  { initial: 'sh', samples: ['shi1', 'shu1'], hint: 'Like the sh in "shirt", with the tongue curled back.' },
  { initial: 'r', samples: ['ri4', 'ru4'], hint: 'Like the s in "measure", with the tongue curled back. It is not the English r.' },
  { initial: 'z', samples: ['zi4', 'zu2'], hint: 'Like the ds in "kids". No puff of air.' },
  { initial: 'c', samples: ['ci2', 'cu4'], hint: 'Like the ts in "cats", with a puff of air.' },
  { initial: 's', samples: ['si1', 'su4'], hint: 'Like the s in "sun".' },
  { initial: 'y', samples: ['ya1', 'yi1'], hint: 'Like the y in "yes". It stands in for i at the start of a syllable.' },
  { initial: 'w', samples: ['wa1', 'wu1'], hint: 'Like the w in "water". It stands in for u at the start of a syllable.' },
];

const ALL_LABELS = ALL.map((spec) => spec.initial);

const group = (id: string, title: string, summary: string, letters: string[], minutes = 5): Lesson => ({
  id,
  title,
  summary,
  minutes,
  source: { kind: 'static', ...soundLesson(ALL.filter((spec) => letters.includes(spec.initial)), 'initial', ALL_LABELS) },
});

export const INITIALS_STAGE: Stage = {
  id: 'initials',
  title: 'First sounds',
  blurb: 'The 23 starting sounds of pinyin, a few at a time. Pairs that look alike are trained together.',
  lessons: [
    group('initials-1', 'b p m f', 'Lips, with and without a puff', ['b', 'p', 'm', 'f']),
    group('initials-2', 'd t n l', 'Tongue tip behind the teeth', ['d', 't', 'n', 'l']),
    group('initials-3', 'g k h', 'From the back of the mouth', ['g', 'k', 'h']),
    group('initials-4', 'j q x', 'Tongue flat, lips spread', ['j', 'q', 'x']),
    group('initials-5', 'zh ch sh r', 'Tongue tip curled back', ['zh', 'ch', 'sh', 'r']),
    group('initials-6', 'z c s', 'Tongue tip flat, no curl', ['z', 'c', 's']),
    group('initials-7', 'y w', 'The two glides', ['y', 'w'], 3),
    {
      id: 'initials-check',
      title: 'Milestone: First sounds',
      summary: 'Ten questions mixed from every sound',
      minutes: 4,
      source: {
        kind: 'checkpoint',
        from: ['initials-1', 'initials-2', 'initials-3', 'initials-4', 'initials-5', 'initials-6', 'initials-7'],
      },
    },
  ],
};
