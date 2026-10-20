import type { CharMark, RecognizerConstructor } from './types';

const constructorFor = () => {
  if (typeof window === 'undefined') return null;
  const scope = window as unknown as { SpeechRecognition?: RecognizerConstructor; webkitSpeechRecognition?: RecognizerConstructor };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
};

export const isRecognitionSupported = () => constructorFor() !== null;

export const createRecognizer = () => {
  const Recognizer = constructorFor();
  if (!Recognizer) return null;
  const recognizer = new Recognizer();
  recognizer.lang = 'zh-CN';
  recognizer.interimResults = true;
  recognizer.maxAlternatives = 3;
  recognizer.continuous = false;
  return recognizer;
};

const onlyHanzi = (text: string) => [...text].filter((c) => /[一-鿿]/.test(c));

export const PASS_SCORE = 80;

type BraveNavigator = Navigator & { brave?: { isBrave?: () => Promise<boolean> } };

export const detectBrave = async (): Promise<boolean> => {
  try {
    return Boolean(await (navigator as BraveNavigator).brave?.isBrave?.());
  } catch {
    return false;
  }
};

export const isRecorderSupported = () =>
  typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== 'undefined';

export const PERMANENT_ERRORS = new Set(['network', 'service-not-allowed', 'language-not-supported']);

export const RECOGNITION_ERRORS: Record<string, string> = {
  'not-allowed': 'The microphone is blocked. Allow it in the browser address bar, then try again.',
  'no-speech': 'Nothing was heard. Try again a little closer to the microphone.',
  'audio-capture': 'No microphone was found. Plug one in or check your system sound settings.',
  'service-not-allowed': 'This browser does not allow speech recognition. Try Chrome or Edge.',
  'language-not-supported': 'This browser cannot recognise Chinese speech. Try Chrome or Edge.',
  network:
    'The browser could not reach its speech service. Chrome and Edge send your voice to an online service, so a VPN, a firewall or no internet blocks it. Brave blocks it on purpose.',
};

export const compareSpeech = (target: string, heard: string): { score: number; marks: CharMark[] } => {
  const want = onlyHanzi(target);
  const got = onlyHanzi(heard);
  const rows = want.length + 1;
  const cols = got.length + 1;
  const table = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = want[i - 1] === got[j - 1] ? 0 : 1;
      table[i][j] = Math.min(table[i - 1][j] + 1, table[i][j - 1] + 1, table[i - 1][j - 1] + cost);
    }
  }
  const heardSet = new Map<string, number>();
  for (const c of got) heardSet.set(c, (heardSet.get(c) ?? 0) + 1);
  const marks = want.map((char) => {
    const left = heardSet.get(char) ?? 0;
    if (left > 0) heardSet.set(char, left - 1);
    return { char, isHeard: left > 0 };
  });
  const distance = table[want.length][got.length];
  const score = want.length === 0 ? 0 : Math.max(0, Math.round((1 - distance / Math.max(want.length, got.length)) * 100));
  return { score, marks };
};
