import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerRecordings, sayCharacter, speak, speakLine, stopSpeaking } from '../../src/features/practice/speech';
import { splitWords } from '../../src/features/study/split-words';
import { useScriptPlayer } from '../../src/features/tests/use-script-player';
import { useSequencePlayer } from '../../src/features/tests/use-sequence-player';

type Listener = (event: { error: string }) => void;

class FakeUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  voice: unknown = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: Listener | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

const spoken: FakeUtterance[] = [];
let mode: 'works' | 'fails' | 'silent' = 'works';

const synth = {
  speaking: false,
  getVoices: () => [],
  speak: (u: FakeUtterance) => {
    spoken.push(u);
    if (mode === 'fails') {
      setTimeout(() => u.onerror?.({ error: 'synthesis-failed' }), 10);
      return;
    }
    if (mode === 'silent') return;
    synth.speaking = true;
    setTimeout(() => u.onstart?.(), 5);
    setTimeout(() => {
      synth.speaking = false;
      u.onend?.();
    }, 50);
  },
  cancel: () => {
    synth.speaking = false;
    for (const u of spoken) u.onerror?.({ error: 'interrupted' });
  },
};

class FakeAudio {
  static made: FakeAudio[] = [];
  src: string;
  playbackRate = 1;
  onplay: (() => void) | null = null;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private reject: ((error: unknown) => void) | null = null;
  constructor(src: string) {
    this.src = src;
    FakeAudio.made.push(this);
  }
  play() {
    return new Promise<void>((resolve, reject) => {
      this.reject = reject;
      setTimeout(() => {
        if (!this.reject) return;
        this.reject = null;
        this.onplay?.();
        resolve();
      }, 20);
    });
  }
  pause() {
    if (this.reject) {
      const reject = this.reject;
      this.reject = null;
      setTimeout(() => reject(new DOMException('The play() request was interrupted by a call to pause().', 'AbortError')), 0);
    }
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  spoken.length = 0;
  FakeAudio.made = [];
  mode = 'works';
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  vi.stubGlobal('Audio', FakeAudio);
  registerRecordings({ words: new Set(['爱', '半']), syllables: new Set(['re4']) });
});

afterEach(() => {
  stopSpeaking();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('speech', () => {
  it('does not read an interrupted recording aloud with the browser voice', async () => {
    speak('爱');
    speak('半');
    await vi.advanceTimersByTimeAsync(200);
    expect(FakeAudio.made.map((a) => decodeURIComponent(a.src).split('/').at(-1))).toEqual(['爱.mp3', '半.mp3']);
    expect(spoken).toEqual([]);
  });

  it('falls back to the browser voice when a recording cannot play', async () => {
    speak('爱');
    FakeAudio.made[0].onerror?.();
    FakeAudio.made[0].onerror?.();
    await vi.advanceTimersByTimeAsync(10);
    expect(spoken.map((u) => u.text)).toEqual(['爱']);
  });

  it('reports a voice that fails instead of waiting forever', async () => {
    mode = 'fails';
    const onEnd = vi.fn();
    const onError = vi.fn();
    speakLine('你好', { onEnd, onError });
    await vi.advanceTimersByTimeAsync(50);
    expect(onError).toHaveBeenCalledWith('synthesis-failed');
    expect(onEnd).not.toHaveBeenCalled();
  });

  it('reports a voice that never starts', async () => {
    mode = 'silent';
    const onError = vi.fn();
    speakLine('你好', { onError });
    await vi.advanceTimersByTimeAsync(7000);
    expect(onError).toHaveBeenCalledWith('no-start');
  });

  it('ignores the end of a line that was stopped', async () => {
    const onEnd = vi.fn();
    speakLine('你好', { onEnd });
    stopSpeaking();
    await vi.advanceTimersByTimeAsync(100);
    expect(onEnd).not.toHaveBeenCalled();
  });
});

const lines = [
  { speaker: '女' as const, zh: '你好', py: '', en: '' },
  { speaker: '男' as const, zh: '你好吗', py: '', en: '' },
  { speaker: '女' as const, zh: '我很好', py: '', en: '' },
];

describe('listening players', () => {
  it('plays a script from start to end', async () => {
    const { result } = renderHook(() => useScriptPlayer(lines));
    act(() => result.current.playFrom(0));
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(spoken.map((u) => u.text)).toEqual(['你好', '你好吗', '我很好']);
    expect(result.current.current).toBe(2);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.failure).toBeNull();
  });

  it('stops and explains when the device has no voice', async () => {
    mode = 'fails';
    const { result } = renderHook(() => useScriptPlayer(lines));
    act(() => result.current.playFrom(0));
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.failure).toMatch(/could not read the audio/);
    expect(spoken).toHaveLength(1);
  });

  it('gives a mock test play back when the voice fails', async () => {
    mode = 'fails';
    const onFail = vi.fn();
    const { result } = renderHook(() => useSequencePlayer());
    act(() => result.current.play('q1', lines, 2, onFail));
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(onFail).toHaveBeenCalledOnce();
    expect(result.current.playingKey).toBeNull();
    expect(result.current.failure).not.toBeNull();
  });

  it('plays a mock recording twice in a row', async () => {
    const { result } = renderHook(() => useSequencePlayer());
    act(() => result.current.play('q1', lines.slice(0, 1), 2));
    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(spoken.map((u) => u.text)).toEqual(['你好', '你好']);
    expect(result.current.playingKey).toBeNull();
  });
});

describe('tapping words and characters', () => {
  it('splits a line into the longest known words', () => {
    expect(splitWords('你好吗？我很好。', new Set(['你好', '吗', '我', '很', '好']))).toEqual(['你好', '吗', '？', '我', '很', '好', '。']);
    expect(splitWords('苹果多少钱', new Set(['苹果', '多少', '多少钱', '钱']))).toEqual(['苹果', '多少钱']);
    expect(splitWords('你好')).toEqual(['你', '好']);
  });

  it('plays the native syllable for a character when there is one', () => {
    sayCharacter('热', 're4');
    expect(FakeAudio.made.map((a) => decodeURIComponent(a.src).split('/').slice(-2).join('/'))).toEqual(['syllables/re4.mp3']);
    sayCharacter('爱', 'ai4');
    expect(decodeURIComponent(FakeAudio.made.at(-1)!.src).split('/').slice(-2).join('/')).toBe('words/爱.mp3');
    sayCharacter('吗', 'ma5');
    expect(spoken.map((u) => u.text)).toEqual(['吗']);
  });
});
