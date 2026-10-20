import { shuffle } from '../../lib/random';
import { buildQuestion } from '../practice/build-question';
import { isWordToken } from '../study/api';
import type { Sentence, SentenceIndex } from '../study/types';
import type { HskLevel, Word } from '../vocabulary/types';
import { MOCK_FORMATS } from './mock-format';
import type { ChoiceItem, MockItem, MockPaper, OrderItem } from './mock-types';
import type { ListeningTest, ScriptLine } from './types';

const narrator = (zh: string, en = ''): ScriptLine => ({ speaker: '旁白', zh, py: '', en });

const scriptText = (lines: ScriptLine[]) => lines.map((l) => `${l.speaker}：${l.zh}`).join('\n');

const pickOptions = <T>(correct: T, pool: T[], count: number, key: (value: T) => string) => {
  const seen = new Set([key(correct)]);
  const others: T[] = [];
  for (const candidate of shuffle(pool)) {
    if (seen.has(key(candidate))) continue;
    seen.add(key(candidate));
    others.push(candidate);
    if (others.length === count - 1) break;
  }
  const options = shuffle([correct, ...others]);
  return { options, answer: options.findIndex((o) => key(o) === key(correct)) };
};

const levelSentences = (sentences: SentenceIndex, level: HskLevel) => {
  const exact = sentences.all.filter((s) => s.level === level);
  return exact.length >= 40 ? exact : sentences.all.filter((s) => s.level <= level);
};

const scriptItems = (tests: ListeningTest[], asReading: boolean): ChoiceItem[] =>
  tests.flatMap((test) =>
    test.questions.map((q, i) => ({
      kind: 'choice' as const,
      id: `${test.id}-${i}`,
      instruction: asReading ? 'Read the text and answer the question.' : 'Listen to the recording and answer the question.',
      prompt: q.prompt,
      promptEn: q.promptEn,
      passage: asReading ? test.lines.map((l) => `${l.speaker === '旁白' ? '' : `${l.speaker}：`}${l.zh}`) : [],
      audio: asReading ? [] : test.lines,
      audioKey: test.id,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      transcript: scriptText(test.lines),
    })),
  );

const heardItems = (pool: Sentence[], count: number, optionCount: number): ChoiceItem[] =>
  shuffle(pool)
    .slice(0, count)
    .map((sentence) => {
      const similar = pool.filter((s) => s.id !== sentence.id && Math.abs(s.text.length - sentence.text.length) <= 3);
      const { options, answer } = pickOptions(sentence, similar.length >= optionCount ? similar : pool, optionCount, (s) => s.text);
      return {
        kind: 'choice',
        id: `heard-${sentence.id}`,
        instruction: 'Listen, then pick the sentence you heard.',
        prompt: '',
        promptEn: '',
        passage: [],
        audio: [narrator(sentence.text, sentence.english)],
        audioKey: `s-${sentence.id}`,
        options: options.map((o) => o.text),
        answer,
        explanation: `You heard: ${sentence.text} (${sentence.english})`,
        transcript: sentence.text,
      };
    });

const gapItems = (pool: Sentence[], words: Word[], count: number): ChoiceItem[] => {
  const byHanzi = new Map(words.map((w) => [w.hanzi, w]));
  const items: ChoiceItem[] = [];
  for (const sentence of shuffle(pool)) {
    const target = shuffle(sentence.tokens.filter((t) => isWordToken(t) && byHanzi.has(t) && t.length <= 3))[0];
    if (!target) continue;
    const options = buildQuestion(byHanzi.get(target)!, 'listening', words).options;
    items.push({
      kind: 'choice',
      id: `gap-${sentence.id}`,
      instruction: 'Pick the word that fills the gap.',
      prompt: sentence.tokens.map((t) => (t === target ? '（　　）' : t)).join(''),
      promptEn: sentence.english,
      passage: [],
      audio: [],
      audioKey: '',
      options: options.map((o) => o.label),
      answer: options.findIndex((o) => o.isCorrect),
      explanation: `${sentence.text} (${sentence.english})`,
      transcript: '',
    });
    if (items.length === count) break;
  }
  return items;
};

const replyItems = (tests: ListeningTest[], count: number, optionCount: number): ChoiceItem[] => {
  const pairs = tests.flatMap((t) =>
    t.lines.slice(0, -1).flatMap((line, i) => {
      const next = t.lines[i + 1];
      return line.speaker !== next.speaker && line.speaker !== '旁白' && next.speaker !== '旁白' ? [{ id: `${t.id}-${i}`, ask: line, reply: next }] : [];
    }),
  );
  const replies = pairs.map((p) => p.reply.zh);
  return shuffle(pairs)
    .slice(0, count)
    .map((pair) => {
      const { options, answer } = pickOptions(pair.reply.zh, replies, optionCount, (r) => r);
      return {
        kind: 'choice' as const,
        id: `reply-${pair.id}`,
        instruction: 'Pick the best reply.',
        prompt: pair.ask.zh,
        promptEn: pair.ask.en,
        passage: [],
        audio: [],
        audioKey: '',
        options,
        answer,
        explanation: `${pair.ask.zh} → ${pair.reply.zh} (${pair.reply.en})`,
        transcript: '',
      };
    });
};

const orderItems = (pool: Sentence[], count: number, level: HskLevel): OrderItem[] => {
  const [min, max] = level <= 3 ? [3, 7] : [5, 12];
  return shuffle(pool.filter((s) => {
    const n = s.tokens.filter(isWordToken).length;
    return n >= min && n <= max;
  }))
    .slice(0, count)
    .map((sentence) => {
      const words = sentence.tokens.filter(isWordToken);
      let pieces = shuffle(words);
      if (pieces.join('') === words.join('')) pieces = [...words].reverse();
      return {
        kind: 'order',
        id: `order-${sentence.id}`,
        instruction: 'Put the words in order to make a sentence.',
        english: sentence.english,
        pieces,
        target: words.join(''),
        explanation: `${sentence.text} (${sentence.english})`,
        transcript: '',
      };
    });
};

export const buildMockPaper = (
  level: HskLevel,
  sentences: SentenceIndex,
  words: Word[],
  tests: ListeningTest[],
): MockPaper => {
  const format = MOCK_FORMATS[level];
  const optionCount = level <= 3 ? 3 : 4;
  const pool = levelSentences(sentences, level);
  const levelWords = words.filter((w) => w.level <= level);
  const mixed = shuffle(tests);
  const listeningTests = mixed.filter((_, i) => i % 2 === 0);
  const readingTests = mixed.filter((_, i) => i % 2 === 1);

  const sections = format.sections.map((section) => {
    let items: MockItem[] = [];
    if (section.key === 'listening') {
      const scripted = scriptItems(listeningTests, false).slice(0, Math.ceil(section.count * 0.6));
      items = [...heardItems(pool, section.count - scripted.length, optionCount), ...scripted];
    } else if (section.key === 'reading') {
      const passages = scriptItems(readingTests, true).slice(0, Math.floor(section.count * 0.3));
      const replies = replyItems(tests, Math.floor(section.count * 0.3), optionCount);
      items = [...gapItems(pool, levelWords, section.count - passages.length - replies.length), ...replies, ...passages];
    } else {
      items = orderItems(pool, section.count, level);
    }
    return { ...section, items: items.slice(0, section.count) };
  });
  return { level, format, sections };
};
