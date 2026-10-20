import type { QuestionSeed, Stage } from '../types';

const strokes = (id: string, hanzi: string, count: number, wrong: number[]): QuestionSeed => ({
  id,
  prompt: `How many strokes does ${hanzi} have?`,
  hanzi,
  isHanzi: false,
  answer: String(count),
  wrong: wrong.map(String),
  explain: `${hanzi} is written in ${count} strokes. Play it again on its character page to count them.`,
});

const radical = (id: string, radicalChar: string, answer: string, wrong: string[]): QuestionSeed => ({
  id,
  prompt: `The part ${radicalChar} usually hints at which idea?`,
  hanzi: radicalChar,
  answer,
  wrong,
  explain: `${radicalChar} means ${answer.toLowerCase()}, so characters that contain it often relate to that idea.`,
});

export const WRITING_STAGE: Stage = {
  id: 'writing',
  title: 'Writing basics',
  blurb: 'Eight strokes, a few order rules and the parts characters are built from. Watch each one being drawn.',
  lessons: [
    {
      id: 'writing-1',
      title: 'The basic strokes',
      summary: 'Names and shapes of the strokes',
      minutes: 5,
      source: {
        kind: 'static',
        cards: [
          { id: 'heng', title: '一', subtitle: 'héng 横, horizontal', note: 'A flat line drawn from left to right.', strokeChar: '一' },
          { id: 'shu', title: '十', subtitle: 'héng, then shù 竖, vertical', note: 'A vertical line drawn from top to bottom. 十 uses one of each.', strokeChar: '十' },
          { id: 'pienna', title: '人', subtitle: 'piě 撇, then nà 捺', note: 'Piě falls from right to left. Nà falls from left to right and ends with a flat foot.', strokeChar: '人' },
          { id: 'zhe', title: '口', subtitle: 'shù, then zhé 折, then héng', note: 'Zhé is a line that turns a corner without lifting the pen. 口 has two of them.', strokeChar: '口' },
          { id: 'gou', title: '小', subtitle: 'shù gōu 竖钩, then two diǎn 点', note: 'Gōu is a hook at the end of a stroke. Diǎn is a short dot.', strokeChar: '小' },
          { id: 'ti', title: '打', subtitle: 'contains a tí 提', note: 'Tí is a short stroke that flicks up and to the right. It is the left side of 打.', strokeChar: '打' },
        ],
        questions: [
          { id: 'q-heng', prompt: 'What is this stroke called?', hanzi: '一', answer: 'héng, horizontal', wrong: ['shù, vertical', 'piě, falling left', 'diǎn, a dot'], explain: 'Héng is the flat stroke.' },
          { id: 'q-shu', prompt: 'Which stroke runs from top to bottom?', answer: 'shù, vertical', wrong: ['héng, horizontal', 'tí, rising flick', 'nà, falling right'], explain: 'Shù is the vertical stroke.' },
          { id: 'q-ren', prompt: 'What are the two strokes of 人, in order?', hanzi: '人', answer: 'piě, then nà', wrong: ['nà, then piě', 'héng, then shù', 'diǎn, then héng'], explain: 'The left stroke is written first.' },
          { id: 'q-gou', prompt: 'What is a gōu?', answer: 'A hook at the end of a stroke', wrong: ['A short dot', 'A flat line', 'A long falling stroke'], explain: 'Gōu means hook.' },
          { id: 'q-zhe', prompt: 'Which stroke turns a corner without lifting the pen?', answer: 'zhé', wrong: ['héng', 'diǎn', 'tí'], explain: 'Zhé means a turn.' },
          { id: 'q-dian', prompt: 'What does a diǎn look like?', answer: 'A short dot', wrong: ['A long vertical line', 'A flat line', 'A hooked line'], explain: 'Diǎn means dot.' },
        ],
      },
    },
    {
      id: 'writing-2',
      title: 'Stroke order',
      summary: 'Six rules that settle almost every character',
      minutes: 6,
      source: {
        kind: 'static',
        cards: [
          { id: 'top-bottom', title: '三', subtitle: 'Top to bottom', note: 'Write the upper strokes first.', strokeChar: '三' },
          { id: 'left-right', title: '川', subtitle: 'Left to right', note: 'Write the left strokes before the right ones.', strokeChar: '川' },
          { id: 'cross', title: '十', subtitle: 'Horizontal before vertical', note: 'When strokes cross, the horizontal one comes first.', strokeChar: '十' },
          { id: 'falls', title: '人', subtitle: 'Left fall before right fall', note: 'Piě comes before nà.', strokeChar: '人' },
          { id: 'middle', title: '小', subtitle: 'Middle before the sides', note: 'In a symmetrical character, write the centre first.', strokeChar: '小' },
          { id: 'outside', title: '日', subtitle: 'Outside before inside, close the box last', note: 'Draw the frame, then what is inside, then the bottom edge.', strokeChar: '日' },
        ],
        questions: [
          { id: 'q-cross', prompt: 'Which stroke comes first in 十?', hanzi: '十', answer: 'The horizontal stroke', wrong: ['The vertical stroke', 'Either one', 'Both at once'], explain: 'Horizontal before vertical when they cross.' },
          { id: 'q-ren', prompt: 'Which stroke comes first in 人?', hanzi: '人', answer: 'The one falling to the left', wrong: ['The one falling to the right', 'Either one', 'The horizontal one'], explain: 'Piě before nà.' },
          { id: 'q-xiao', prompt: 'Which stroke comes first in 小?', hanzi: '小', answer: 'The middle one', wrong: ['The left dot', 'The right dot', 'The hook'], explain: 'The centre comes before the sides.' },
          { id: 'q-ri', prompt: 'In 日, when is the bottom edge written?', hanzi: '日', answer: 'Last, to close the box', wrong: ['First', 'Right after the left side', 'Before the middle line'], explain: 'Close the box last.' },
          strokes('c1', '大', 3, [2, 4, 5]),
          strokes('c2', '水', 4, [3, 5, 6]),
          strokes('c3', '我', 7, [5, 6, 8]),
          strokes('c4', '国', 8, [6, 7, 9]),
        ],
      },
    },
    {
      id: 'writing-3',
      title: 'Radicals',
      summary: 'The parts that carry a hint of meaning',
      minutes: 5,
      source: {
        kind: 'static',
        cards: [
          { id: 'water', title: '氵', subtitle: 'water', note: 'Seen in 河 hé river and 海 hǎi sea. It sits on the left.', strokeChar: '河' },
          { id: 'person', title: '亻', subtitle: 'person', note: 'Seen in 你 nǐ you and 们 men, the plural mark.', strokeChar: '你' },
          { id: 'mouth', title: '口', subtitle: 'mouth', note: 'Seen in 吃 chī to eat and 喝 hē to drink.', strokeChar: '吃' },
          { id: 'woman', title: '女', subtitle: 'woman', note: 'Seen in 妈 mā mom, 她 tā she and 好 hǎo good.', strokeChar: '妈' },
          { id: 'speech', title: '讠', subtitle: 'speech', note: 'Seen in 说 shuō to say and 谢 xiè to thank.', strokeChar: '说' },
          { id: 'heart', title: '心', subtitle: 'heart', note: 'Seen in 想 xiǎng to think and 您 nín you, polite.', strokeChar: '想' },
        ],
        questions: [
          radical('r1', '氵', 'Water', ['Fire', 'Person', 'Speech']),
          radical('r2', '亻', 'Person', ['Water', 'Mouth', 'Tree']),
          radical('r3', '口', 'Mouth', ['Heart', 'Speech', 'Woman']),
          radical('r4', '讠', 'Speech', ['Water', 'Heart', 'Hand']),
          radical('r5', '女', 'Woman', ['Mouth', 'Person', 'Sun']),
          {
            id: 'q-speak',
            prompt: 'Which character probably has something to do with speaking?',
            isHanzi: true,
            answer: '说',
            wrong: ['河', '妈', '想'],
            explain: '说 contains the speech radical 讠.',
          },
          {
            id: 'q-eat',
            prompt: 'Which character probably has something to do with the mouth?',
            isHanzi: true,
            answer: '吃',
            wrong: ['河', '你', '想'],
            explain: '吃 contains the mouth radical 口.',
          },
        ],
      },
    },
    {
      id: 'writing-check',
      title: 'Milestone: Writing basics',
      summary: 'Ten questions mixed from all three lessons',
      minutes: 4,
      source: { kind: 'checkpoint', from: ['writing-1', 'writing-2', 'writing-3'] },
    },
  ],
};
