import type { AudioIndex } from '../study/types';

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (reason: string) => void;
};

const START_TIMEOUT_MS = 6000;
const STOPPED_ERRORS = new Set(['interrupted', 'canceled']);

let recordedWords = new Set<string>();
let recordedSyllables = new Set<string>();
let playing: HTMLAudioElement | null = null;
const speaking = new Set<SpeechSynthesisUtterance>();
let startTimer: number | undefined;
let generation = 0;

export const registerRecordings = (index: AudioIndex) => {
  recordedWords = index.words;
  recordedSyllables = index.syllables;
};

export const hasSyllableRecording = (syllable: string) => recordedSyllables.has(syllable);

export const isSpeechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

const chineseVoice = () =>
  window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().replace('_', '-').startsWith('zh-cn')) ??
  window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('zh'));

const audioUrl = (folder: string, name: string) =>
  `${import.meta.env.BASE_URL}audio/${folder}/${encodeURIComponent(name)}.mp3`;

export const preloadRecording = ({ sound, word }: { sound?: string; word?: string }) => {
  const url = sound ? audioUrl('syllables', sound) : word && recordedWords.has(word) ? audioUrl('words', word) : null;
  if (!url || typeof Audio === 'undefined') return;
  const audio = new Audio(url);
  audio.preload = 'auto';
  audio.load();
};

export const stopSpeaking = () => {
  generation += 1;
  window.clearTimeout(startTimer);
  if (playing) {
    playing.pause();
    playing = null;
  }
  speaking.clear();
  if (isSpeechSupported()) window.speechSynthesis.cancel();
};

const fail = (reason: string, options: SpeakOptions) => {
  if (options.onError) options.onError(reason);
  else options.onEnd?.();
};

const speakWithVoice = (text: string, options: SpeakOptions) => {
  const { rate = 1, pitch = 1, onStart, onEnd } = options;
  if (!isSpeechSupported()) {
    fail('unsupported', options);
    return;
  }
  const turn = generation;
  let isSettled = false;
  const settle = (action: () => void) => {
    if (turn !== generation || isSettled) return;
    isSettled = true;
    window.clearTimeout(startTimer);
    speaking.delete(utterance);
    action();
  };
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.85 * rate;
  utterance.pitch = pitch;
  const voice = chineseVoice();
  if (voice) utterance.voice = voice;
  utterance.onstart = () => {
    if (turn !== generation) return;
    window.clearTimeout(startTimer);
    onStart?.();
  };
  utterance.onend = () => settle(() => onEnd?.());
  utterance.onerror = (event) => {
    if (STOPPED_ERRORS.has(event.error)) return;
    settle(() => fail(event.error, options));
  };
  speaking.add(utterance);
  window.clearTimeout(startTimer);
  startTimer = window.setTimeout(() => {
    if (window.speechSynthesis.speaking) return;
    settle(() => {
      window.speechSynthesis.cancel();
      fail('no-start', options);
    });
  }, START_TIMEOUT_MS);
  window.speechSynthesis.speak(utterance);
};

const playFile = (url: string, fallbackText: string | null, options: SpeakOptions) => {
  const turn = generation;
  let isSettled = false;
  const audio = new Audio(url);
  const settle = (action: () => void) => {
    if (turn !== generation || isSettled) return;
    isSettled = true;
    playing = null;
    action();
  };
  audio.playbackRate = options.rate ?? 1;
  audio.onplay = () => {
    if (turn === generation) options.onStart?.();
  };
  audio.onended = () => settle(() => options.onEnd?.());
  const recover = () =>
    settle(() => {
      if (fallbackText) speakWithVoice(fallbackText, options);
      else fail('recording', options);
    });
  audio.onerror = recover;
  playing = audio;
  audio.play().catch((error: unknown) => {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    recover();
  });
};

export const speak = (text: string, options: SpeakOptions = {}) => {
  stopSpeaking();
  if (recordedWords.has(text)) playFile(audioUrl('words', text), text, options);
  else speakWithVoice(text, options);
};

export const playSyllable = (syllable: string, options: SpeakOptions = {}) => {
  stopSpeaking();
  playFile(audioUrl('syllables', syllable), null, options);
};

export const speakLine = (text: string, options: SpeakOptions = {}) => {
  stopSpeaking();
  speakWithVoice(text, options);
};

export const SPEECH_FAILURE =
  'This browser could not read the audio aloud. Chrome and Edge include a Chinese voice. On other browsers, add a Chinese (Mandarin) voice in your device settings, then try again.';
