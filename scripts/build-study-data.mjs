import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pinyin } from 'pinyin-pro';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => {
    if (arg.startsWith('--')) pairs.push([arg.slice(2), all[i + 1]]);
    return pairs;
  }, []),
);
for (const key of ['tatoeba', 'hanzi', 'cedict', 'audio']) {
  if (!args[key]) {
    console.error(`Missing --${key}`);
    process.exit(1);
  }
}

const OUT = 'public/data';
const AUDIO_OUT = 'public/audio';
const STROKES = 'node_modules/hanzi-writer-data';
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const readLines = (path) => readFileSync(path, 'utf8').split(/\r?\n/);

const words = readJson(join(OUT, '3.min.json'));
const levelOf = new Map(words.map((w) => [w.s, w.l]));
const longest = Math.max(...words.map((w) => w.s.length));

const PUNCTUATION = new Set('，。？！、：；“”‘’（）《》…—,.?!:;');

const segment = (text) => {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (PUNCTUATION.has(char)) {
      tokens.push(char);
      i += 1;
      continue;
    }
    if (/\d/.test(char)) {
      let j = i;
      while (j < text.length && /\d/.test(text[j])) j += 1;
      tokens.push(text.slice(i, j));
      i = j;
      continue;
    }
    let found = '';
    for (let size = Math.min(longest, text.length - i); size > 0; size -= 1) {
      if (levelOf.has(text.slice(i, i + size))) {
        found = text.slice(i, i + size);
        break;
      }
    }
    if (!found) return null;
    tokens.push(found);
    i += found.length;
  }
  return tokens;
};

const english = new Map();
for (const line of readLines(join(args.tatoeba, 'eng_sentences.tsv'))) {
  const [id, , text] = line.split('\t');
  if (text) english.set(id, text);
}
const translations = new Map();
for (const line of readLines(join(args.tatoeba, 'cmn-eng_links.tsv'))) {
  const [from, to] = line.split('\t');
  if (!to || !english.has(to.trim())) continue;
  if (!translations.has(from)) translations.set(from, english.get(to.trim()));
}

const candidates = [];
const seenText = new Set();
for (const line of readLines(join(args.tatoeba, 'cmn_sentences.tsv'))) {
  const [id, , text] = line.split('\t');
  if (!text || seenText.has(text) || !translations.has(id)) continue;
  if (text.length < 4 || text.length > 22 || /[A-Za-z]/.test(text)) continue;
  const tokens = segment(text);
  if (!tokens) continue;
  const content = tokens.filter((t) => levelOf.has(t));
  if (content.length < 2) continue;
  seenText.add(text);
  candidates.push({ id: Number(id), text, tokens, content, level: Math.max(...content.map((t) => levelOf.get(t))) });
}

const PER_WORD = 4;
const uses = new Map();
const chosen = new Map();
candidates.sort((a, b) => a.text.length - b.text.length || a.id - b.id);
for (const sentence of candidates) {
  const needs = sentence.content.some((t) => (uses.get(t) ?? 0) < PER_WORD);
  if (!needs) continue;
  chosen.set(sentence.id, sentence);
  for (const t of new Set(sentence.content)) uses.set(t, (uses.get(t) ?? 0) + 1);
}

const sentences = [...chosen.values()]
  .sort((a, b) => a.level - b.level || a.text.length - b.text.length)
  .map((s) => {
    const syllables = pinyin(s.text, { type: 'array', toneType: 'symbol', nonZh: 'consecutive' });
    let index = 0;
    const tokenPinyin = s.tokens.map((token) => {
      if (PUNCTUATION.has(token) || /^\d+$/.test(token)) {
        index += token.length;
        return '';
      }
      const part = syllables.slice(index, index + token.length).join('');
      index += token.length;
      return part;
    });
    return { i: s.id, z: s.text, w: s.tokens, p: tokenPinyin, e: translations.get(String(s.id)), l: s.level };
  });
writeFileSync(join(OUT, 'sentences.min.json'), JSON.stringify(sentences));
const covered = words.filter((w) => uses.has(w.s)).length;
console.log(`Sentences: ${sentences.length}, words with an example: ${covered} of ${words.length}`);

const TONE_MARKS = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' };
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
  else target = [...base].filter((c) => 'iouü'.includes(c)).pop();
  if (!target) return base;
  const index = target === 'o' && base.includes('ou') ? base.indexOf('ou') : base.lastIndexOf(target);
  return base.slice(0, index) + TONE_MARKS[target][tone - 1] + base.slice(index + 1);
};

const listFile = (folder, name) =>
  readLines(join(args.hanzi, folder, name))
    .map((l) => l.trim())
    .filter(Boolean);

