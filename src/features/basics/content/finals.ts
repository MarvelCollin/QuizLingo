import type { Lesson, Stage } from '../types';
import { soundLesson } from './helpers';

type Spec = Parameters<typeof soundLesson>[0][number];

const ALL: Spec[] = [
  { initial: 'a', samples: ['a1', 'ba4'], hint: 'Open wide, like the "ah" in "father".' },
  { initial: 'o', samples: ['o1', 'bo2'], hint: 'Like the "aw" in "law", with rounded lips.' },
  { initial: 'e', samples: ['e2', 'ge4'], hint: 'Like the "uh" in "duh" but further back in the throat, with relaxed lips.' },
  { initial: 'i', samples: ['yi1', 'ni3'], hint: 'Like the "ee" in "see". After z c s and zh ch sh r it is only a buzz with no vowel.' },
  { initial: 'u', samples: ['wu1', 'bu4'], hint: 'Like the "oo" in "moon", with rounded lips.' },
  { initial: 'ü', samples: ['yu3', 'lv4'], hint: 'Say "ee" and round your lips as if saying "oo". It is written u after j q x y.' },
  { initial: 'ai', samples: ['ai4', 'bai2'], hint: 'Like the English word "eye".' },
  { initial: 'ei', samples: ['bei1', 'mei2'], hint: 'Like the "ay" in "day".' },
  { initial: 'ao', samples: ['ao2', 'hao3'], hint: 'Like the "ow" in "now".' },
  { initial: 'ou', samples: ['ou1', 'dou1'], hint: 'Like the "oh" in "go".' },
  { initial: 'an', samples: ['ban1', 'han4'], hint: 'Say "ah" and close the tongue to n.' },
  { initial: 'en', samples: ['ben3', 'men2'], hint: 'Like the "un" in "sun", closed with n.' },
  { initial: 'ang', samples: ['bang1', 'dang1'], hint: 'Keep the mouth open on "ah" and end with the "ng" of "sing".' },
  { initial: 'eng', samples: ['beng2', 'neng2'], hint: 'Like the "ung" in "lung".' },
  { initial: 'ong', samples: ['dong1', 'gong1'], hint: 'Round the lips for "oo" and end with "ng".' },
  { initial: 'ia', samples: ['jia1', 'xia4'], hint: 'Say "ee" and glide into "ah".' },
  { initial: 'ie', samples: ['jie3', 'bie2'], hint: 'Say "ee" and glide into "eh", like "yeah" said quickly.' },
  { initial: 'iao', samples: ['jiao1', 'xiao3'], hint: 'Say "ee" and glide into "ow".' },
  { initial: 'iu', samples: ['jiu3', 'liu4'], hint: 'A short way to write iou. Say "ee" and glide into "oh". The tone mark goes on the u.' },
  { initial: 'ian', samples: ['jian1', 'tian1'], hint: 'Sounds like "yen".' },
  { initial: 'in', samples: ['jin1', 'xin1'], hint: 'Like the "een" in "seen".' },
  { initial: 'iang', samples: ['jiang1', 'xiang3'], hint: 'Say "ee", then "ahng".' },
  { initial: 'ing', samples: ['jing1', 'ting1'], hint: 'Like "eeng", the "ing" of "sing" with a longer vowel.' },
  { initial: 'iong', samples: ['jiong3', 'xiong2'], hint: 'Like "yoong".' },
  { initial: 'ua', samples: ['gua1', 'hua4'], hint: 'Say "oo" and glide into "ah".' },
  { initial: 'uo', samples: ['guo2', 'duo1'], hint: 'Say "oo" and glide into "aw".' },
  { initial: 'uai', samples: ['guai4', 'huai4'], hint: 'Say "oo", then "eye".' },
  { initial: 'ui', samples: ['gui1', 'dui4'], hint: 'A short way to write uei. It sounds like "way". The tone mark goes on the i.' },
  { initial: 'uan', samples: ['guan1', 'suan4'], hint: 'Say "oo", then "an".' },
  { initial: 'un', samples: ['gun3', 'dun4'], hint: 'A short way to write uen. It sounds like "wun".' },
  { initial: 'uang', samples: ['guang1', 'huang2'], hint: 'Say "oo", then "ahng".' },
  { initial: 'üe', samples: ['yue4', 'xue2'], hint: 'Say ü and glide into "eh". It is written ue after j q x y.' },
  { initial: 'üan', samples: ['yuan2', 'quan2'], hint: 'Say ü and glide into "an". It is written uan after j q x y.' },
  { initial: 'ün', samples: ['yun2', 'jun1'], hint: 'Say ü and close to n. It is written un after j q x y.' },
];

const ALL_LABELS = ALL.map((spec) => spec.initial);

const group = (id: string, title: string, summary: string, letters: string[], minutes = 5): Lesson => ({
  id,
  title,
  summary,
  minutes,
  source: { kind: 'static', ...soundLesson(ALL.filter((spec) => letters.includes(spec.initial)), 'final', ALL_LABELS) },
});

export const FINALS_STAGE: Stage = {
  id: 'finals',
  title: 'Vowel sounds',
  blurb: 'The finals of pinyin, from single vowels to the nasal endings. Each group has one thing to listen for.',
  lessons: [
    group('finals-1', 'a o e i u ü', 'The six simple vowels', ['a', 'o', 'e', 'i', 'u', 'ü']),
    group('finals-2', 'ai ei ao ou', 'Vowels that glide', ['ai', 'ei', 'ao', 'ou']),
    group('finals-3', 'an en ang eng ong', 'Endings in n and ng', ['an', 'en', 'ang', 'eng', 'ong']),
    group('finals-4', 'ia ie iao iu', 'Starting from i', ['ia', 'ie', 'iao', 'iu']),
    group('finals-5', 'ian in iang ing iong', 'i with a nasal ending', ['ian', 'in', 'iang', 'ing', 'iong']),
    group('finals-6', 'ua uo uai ui', 'Starting from u', ['ua', 'uo', 'uai', 'ui']),
    group('finals-7', 'uan un uang', 'u with a nasal ending', ['uan', 'un', 'uang'], 4),
    group('finals-8', 'üe üan ün', 'The ü family', ['üe', 'üan', 'ün'], 4),
    {
      id: 'finals-check',
      title: 'Milestone: Vowel sounds',
      summary: 'Ten questions mixed from every group',
      minutes: 4,
      source: {
        kind: 'checkpoint',
        from: ['finals-1', 'finals-2', 'finals-3', 'finals-4', 'finals-5', 'finals-6', 'finals-7', 'finals-8'],
      },
    },
  ],
};
