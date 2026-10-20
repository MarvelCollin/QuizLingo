import { shuffle } from '../../lib/random';
import { markTone } from '../vocabulary/pinyin';
import type { SoundGroup, SoundItem, SoundPair } from './types';

const INITIAL_PARTNERS = ['a', 'i', 'u', 'o', 'e', 'ai', 'an', 'ao', 'ou', 'en', 'eng', 'ong', 'ang', 'ui', 'ei'];
const FINAL_PARTNERS = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'z', 'c', 's', ''];

const itemsForPair = (pair: SoundPair, recorded: Set<string>): SoundItem[] => {
  const partners = pair.kind === 'initial' ? INITIAL_PARTNERS : FINAL_PARTNERS;
  const items: SoundItem[] = [];
  for (const partner of partners) {
    const first = pair.kind === 'initial' ? pair.a + partner : partner + pair.a;
    const second = pair.kind === 'initial' ? pair.b + partner : partner + pair.b;
    for (const tone of [1, 2, 3, 4]) {
      if (!recorded.has(`${first}${tone}`) || !recorded.has(`${second}${tone}`)) continue;
      for (const [heard, other] of [
        [first, second],
        [second, first],
      ]) {
        items.push({
          key: `${heard}${tone}`,
          sound: `${heard}${tone}`,
          answer: markTone(heard, tone),
          options: shuffle([
            { label: markTone(heard, tone), isCorrect: true },
            { label: markTone(other, tone), isCorrect: false },
          ]),
          tip: pair.tip,
        });
      }
    }
  }
  return items;
};

export const soundItemsFor = (group: SoundGroup, recorded: Set<string>): SoundItem[] =>
  group.pairs.flatMap((pair) => itemsForPair(pair, recorded));

export const pickRound = (items: SoundItem[], length: number): SoundItem[] => {
  const seen = new Set<string>();
  return shuffle(items)
    .filter((item) => !seen.has(item.key) && seen.add(item.key))
    .slice(0, length);
};
