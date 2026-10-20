// Lowercase pinyin without tone marks or spaces, so "ni hao", "nǐhǎo" and "nihao" all match
export const plainPinyin = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ü/g, 'u')
    .replace(/[\s'’·-]/g, '')
    .toLowerCase();
