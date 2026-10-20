import type { AudioIndex } from '../study/types';

type SpeakOptions = { rate?: number; onStart?: () => void; onEnd?: () => void };

let recordedWords = new Set<string>();
let recordedSyllables = new Set<string>();
let playing: HTMLAudioElement | null = null;

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

export const stopSpeaking = () => {
  if (playing) {
    playing.onended = null;
    playing.pause();
    playing = null;
  }
  if (isSpeechSupported()) window.speechSynthesis.cancel();
};

const speakWithVoice = (text: string, { rate = 1, onStart, onEnd }: SpeakOptions) => {
  if (!isSpeechSupported()) {
    onEnd?.();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.85 * rate;
  const voice = chineseVoice();
  if (voice) utterance.voice = voice;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
};

const playFile = (url: string, fallbackText: string | null, options: SpeakOptions) => {
  const audio = new Audio(url);
  audio.playbackRate = options.rate ?? 1;
  audio.onplay = () => options.onStart?.();
  audio.onended = () => {
    playing = null;
    options.onEnd?.();
  };
  audio.onerror = () => {
    playing = null;
    if (fallbackText) speakWithVoice(fallbackText, options);
    else options.onEnd?.();
  };
  playing = audio;
  void audio.play().catch(() => audio.onerror?.(new Event('error')));
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
