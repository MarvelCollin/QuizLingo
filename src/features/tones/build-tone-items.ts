import { shuffle } from '../../lib/random';
import type { AudioIndex } from '../study/types';
import { markTone, splitSyllable } from '../vocabulary/pinyin';
import type { HskLevel, Word } from '../vocabulary/types';
import type { ToneItem, ToneKind } from './types';

const TONES = [1, 2, 3, 4];

const syllableItems = (words: Word[], audio: AudioIndex): ToneItem[] => {
  const seen = new Map<string, ToneItem>();
  for (const word of words) {
    const chars = [...word.hanzi];
    for (const reading of word.readings) {
      const syllables = reading.numeric.split(' ');
      if (syllables.length !== chars.length) continue;
      syllables.forEach((numeric, i) => {
        const parts = splitSyllable(numeric);
        if (!parts || parts.tone > 4) return;
        const sound = `${parts.base}${parts.tone}`;
        if (seen.has(sound) || !audio.syllables.has(sound)) return;
        seen.set(sound, {
          key: sound,
          kind: 'syllable',
          sound,
          answer: markTone(parts.base, parts.tone),
          hanzi: chars[i],
          meaning: `as in ${word.hanzi}, ${word.meaning}`,
          options: TONES.map((tone) => ({ label: markTone(parts.base, tone), isCorrect: tone === parts.tone })),
        });
      });
    }
  }
  return [...seen.values()];
};

const TONE_SHAPES = ['ˉ  Tone 1, high and flat', 'ˊ  Tone 2, rising', 'ˇ  Tone 3, dipping', 'ˋ  Tone 4, falling'];

const basicItems = (words: Word[], audio: AudioIndex): ToneItem[] => {
  const examples = new Map(syllableItems(words, audio).map((item) => [item.sound, item]));
  return [...audio.syllables].flatMap((sound) => {
    const parts = splitSyllable(sound);
    if (!parts || parts.tone > 4) return [];
    const example = examples.get(sound);
    return [
      {
        key: sound,
        kind: 'basic' as const,
        sound,
        answer: markTone(parts.base, parts.tone),
        hanzi: example?.hanzi ?? '',
        meaning: example?.meaning ?? '',
        prompt: markTone(parts.base, 0),
        options: TONES.map((tone) => ({ label: TONE_SHAPES[tone - 1], isCorrect: tone === parts.tone })),
      },
    ];
  });
};

const pairItems = (words: Word[], audio: AudioIndex): ToneItem[] =>
  words
    .filter((w) => w.hanzi.length === 2 && w.readings.length === 1 && audio.words.has(w.hanzi))
    .flatMap((word) => {
      const parts = word.readings[0].numeric.split(' ').map(splitSyllable);
      if (parts.length !== 2 || parts.some((p) => !p)) return [];
      const [first, second] = parts as { base: string; tone: number }[];
      const label = (a: number, b: number) => `${markTone(first.base, a)} ${markTone(second.base, b)}`;
      const correct = label(first.tone, second.tone);
      const others = shuffle(TONES.flatMap((a) => TONES.map((b) => label(a, b))).filter((l) => l !== correct)).slice(0, 3);
      return [
        {
          key: word.hanzi,
          kind: 'pair' as const,
          sound: word.hanzi,
          answer: correct,
          hanzi: word.hanzi,
          meaning: word.meaning,
          options: shuffle([{ label: correct, isCorrect: true }, ...others.map((l) => ({ label: l, isCorrect: false }))]),
        },
      ];
    });

export const toneItemsFor = (words: Word[], audio: AudioIndex, kind: ToneKind, level: HskLevel) => {
  if (kind === 'basic') return basicItems(words, audio);
  const inLevel = words.filter((w) => w.level === level);
  return kind === 'syllable' ? syllableItems(inLevel, audio) : pairItems(inLevel, audio);
};
