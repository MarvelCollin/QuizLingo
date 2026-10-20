export const isSpeechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

const chineseVoice = () =>
  window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().replace('_', '-').startsWith('zh-cn')) ??
  window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('zh'));

// Reads Chinese text aloud with the browser's built-in voice
export const speak = (text: string) => {
  if (!isSpeechSupported()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.85;
  const voice = chineseVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};
