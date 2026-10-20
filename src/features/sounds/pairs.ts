import type { SoundGroup, SoundPair } from './types';

const pair = (a: string, b: string, tip: string, kind: SoundPair['kind'] = 'initial'): SoundPair => ({ a, b, kind, tip });

export const SOUND_GROUPS: readonly SoundGroup[] = [
  {
    id: 'puff',
    label: 'Puff or no puff',
    detail: 'b p, d t, g k',
    pairs: [
      pair('b', 'p', 'p is said with a strong puff of air. b has none.'),
      pair('d', 't', 't is said with a strong puff of air. d has none.'),
      pair('g', 'k', 'k is said with a strong puff of air. g has none.'),
    ],
  },
  {
    id: 'jqx',
    label: 'j, q and x',
    detail: 'The three that sound close',
    pairs: [
      pair('j', 'q', 'q has a strong puff of air. j has none.'),
      pair('j', 'x', 'x is a hiss with the lips spread. j is a short stop.'),
      pair('q', 'x', 'q starts with a stop and a puff. x is only a hiss.'),
    ],
  },
  {
    id: 'curl',
    label: 'Curled or flat tongue',
    detail: 'zh z, ch c, sh s',
    pairs: [
      pair('zh', 'z', 'For zh the tongue tip curls back. For z it stays flat behind the teeth.'),
      pair('ch', 'c', 'For ch the tongue tip curls back. For c it stays flat behind the teeth.'),
      pair('sh', 's', 'For sh the tongue tip curls back. For s it stays flat behind the teeth.'),
      pair('zh', 'ch', 'ch has a strong puff of air. zh has none.'),
    ],
  },
  {
    id: 'nasal',
    label: 'Endings n and ng',
    detail: 'an ang, en eng, in ing',
    pairs: [
      pair('an', 'ang', 'In an the tongue ends at the teeth. In ang the mouth stays open and the sound ends at the back.', 'final'),
      pair('en', 'eng', 'In en the tongue ends at the teeth. In eng the sound ends at the back.', 'final'),
      pair('in', 'ing', 'In in the tongue ends at the teeth. In ing the sound ends at the back.', 'final'),
      pair('ian', 'iang', 'iang opens wider and ends at the back. ian ends at the teeth.', 'final'),
      pair('uan', 'uang', 'uang opens wider and ends at the back. uan ends at the teeth.', 'final'),
    ],
  },
];

export const groupById = (id: string | null) => SOUND_GROUPS.find((group) => group.id === id) ?? SOUND_GROUPS[0];
