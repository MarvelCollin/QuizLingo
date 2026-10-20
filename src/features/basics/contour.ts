import { TONE_PITCH } from './constants';
import type { ToneNumber } from './types';

const SEGMENT = 100;
const GAP = 30;
const PAD_X = 36;
const HEIGHT = 112;
const PAD_Y = 18;
const NEUTRAL_WIDTH = 34;

export type ContourSegment = { d: string; isNeutral: boolean; start: [number, number]; end: [number, number] };

export type Contour = { width: number; height: number; guides: number[]; segments: ContourSegment[] };

const yOf = (pitch: number) => PAD_Y + ((5 - pitch) / 4) * (HEIGHT - 2 * PAD_Y);

const round = (value: number) => Math.round(value * 10) / 10;

const pathOf = (x: number, width: number, pitches: number[]): string => {
  const points = pitches.map((pitch, i) => [x + (width * i) / (pitches.length - 1), yOf(pitch)] as const);
  const [a, b, c] = points;
  if (!c) return `M ${round(a[0])} ${round(a[1])} L ${round(b[0])} ${round(b[1])}`;
  const reach = width * 0.22;
  return [
    `M ${round(a[0])} ${round(a[1])}`,
    `C ${round(a[0] + reach)} ${round(a[1] + (b[1] - a[1]) * 0.9)} ${round(b[0] - reach)} ${round(b[1])} ${round(b[0])} ${round(b[1])}`,
    `C ${round(b[0] + reach)} ${round(b[1])} ${round(c[0] - reach * 1.2)} ${round(c[1])} ${round(c[0])} ${round(c[1])}`,
  ].join(' ');
};

export const contourOf = (tones: ToneNumber[]): Contour => {
  let x = PAD_X;
  const segments = tones.map((tone): ContourSegment => {
    const isNeutral = tone === 5;
    const width = isNeutral ? NEUTRAL_WIDTH : SEGMENT;
    const left = isNeutral ? x + (SEGMENT - NEUTRAL_WIDTH) / 2 : x;
    const pitches = TONE_PITCH[tone];
    const d = pathOf(left, width, pitches);
    const segment: ContourSegment = {
      d,
      isNeutral,
      start: [round(left), round(yOf(pitches[0]))],
      end: [round(left + width), round(yOf(pitches[pitches.length - 1]))],
    };
    x += SEGMENT + GAP;
    return segment;
  });
  return {
    width: PAD_X * 2 + tones.length * SEGMENT + (tones.length - 1) * GAP,
    height: HEIGHT,
    guides: [1, 2, 3, 4, 5].map(yOf).map(round),
    segments,
  };
};
