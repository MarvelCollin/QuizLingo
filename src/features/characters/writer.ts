import HanziWriter, { type CharDataLoaderFn } from 'hanzi-writer';

type WriterOptions = Parameters<typeof HanziWriter.create>[2];

const token = (name: string, fallback: string) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
};

export const strokeUrl = (char: string) => `${import.meta.env.BASE_URL}data/strokes/${encodeURIComponent(char)}.json`;

const loadStrokes: CharDataLoaderFn = (char, onLoad, onError) => {
  fetch(strokeUrl(char))
    .then((response) => {
      if (!response.ok) throw new Error(`No stroke data for ${char}`);
      return response.json();
    })
    .then(onLoad)
    .catch(onError);
};

export const createWriter = (element: HTMLElement, char: string, size: number, options: WriterOptions = {}) =>
  HanziWriter.create(element, char, {
    width: size,
    height: size,
    padding: Math.round(size * 0.06),
    strokeColor: token('--ink', '#14274e'),
    radicalColor: token('--strong', '#394867'),
    highlightColor: token('--strong', '#394867'),
    outlineColor: token('--hairline', '#9ba4b4'),
    drawingColor: token('--strong', '#394867'),
    strokeAnimationSpeed: 1,
    delayBetweenStrokes: 250,
    charDataLoader: loadStrokes,
    ...options,
  });
