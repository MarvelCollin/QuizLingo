import { readFileSync } from 'node:fs';

const [file, levelArg] = process.argv.slice(2);
if (!file || !levelArg) {
  console.error('Usage: node scripts/check-content.mjs <file.json> <level 1-7>');
  process.exit(1);
}

const level = Number(levelArg);
const words = JSON.parse(readFileSync('public/data/words.min.json', 'utf8'));
const levelOf = new Map(words.map((w) => [w.s, w.l]));
const longest = Math.max(...words.map((w) => w.s.length));
const SKIP = /[\s，。？！、：；“”‘’（）《》…—,.?!:;0-9A-Za-z_＿-]/;

const check = (text) => {
  const problems = [];
  let i = 0;
  while (i < text.length) {
    if (SKIP.test(text[i])) {
      i += 1;
      continue;
    }
    let found = '';
    for (let size = Math.min(longest, text.length - i); size > 0; size -= 1) {
      if (levelOf.has(text.slice(i, i + size))) {
        found = text.slice(i, i + size);
        break;
      }
    }
    if (!found) {
      problems.push(`${text[i]} (not an HSK word)`);
      i += 1;
      continue;
    }
    if (levelOf.get(found) > level) problems.push(`${found} (HSK ${levelOf.get(found) === 7 ? '7-9' : levelOf.get(found)})`);
    i += found.length;
  }
  return problems;
};

const strings = [];
const walk = (value, path) => {
  if (typeof value === 'string') {
    if (/[一-鿿]/.test(value) && !/(^|\.)(py|pinyin|en|english|title|explanation|promptEn|point|speaker|category|group|detail|scene|id)$/.test(path)) strings.push([path, value]);
  } else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k);
};
walk(JSON.parse(readFileSync(file, 'utf8')), '');

let count = 0;
for (const [path, text] of strings) {
  const problems = check(text);
  if (problems.length === 0) continue;
  count += 1;
  console.log(`${path}: ${text}\n  ${[...new Set(problems)].join(', ')}`);
}
console.log(count === 0 ? `OK: ${strings.length} Chinese strings, all within HSK ${level}` : `${count} of ${strings.length} strings use words above HSK ${level} or outside the list`);
process.exit(count === 0 ? 0 : 1);
