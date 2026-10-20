export const plainPinyin = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ü/g, 'u')
    .replace(/[\s'’·-]/g, '')
    .toLowerCase();

const TONE_MARKS: Record<string, string> = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' };

export const markTone = (base: string, tone: number) => {
  const letters = base.toLowerCase().replace(/u:|v/g, 'ü');
  if (tone < 1 || tone > 4) return letters;
  const target = letters.includes('a')
    ? 'a'
    : letters.includes('e')
      ? 'e'
      : letters.includes('ou')
        ? 'o'
        : [...letters].filter((c) => 'iouü'.includes(c)).pop();
  if (!target) return letters;
  const index = target === 'o' && letters.includes('ou') ? letters.indexOf('ou') : letters.lastIndexOf(target);
  return letters.slice(0, index) + TONE_MARKS[target][tone - 1] + letters.slice(index + 1);
};

export const splitSyllable = (numeric: string) => {
  const match = numeric.toLowerCase().replace(/u:/g, 'v').match(/^([a-zü]+)([1-5])$/);
  return match ? { base: match[1].replace(/ü/g, 'v'), tone: Number(match[2]) } : null;
};
