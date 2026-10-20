import type { QuestionSeed, Stage } from '../types';

const said = (id: string, written: string, answer: string, wrong: string[], explain: string): QuestionSeed => ({
  id,
  prompt: `How is ${written} actually said?`,
  answer,
  wrong,
  explain,
});

export const RULES_STAGE: Stage = {
  id: 'rules',
  title: 'Tones that change',
  blurb: 'Four small rules that make real speech sound natural. Learn them once and they apply everywhere.',
  lessons: [
    {
      id: 'rules-1',
      title: 'Two third tones',
      summary: 'The first one turns into tone 2',
      minutes: 4,
      source: {
        kind: 'static',
        cards: [
          { id: 'nihao', title: '你好', subtitle: 'written nǐ hǎo, said ní hǎo', note: 'When two third tones meet, the first one is said as a second tone. The spelling does not change.', word: '你好', tones: [2, 3] },
          { id: 'henhao', title: '很好', subtitle: 'written hěn hǎo, said hén hǎo', note: 'The same rule. The second syllable keeps its dip.', word: '很好', tones: [2, 3] },
          { id: 'shuiguo', title: '水果', subtitle: 'written shuǐguǒ, said shuíguǒ', note: 'It works inside longer words too.', word: '水果', tones: [2, 3] },
          { id: 'keyi', title: '可以', subtitle: 'written kěyǐ, said kéyǐ', note: 'Listen for the rise at the start of the word.', word: '可以', tones: [2, 3] },
        ],
        questions: [
          {
            id: 'q-rule',
            prompt: 'Two third tones in a row. How is the first one said?',
            answer: 'As a second tone, rising',
            wrong: ['As a fourth tone, falling', 'As a full third tone', 'As a first tone, high and flat'],
            explain: 'Third tone followed by third tone becomes second tone followed by third tone.',
          },
          said('q-nihao', '你好 (nǐ hǎo)', 'ní hǎo', ['nǐ hǎo', 'nī hǎo', 'nì hǎo'], 'The first syllable rises.'),
          said('q-henhao', '很好 (hěn hǎo)', 'hén hǎo', ['hěn hǎo', 'hēn hǎo', 'hèn hǎo'], 'The first syllable rises.'),
          said('q-shuiguo', '水果 (shuǐguǒ)', 'shuíguǒ', ['shuǐguǒ', 'shuīguǒ', 'shuìguǒ'], 'The first syllable rises.'),
          {
            id: 'q-which',
            prompt: 'Which word has two third tones in a row?',
            answer: '可以 kěyǐ',
            wrong: ['老师 lǎoshī', '再见 zàijiàn', '学习 xuéxí'],
            explain: 'kě and yǐ are both third tone.',
          },
        ],
      },
    },
    {
      id: 'rules-2',
      title: 'The word 不',
      summary: 'bù becomes bú before tone 4',
      minutes: 4,
      source: {
        kind: 'static',
        cards: [
          { id: 'bu4', title: '不', subtitle: 'bù, not', note: 'On its own, and before tones 1, 2 and 3, it is a fourth tone.', word: '不', tones: [4] },
          { id: 'buhao', title: '不好', subtitle: 'bù hǎo, not good', note: 'Before a third tone it stays bù.', word: '不好', tones: [4, 3] },
          { id: 'buchi', title: '不吃', subtitle: 'bù chī, not eating', note: 'Before a first tone it stays bù.', word: '不吃', tones: [4, 1] },
          { id: 'bushi', title: '不是', subtitle: 'bú shì, is not', note: 'Before a fourth tone it becomes bú, a second tone. Two falling tones in a row would be harsh.', word: '不是', tones: [2, 4] },
          { id: 'buqu', title: '不去', subtitle: 'bú qù, not going', note: 'The same change.', word: '不去', tones: [2, 4] },
        ],
        questions: [
          said('q-1', '不对 (bù duì)', 'bú duì', ['bù duì', 'bǔ duì', 'bū duì'], 'duì is fourth tone, so 不 becomes bú.'),
          said('q-2', '不好 (bù hǎo)', 'bù hǎo', ['bú hǎo', 'bǔ hǎo', 'bū hǎo'], 'hǎo is third tone, so 不 stays bù.'),
          said('q-3', '不吃 (bù chī)', 'bù chī', ['bú chī', 'bǔ chī', 'bū chī'], 'chī is first tone, so 不 stays bù.'),
          said('q-4', '不看 (bù kàn)', 'bú kàn', ['bù kàn', 'bǔ kàn', 'bū kàn'], 'kàn is fourth tone, so 不 becomes bú.'),
          said('q-5', '不来 (bù lái)', 'bù lái', ['bú lái', 'bǔ lái', 'bū lái'], 'lái is second tone, so 不 stays bù.'),
          {
            id: 'q-rule',
            prompt: 'When does 不 change to bú?',
            answer: 'Before a fourth tone',
            wrong: ['Before a first tone', 'Before a third tone', 'Whenever it starts a sentence'],
            explain: 'Only a fourth tone after it triggers the change.',
          },
        ],
      },
    },
    {
      id: 'rules-3',
      title: 'The word 一',
      summary: 'yī, yí or yì depending on what follows',
      minutes: 5,
      source: {
        kind: 'static',
        cards: [
          { id: 'yi1', title: '一', subtitle: 'yī, one', note: 'Counting, on its own, and at the end of a word it keeps tone 1. 第一 dì yī is first.', word: '一', tones: [1] },
          { id: 'yitian', title: '一天', subtitle: 'yì tiān, one day', note: 'Before tones 1, 2 and 3 it is a fourth tone.', word: '一天', tones: [4, 1] },
          { id: 'yiqi', title: '一起', subtitle: 'yìqǐ, together', note: 'Before a third tone it is also a fourth tone.', word: '一起', tones: [4, 3] },
          { id: 'yige', title: '一个', subtitle: 'yí gè, one of something', note: 'Before a fourth tone it becomes a second tone.', word: '一个', tones: [2, 4] },
          { id: 'yici', title: '一次', subtitle: 'yí cì, one time', note: 'The same change.', word: '一次', tones: [2, 4] },
        ],
        questions: [
          said('q-1', '一天 (yī tiān)', 'yì tiān', ['yī tiān', 'yí tiān', 'yǐ tiān'], 'tiān is first tone, so 一 becomes yì.'),
          said('q-2', '一个 (yī gè)', 'yí gè', ['yī gè', 'yì gè', 'yǐ gè'], 'gè is fourth tone, so 一 becomes yí.'),
          said('q-3', '一起 (yī qǐ)', 'yì qǐ', ['yī qǐ', 'yí qǐ', 'yǐ qǐ'], 'qǐ is third tone, so 一 becomes yì.'),
          said('q-4', '一次 (yī cì)', 'yí cì', ['yī cì', 'yì cì', 'yǐ cì'], 'cì is fourth tone, so 一 becomes yí.'),
          said('q-5', '第一 (dì yī)', 'dì yī', ['dì yí', 'dì yì', 'dì yǐ'], 'In a number or ordinal, 一 keeps its original tone 1.'),
        ],
      },
    },
    {
      id: 'rules-4',
      title: 'The half third tone',
      summary: 'Only the dip, without the rise',
      minutes: 3,
      source: {
        kind: 'static',
        cards: [
          { id: 'laoshi', title: '老师', subtitle: 'lǎoshī, teacher', note: 'Before tones 1, 2 and 4 a third tone stays low and flat. The rise at the end is dropped.', word: '老师', tones: [3, 1] },
          { id: 'haoren', title: '好人', subtitle: 'hǎorén, good person', note: 'The first syllable stays low. The second one rises.', word: '好人', tones: [3, 2] },
          { id: 'woqu', title: '我去', subtitle: 'wǒ qù, I go', note: 'The first syllable stays low. The second one falls.', word: '我去', tones: [3, 4] },
        ],
        questions: [
          {
            id: 'q-half',
            prompt: 'Before tones 1, 2 and 4, how is a third tone said?',
            answer: 'Low and flat, without the rise',
            wrong: ['As a rising second tone', 'High and flat', 'With an extra big rise'],
            explain: 'This is called the half third tone.',
          },
          {
            id: 'q-full',
            prompt: 'When does a third tone get its full dip and rise?',
            answer: 'At the end of a phrase or on its own',
            wrong: ['Before a first tone', 'Before a fourth tone', 'Never'],
            explain: 'Alone or at the end, the whole curve is heard.',
          },
          {
            id: 'q-which',
            prompt: 'Which word has a half third tone?',
            answer: '老师 lǎoshī',
            wrong: ['你好 nǐ hǎo', '再见 zàijiàn', '学习 xuéxí'],
            explain: 'lǎo is a third tone before a first tone. The other words have no third tone before a different tone.',
          },
          {
            id: 'q-mark',
            prompt: 'Is the spelling of 老师 changed to show the half third tone?',
            answer: 'No, it is still written lǎoshī',
            wrong: ['Yes, it becomes laōshī', 'Yes, it becomes láoshī', 'Yes, the mark is dropped'],
            explain: 'Spelling shows the base tone. The rules above change how you say it.',
          },
        ],
      },
    },
    {
      id: 'rules-check',
      title: 'Milestone: Tones that change',
      summary: 'Ten questions mixed from all four rules',
      minutes: 4,
      source: { kind: 'checkpoint', from: ['rules-1', 'rules-2', 'rules-3', 'rules-4'] },
    },
  ],
};
