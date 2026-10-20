import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LEVELS = ['1', '2', '3', '4', '5', '6', '7-9'];
const levelNumber = (level) => (String(level) === '7-9' ? 7 : Number(level));

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => {
    if (arg.startsWith('--')) pairs.push([arg.slice(2), all[i + 1]]);
    return pairs;
  }, []),
);
for (const key of ['syllabus', 'dict', 'cedict', 'out']) {
  if (!args[key]) {
    console.error(`Missing --${key}`);
    process.exit(1);
  }
}

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const MANUAL = readJson(new URL('./manual-meanings.json', import.meta.url));

const TONE_MARKS = {
  a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ',
};

const markSyllable = (syllable) => {
  const match = syllable.match(/^([a-zü:]+)([1-5])$/i);
  if (!match) return syllable;
  let base = match[1].toLowerCase().replace(/u:|v/g, 'ü');
  const tone = Number(match[2]);
  if (tone === 5) return base;
  let target;
  if (base.includes('a')) target = 'a';
  else if (base.includes('e')) target = 'e';
  else if (base.includes('ou')) target = 'o';
  else {
    const vowels = [...base].filter((c) => 'iouü'.includes(c));
    target = vowels[vowels.length - 1];
  }
  if (!target) return base;
  const index = target === 'o' && base.includes('ou') ? base.indexOf('ou') : base.lastIndexOf(target);
  base = base.slice(0, index) + TONE_MARKS[target][tone - 1] + base.slice(index + 1);
  return base;
};

const numericToMarked = (numeric) => numeric.split(/\s+/).map(markSyllable).join(' ');

const normalize = (pinyin) =>
  pinyin.normalize('NFC').toLowerCase().replace(/[\s'’·-]/g, '');

const toneless = (pinyin) =>
  normalize(pinyin).normalize('NFD').replace(/[̀-ͯ]/g, '');

const dictionary = new Map();
for (const word of readJson(args.dict)) {
  if (!dictionary.has(word.s)) dictionary.set(word.s, word);
}

const cedict = readJson(args.cedict);

const syllabus = [];
for (const level of LEVELS) {
  for (const entry of readJson(join(args.syllabus, `hsk-${level}.json`))) {
    syllabus.push({ ...entry, level: levelNumber(entry.level) });
  }
}

const isNote = (meaning) =>
  /^(surname |also pr\.|variant of |old variant of |see |abbr\. for |abbr\. of )/i.test(meaning);
const cleanMeanings = (meanings) =>
  meanings
    .map((m) => m.trim().replace(/^\(bound form\)\s*/, ''))
    .filter((m) => m && !isNote(m));

const isProper = (pinyin) => /^\p{Lu}/u.test(pinyin.normalize('NFC'));
const preferCommon = (items, pinyinOf) => {
  const common = items.filter((item) => !isProper(pinyinOf(item)));
  return common.length > 0 ? common : items;
};

const fromDictionary = (hanzi, pinyin, compare) => {
  const word = dictionary.get(hanzi);
  const forms = preferCommon(
    (word?.f ?? []).filter((f) => f.i?.y && compare(f.i.y) === compare(pinyin)),
    (f) => f.i.y,
  );
  const meanings = [...new Set(cleanMeanings(forms.flatMap((f) => f.m)))];
  if (meanings.length === 0) return null;
  const main = forms.find((f) => cleanMeanings(f.m).length > 0);
  return {
    t: main.t,
    i: { ...main.i, y: pinyin },
    m: meanings,
    c: [...new Set(forms.flatMap((f) => f.c ?? []))],
  };
};

const fromCedict = (hanzi, pinyin, compare) => {
  const entry = cedict[hanzi];
  if (!entry) return null;
  const readings = preferCommon(
    entry.pinyin.filter((p) => compare(numericToMarked(p)) === compare(pinyin)),
    (p) => p,
  );
  const meanings = [
    ...new Set(cleanMeanings(readings.flatMap((p) => (entry.definitions[p] ?? '').split(';')))),
  ];
  if (meanings.length === 0) return null;
  return { t: entry.traditional || hanzi, i: { y: pinyin, n: readings[0] }, m: meanings, c: [] };
};

const warnings = [];

const buildForm = (hanzi, pinyin) => {
  for (const variant of pinyin.split('/')) {
    const form =
      fromDictionary(hanzi, variant, normalize) ??
      fromCedict(hanzi, variant, normalize) ??
      fromDictionary(hanzi, variant, toneless) ??
      fromCedict(hanzi, variant, toneless);
    if (form) return { ...form, i: { ...form.i, y: pinyin } };
  }
  const manual = MANUAL[`${hanzi} ${pinyin}`];
  if (manual) return { t: manual.t, i: { y: pinyin, n: manual.n }, m: manual.m, c: [] };
  warnings.push(`${hanzi} ${pinyin}: no meaning found`);
  return null;
};

const groups = new Map();
for (const entry of syllabus) {
  if (!groups.has(entry.hanzi)) groups.set(entry.hanzi, []);
  groups.get(entry.hanzi).push(entry);
}

mkdirSync(args.out, { recursive: true });

const words = [];
for (const [hanzi, entries] of groups) {
  const forms = [];
  const seen = new Set();
  for (const reading of entries) {
    const key = normalize(reading.pinyin);
    if (seen.has(key)) continue;
    seen.add(key);
    const form = buildForm(hanzi, reading.pinyin);
    if (form) forms.push({ t: form.t, i: { y: form.i.y, n: form.i.n ?? '' }, m: form.m.slice(0, 6) });
  }
  if (forms.length === 0) continue;
  words.push({ s: hanzi, l: Math.min(...entries.map((r) => r.level)), f: forms });
}
writeFileSync(join(args.out, 'words.min.json'), JSON.stringify(words));
for (const level of [1, 2, 3, 4, 5, 6, 7]) {
  console.log(`HSK ${level === 7 ? '7-9' : level}: ${words.filter((w) => w.l === level).length} words`);
}
console.log(`Total: ${words.length} words`);

const unique = [...new Set(warnings)];
if (unique.length > 0) {
  console.log(`\n${unique.length} warnings:`);
  for (const warning of unique) console.log(`  ${warning}`);
}
