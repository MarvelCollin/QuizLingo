import { useEffect, useRef, useState } from 'react';
import { speakLine, stopSpeaking } from '../practice/speech';
import type { ScriptLine } from './types';

const PITCH = { 男: 0.8, 女: 1.15, 旁白: 1 } as const;

export const useSequencePlayer = () => {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const run = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  const stop = () => {
    run.current += 1;
    window.clearTimeout(timer.current);
    stopSpeaking();
    setPlayingKey(null);
  };

  useEffect(
    () => () => {
      run.current += 1;
      window.clearTimeout(timer.current);
      stopSpeaking();
    },
    [],
  );

  const play = (key: string, lines: ScriptLine[], repeat = 1) => {
    run.current += 1;
    const token = run.current;
    window.clearTimeout(timer.current);
    setPlayingKey(key);
    const queue = Array.from({ length: repeat }, () => lines).flat();
    const step = (index: number) => {
      if (token !== run.current) return;
      if (index >= queue.length) {
        setPlayingKey(null);
        return;
      }
      const isNewRound = index > 0 && index % lines.length === 0;
      const line = queue[index];
      timer.current = window.setTimeout(
        () =>
          speakLine(line.zh, {
            pitch: PITCH[line.speaker] ?? 1,
            onEnd: () => step(index + 1),
          }),
        isNewRound ? 1500 : index === 0 ? 0 : 400,
      );
    };
    step(0);
  };

  return { playingKey, play, stop };
};
