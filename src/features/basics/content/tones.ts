import type { QuestionSeed, Stage, ToneNumber } from '../types';
import { marked, toneName } from './helpers';

const heard = (id: string, base: string, tone: ToneNumber, tones: ToneNumber[]): QuestionSeed => ({
  id,
  prompt: 'Which tone do you hear?',
  sound: `${base}${tone}`,
  answer: marked(base, tone),
  wrong: tones.filter((t) => t !== tone).map((t) => marked(base, t)),
  explain: `${marked(base, tone)} is ${toneName(tone).toLowerCase()}.`,
});

const drawn = (id: string, tone: ToneNumber, tones: ToneNumber[]): QuestionSeed => ({
  id,
  prompt: 'Which tone does this line show?',
  tones: [tone],
  answer: toneName(tone),
  wrong: tones.filter((t) => t !== tone).map(toneName),
  explain: `A line like this is ${toneName(tone).toLowerCase()}.`,
});

const marks = (id: string, spoken: string, answer: string, wrong: string): QuestionSeed => ({
  id,
  prompt: `Where does the tone mark go in ${spoken}?`,
  answer,
  wrong: [wrong],
  explain: 'Mark an a or an e first. In ou it goes on the o. Otherwise it goes on the last vowel.',
});

export const TONES_STAGE: Stage = {
  id: 'tones',
  title: 'The four tones',
  blurb: 'Pitch is part of every word. Hear it, see it, then say it.',
  lessons: [
    {
      id: 'tones-1',
      title: 'High and rising',
      summary: 'Tone 1 and tone 2',
      minutes: 5,
      source: {
        kind: 'static',
        cards: [
          { id: 'ma1', title: 'mā', subtitle: 'Tone 1, high and flat', note: 'Hold one steady high note, like singing. Keep the pitch from drifting.', sound: 'ma1', tones: [1] },
          { id: 'ma2', title: 'má', subtitle: 'Tone 2, rising', note: 'Start in the middle and slide up, the way you say "What?" in surprise.', sound: 'ma2', tones: [2] },
          { id: 'shu1', title: 'shū', subtitle: 'Tone 1 again', note: 'The same flat line on a different syllable.', sound: 'shu1', tones: [1] },
          { id: 'shu2', title: 'shú', subtitle: 'Tone 2 again', note: 'The same rise on a different syllable.', sound: 'shu2', tones: [2] },
        ],
        questions: [
          heard('h1', 'ma', 1, [1, 2]),
          heard('h2', 'ba', 2, [1, 2]),
          heard('h3', 'da', 1, [1, 2]),
          heard('h4', 'shu', 2, [1, 2]),
          heard('h5', 'hu', 2, [1, 2]),
          heard('h6', 'ta', 1, [1, 2]),
          drawn('d1', 1, [1, 2]),
          drawn('d2', 2, [1, 2]),
        ],
      },
    },
    {
      id: 'tones-2',
      title: 'Dipping and falling',
      summary: 'Tone 3 and tone 4',
      minutes: 5,
      source: {
        kind: 'static',
        cards: [
          { id: 'ma3', title: 'mǎ', subtitle: 'Tone 3, dipping', note: 'Drop low, then curl back up a little. It sounds like a doubtful "Hmm?"', sound: 'ma3', tones: [3] },
          { id: 'ma4', title: 'mà', subtitle: 'Tone 4, falling', note: 'Fall from high to low, quick and firm, the way you say "No!"', sound: 'ma4', tones: [4] },
          { id: 'shu3', title: 'shǔ', subtitle: 'Tone 3 again', note: 'Go low first. The small rise at the end is optional when more words follow.', sound: 'shu3', tones: [3] },
          { id: 'shu4', title: 'shù', subtitle: 'Tone 4 again', note: 'One sharp drop, then stop.', sound: 'shu4', tones: [4] },
        ],
        questions: [
          heard('h1', 'ma', 3, [1, 2, 3, 4]),
          heard('h2', 'ba', 4, [1, 2, 3, 4]),
          heard('h3', 'da', 3, [1, 2, 3, 4]),
          heard('h4', 'shu', 4, [1, 2, 3, 4]),
          heard('h5', 'hu', 1, [1, 2, 3, 4]),
          heard('h6', 'ni', 2, [1, 2, 3, 4]),
          drawn('d1', 3, [1, 2, 3, 4]),
          drawn('d2', 4, [1, 2, 3, 4]),
        ],
      },
    },
    {
      id: 'tones-3',
      title: 'Light tone and tone marks',
      summary: 'The neutral tone and where marks go',
      minutes: 4,
      source: {
        kind: 'static',
        cards: [
          { id: 'neutral', title: 'ma', subtitle: 'Neutral tone, light and short', note: 'No mark. The syllable is quick and soft and takes its pitch from the one before it.', tones: [5] },
          { id: 'mama', title: '妈妈', subtitle: 'māma, mom', note: 'The second syllable is neutral. Say the first one clearly and let the second one drop.', word: '妈妈' },
          { id: 'rule', title: 'a e ou', subtitle: 'Where the mark goes', note: 'Put it on an a or an e if there is one. In ou it goes on the o. In any other pair it goes on the last vowel.', sound: 'hao3' },
          { id: 'iu', title: 'liú', subtitle: 'Last vowel wins', note: 'In iu and ui the mark goes on the second letter.', sound: 'liu2' },
        ],
        questions: [
          marks('m1', 'hao, third tone', 'hǎo', 'haǒ'),
          marks('m2', 'liu, second tone', 'liú', 'líu'),
          marks('m3', 'dui, fourth tone', 'duì', 'dùi'),
          marks('m4', 'gou, third tone', 'gǒu', 'goǔ'),
          marks('m5', 'xie, fourth tone', 'xiè', 'xìe'),
          {
            id: 'neutral-mark',
            prompt: 'How is the neutral tone written?',
            answer: 'With no mark at all',
            wrong: ['With a flat line over the vowel', 'With a dot under the vowel', 'With a circle over the vowel'],
            explain: 'The neutral tone has no mark, as in the second syllable of māma.',
          },
          {
            id: 'neutral-sound',
            prompt: 'What does the neutral tone sound like?',
            answer: 'Light and short, with no pitch of its own',
            wrong: ['High and flat', 'Rising like a question', 'Falling like an order'],
            explain: 'It is the quickest and softest syllable in the word.',
          },
        ],
      },
    },
    {
      id: 'tones-4',
      title: 'Two tones together',
      summary: 'Hear pairs in real words',
      minutes: 6,
      source: {
        kind: 'pairs',
        cards: [
          { id: 'jintian', title: '今天', subtitle: 'jīntiān, today', note: 'High, then high again. Keep both flat.', word: '今天', tones: [1, 1] },
          { id: 'xuexi', title: '学习', subtitle: 'xuéxí, to study', note: 'Two rises in a row. Climb twice.', word: '学习', tones: [2, 2] },
          { id: 'laoshi', title: '老师', subtitle: 'lǎoshī, teacher', note: 'Low, then high. The first syllable stays low and flat.', word: '老师', tones: [3, 1] },
          { id: 'zaijian', title: '再见', subtitle: 'zàijiàn, goodbye', note: 'Two sharp drops. Each one starts high again.', word: '再见', tones: [4, 4] },
        ],
      },
    },
    {
      id: 'tones-check',
      title: 'Milestone: The four tones',
      summary: 'Ten questions mixed from every tone lesson',
      minutes: 4,
      source: { kind: 'checkpoint', from: ['tones-1', 'tones-2', 'tones-3', 'tones-4'] },
    },
  ],
};