const recognise = [1, 2, 3].map((level) => listFile('HSK Hanzi', `HSK_Level_${level}_hanzi.txt`));
const write = [listFile('HSK Handwritten', 'HSK_Level_1-2_handwritten.txt'), listFile('HSK Handwritten', 'HSK_Level_3_handwritten.txt')];
const writeLevel = new Map([...write[0].map((c) => [c, 2]), ...write[1].map((c) => [c, 3])]);

const readingsOf = new Map();
for (const word of words) {
  for (const form of word.f) {
    const syllables = form.i.n.toLowerCase().split(' ');
    if (syllables.length !== word.s.length) continue;
    [...word.s].forEach((char, k) => {
      if (!readingsOf.has(char)) readingsOf.set(char, []);
      readingsOf.get(char).push({ syllable: syllables[k], level: word.l, word: word.s });
    });
  }
}

const cedict = readJson(args.cedict);
const isNote = (m) => /^(surname |also pr\.|variant of |old variant of |see |abbr\. for |abbr\. of |CL:)/i.test(m);
const meaningsFor = (char, syllable) => {
  const entry = cedict[char];
  if (!entry) return [];
  const same = entry.pinyin.filter((p) => p.toLowerCase().replace('u:', 'v') === syllable.replace('u:', 'v'));
  const keys = same.length > 0 ? same : entry.pinyin;
  return [
    ...new Set(
      keys
        .flatMap((k) => (entry.definitions[k] ?? '').split(';'))
        .map((m) => m.trim().replace(/^\(bound form\)\s*/, ''))
        .filter((m) => m && !isNote(m)),
    ),
  ].slice(0, 4);
};

const hanzi = [];
const missing = [];
recognise.forEach((list, i) => {
  for (const char of list) {
    const readings = (readingsOf.get(char) ?? []).sort((a, b) => a.level - b.level);
    const counts = new Map();
    for (const r of readings.filter((r) => r.level === readings[0].level)) counts.set(r.syllable, (counts.get(r.syllable) ?? 0) + 1);
    const syllable =
      [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
      cedict[char]?.pinyin.map((p) => p.toLowerCase())[0] ??
      '';
    const meanings = meaningsFor(char, syllable);
    if (!syllable || meanings.length === 0) missing.push(char);
    hanzi.push({
      c: char,
      l: i + 1,
      x: writeLevel.get(char) ?? 0,
      y: markSyllable(syllable),
      n: syllable,
      m: meanings,
      w: [...new Set(readings.map((r) => r.word))].slice(0, 4),
    });
  }
});
writeFileSync(join(OUT, 'hanzi.min.json'), JSON.stringify(hanzi));
console.log(`Characters: ${hanzi.length}, to write: ${hanzi.filter((h) => h.x > 0).length}, without reading or meaning: ${missing.join(' ') || 'none'}`);

const strokeDir = join(OUT, 'strokes');
rmSync(strokeDir, { recursive: true, force: true });
mkdirSync(strokeDir, { recursive: true });
const noStrokes = [];
for (const { c } of hanzi) {
  const source = join(STROKES, `${c}.json`);
  if (existsSync(source)) copyFileSync(source, join(strokeDir, `${c}.json`));
  else noStrokes.push(c);
}
copyFileSync(join(STROKES, 'ARPHICPL.TXT'), join(strokeDir, 'ARPHICPL.TXT'));
console.log(`Stroke files: ${hanzi.length - noStrokes.length}, missing: ${noStrokes.join(' ') || 'none'}`);

rmSync(AUDIO_OUT, { recursive: true, force: true });
mkdirSync(join(AUDIO_OUT, 'words'), { recursive: true });
mkdirSync(join(AUDIO_OUT, 'syllables'), { recursive: true });

const wordAudio = [];
for (const { s } of words) {
  const source = join(args.audio, 'hsk', `cmn-${s}.mp3`);
  if (!existsSync(source)) continue;
  copyFileSync(source, join(AUDIO_OUT, 'words', `${s}.mp3`));
  wordAudio.push(s);
}

const bases = new Set();
for (const word of words) {
  for (const form of word.f) {
    for (const syllable of form.i.n.toLowerCase().split(' ')) {
      const match = syllable.replace(/u:|ü/g, 'v').match(/^([a-z]+)[1-5]$/);
      if (match) bases.add(match[1]);
    }
  }
}
const syllableAudio = [];
for (const base of [...bases].sort()) {
  for (const tone of [1, 2, 3, 4]) {
    const source = join(args.audio, 'syllabs', `cmn-${base}${tone}.mp3`);
    if (!existsSync(source)) continue;
    copyFileSync(source, join(AUDIO_OUT, 'syllables', `${base}${tone}.mp3`));
    syllableAudio.push(`${base}${tone}`);
  }
}
writeFileSync(join(OUT, 'audio.json'), JSON.stringify({ words: wordAudio, syllables: syllableAudio }));
console.log(`Word recordings: ${wordAudio.length} of ${words.length}, syllable recordings: ${syllableAudio.length}`);
