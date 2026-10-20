import type { Lesson, QuestionSeed, Stage } from '../types';

type Line = { zh: string; pinyin: string; en: string };
type Reply = { prompt: string; answer: string; wrong: string[] };

const line = (zh: string, pinyin: string, en: string): Line => ({ zh, pinyin, en });

const sentenceLesson = (id: string, title: string, summary: string, lines: Line[], replies: Reply[]): Lesson => {
  const cards = lines.map((item, index) => ({
    id: `s${index}`,
    title: item.zh,
    subtitle: item.pinyin,
    note: item.en,
    word: item.zh,
  }));
  const meanings = lines.map((item) => item.en);
  const questions: QuestionSeed[] = [
    ...lines.flatMap((item, index): QuestionSeed[] => {
      const wrong = meanings.filter((meaning) => meaning !== item.en);
      const explain = `${item.zh} ${item.pinyin}, ${item.en}`;
      return index % 2 === 0
        ? [{ id: `hear-${index}`, prompt: 'What does this sentence mean?', word: item.zh, answer: item.en, wrong, explain }]
        : [{ id: `read-${index}`, prompt: 'What does this sentence mean?', hanzi: item.zh, answer: item.en, wrong, explain }];
    }),
    ...replies.map(
      (reply, index): QuestionSeed => ({
        id: `reply-${index}`,
        prompt: reply.prompt,
        isHanzi: true,
        answer: reply.answer,
        wrong: reply.wrong,
        explain: `${reply.answer} is the natural reply.`,
      }),
    ),
  ];
  return { id, title, summary, minutes: 5, source: { kind: 'static', cards, questions } };
};

export const SENTENCES_STAGE: Stage = {
  id: 'sentences',
  title: 'Your first sentences',
  blurb: 'Short things to say on day one. Only words from the HSK 1 list, so you can build on them straight away.',
  lessons: [
    sentenceLesson(
      'sentences-1',
      'Hello and how are you',
      'Greet someone and answer back',
      [
        line('你好！', 'nǐ hǎo', 'Hello!'),
        line('你好吗？', 'nǐ hǎo ma', 'How are you?'),
        line('我很好，谢谢。', 'wǒ hěn hǎo, xièxie', 'I am very well, thank you.'),
        line('你呢？', 'nǐ ne', 'And you?'),
        line('再见！', 'zàijiàn', 'Goodbye!'),
      ],
      [
        { prompt: 'Someone asks 你好吗？ Which reply fits?', answer: '我很好，谢谢。', wrong: ['再见！', '不客气。', '我是学生。'] },
        { prompt: 'You are leaving. What do you say?', answer: '再见！', wrong: ['你好吗？', '对不起。', '我很好。'] },
      ],
    ),
    sentenceLesson(
      'sentences-2',
      'Who you are',
      'Say your name and what you do',
      [
        line('我叫小明。', 'wǒ jiào Xiǎo Míng', 'My name is Xiao Ming.'),
        line('你叫什么名字？', 'nǐ jiào shénme míngzi', 'What is your name?'),
        line('我是学生。', 'wǒ shì xuésheng', 'I am a student.'),
        line('你是老师吗？', 'nǐ shì lǎoshī ma', 'Are you a teacher?'),
        line('我是中国人。', 'wǒ shì Zhōngguó rén', 'I am Chinese.'),
        line('认识你很高兴。', 'rènshi nǐ hěn gāoxìng', 'Nice to meet you.'),
      ],
      [
        { prompt: 'Someone asks 你叫什么名字？ Which reply fits?', answer: '我叫小明。', wrong: ['我很好。', '再见！', '谢谢。'] },
        { prompt: 'Someone asks 你是老师吗？ and you are a student. What do you say?', answer: '我不是老师，我是学生。', wrong: ['我是老师，谢谢。', '我叫老师。', '你好吗？'] },
      ],
    ),
    sentenceLesson(
      'sentences-3',
      'Please, thanks and sorry',
      'The polite words you will use every day',
      [
        line('请坐。', 'qǐng zuò', 'Please sit down.'),
        line('请喝茶。', 'qǐng hē chá', 'Please have some tea.'),
        line('谢谢你。', 'xièxie nǐ', 'Thank you.'),
        line('不客气。', 'bú kèqi', 'You are welcome.'),
        line('对不起。', 'duìbuqǐ', 'I am sorry.'),
        line('没关系。', 'méi guānxi', 'It does not matter.'),
      ],
      [
        { prompt: 'Someone says 谢谢你。 Which reply fits?', answer: '不客气。', wrong: ['对不起。', '请坐。', '再见！'] },
        { prompt: 'Someone says 对不起。 Which reply fits?', answer: '没关系。', wrong: ['不客气。', '你好！', '请喝茶。'] },
      ],
    ),
    sentenceLesson(
      'sentences-4',
      'Small talk',
      'Likes, friends and the day',
      [
        line('你有朋友吗？', 'nǐ yǒu péngyou ma', 'Do you have friends?'),
        line('我有一个朋友。', 'wǒ yǒu yí gè péngyou', 'I have one friend.'),
        line('今天星期几？', 'jīntiān xīngqī jǐ', 'What day of the week is it today?'),
        line('今天星期一。', 'jīntiān xīngqī yī', 'Today is Monday.'),
        line('我喜欢喝茶。', 'wǒ xǐhuan hē chá', 'I like to drink tea.'),
        line('你喜欢吃什么？', 'nǐ xǐhuan chī shénme', 'What do you like to eat?'),
      ],
      [
        { prompt: 'Someone asks 今天星期几？ Which reply fits?', answer: '今天星期一。', wrong: ['我喜欢喝茶。', '我有一个朋友。', '没关系。'] },
        { prompt: 'Someone asks 你喜欢吃什么？ Which reply fits?', answer: '我喜欢吃米饭。', wrong: ['今天星期一。', '我叫小明。', '对不起。'] },
      ],
    ),
    {
      id: 'sentences-check',
      title: 'Milestone: Your first sentences',
      summary: 'Ten questions mixed from every sentence lesson',
      minutes: 5,
      source: { kind: 'checkpoint', from: ['sentences-1', 'sentences-2', 'sentences-3', 'sentences-4'] },
    },
  ],
};
