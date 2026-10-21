import { isWordToken } from './api';

const LONGEST_WORD = 6;

export const splitWords = (text: string, dictionary?: Set<string>) => {
  const chars = [...text];
  const tokens: string[] = [];
  let index = 0;
  while (index < chars.length) {
    let size = 1;
    if (dictionary && isWordToken(chars[index])) {
      for (let length = Math.min(LONGEST_WORD, chars.length - index); length > 1; length--) {
        if (dictionary.has(chars.slice(index, index + length).join(''))) {
          size = length;
          break;
        }
      }
    }
    tokens.push(chars.slice(index, index + size).join(''));
    index += size;
  }
  return tokens;
};
