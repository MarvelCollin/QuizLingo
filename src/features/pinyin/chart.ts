import type { PinyinChart } from './types';

export const INITIALS = ['', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];

export const FINALS = [
  'a', 'o', 'e', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'er',
  'i', 'ia', 'ie', 'iao', 'iu', 'ian', 'in', 'iang', 'ing', 'iong',
  'u', 'ua', 'uo', 'uai', 'ui', 'uan', 'un', 'uang',
  'ü', 'üe', 'üan', 'ün',
];

const FROM_Y: Record<string, string> = {
  i: 'i', in: 'in', ing: 'ing', a: 'ia', ao: 'iao', e: 'ie', ou: 'iu', an: 'ian', ang: 'iang', ong: 'iong',
  u: 'ü', ue: 'üe', uan: 'üan', un: 'ün',
};

const FROM_W: Record<string, string> = { u: 'u', a: 'ua', o: 'uo', ai: 'uai', ei: 'ui', an: 'uan', en: 'un', ang: 'uang' };

const FROM_JQX: Record<string, string> = { u: 'ü', ue: 'üe', uan: 'üan', un: 'ün' };

const splitInitial = (base: string) => {
  const two = ['zh', 'ch', 'sh'].find((pair) => base.startsWith(pair));
  if (two) return two;
  return 'bpmfdtnlgkhjqxrzcsyw'.includes(base[0]) && base.length > 1 ? base[0] : '';
};

export const finalOf = (base: string): { initial: string; final: string } => {
  const initial = splitInitial(base);
  let rest = base.slice(initial.length).replace(/v/g, 'ü');
  if (initial === 'y') rest = FROM_Y[rest] ?? rest;
  else if (initial === 'w') rest = FROM_W[rest] ?? rest;
  else if ('jqx'.includes(initial) && initial) rest = FROM_JQX[rest] ?? rest;
  return { initial, final: rest };
};

export const buildChart = (recorded: Iterable<string>): PinyinChart => {
  const tones = new Map<string, Set<number>>();
  for (const name of recorded) {
    const base = name.slice(0, -1);
    const tone = Number(name.slice(-1));
    if (!base || !(tone >= 1 && tone <= 5)) continue;
    if (!tones.has(base)) tones.set(base, new Set());
    tones.get(base)!.add(tone);
  }
  const cells = new Map<string, string>();
  for (const base of tones.keys()) {
    const { initial, final } = finalOf(base);
    if (INITIALS.includes(initial) && FINALS.includes(final)) cells.set(`${initial}|${final}`, base);
  }
  const usedFinals = FINALS.filter((final) => INITIALS.some((initial) => cells.has(`${initial}|${final}`)));
  const usedInitials = INITIALS.filter((initial) => usedFinals.some((final) => cells.has(`${initial}|${final}`)));
  return { initials: usedInitials, finals: usedFinals, cells, tones };
};
