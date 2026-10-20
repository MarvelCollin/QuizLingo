import { useEffect, useRef, useState } from 'react';
import { speakLine, stopSpeaking } from '../practice/speech';
import type { ScriptLine, ScriptPlayer } from './types';

const PITCH = { 男: 0.8, 女: 1.15, 旁白: 1 } as const;
const GAP_MS = 450;

export const useScriptPlayer = (lines: ScriptLine[]): ScriptPlayer => {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const run = useRef(0);
  const rateRef = useRef(rate);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(
    () => () => {
      run.current += 1;
      window.clearTimeout(timer.current);
      stopSpeaking();
    },
    [],
  );

  const speakAt = (index: number, isContinuous: boolean, token: number) => {
    if (token !== run.current) return;
    if (index >= lines.length) {
      setIsPlaying(false);
      return;
    }
    setCurrent(index);
    const line = lines[index];
    speakLine(line.zh, {
      rate: rateRef.current,
      pitch: PITCH[line.speaker] ?? 1,
      onEnd: () => {
        if (token !== run.current) return;
        if (!isContinuous) {
          setIsPlaying(false);
          return;
        }
        timer.current = window.setTimeout(() => speakAt(index + 1, true, token), GAP_MS);
      },
    });
  };

  const start = (index: number, isContinuous: boolean) => {
    run.current += 1;
    window.clearTimeout(timer.current);
    setIsPlaying(true);
    speakAt(Math.max(0, Math.min(index, lines.length - 1)), isContinuous, run.current);
  };

  const pause = () => {
    run.current += 1;
    window.clearTimeout(timer.current);
    stopSpeaking();
    setIsPlaying(false);
  };

  return {
    current,
    isPlaying,
    rate,
    setRate,
    playFrom: (index) => start(index, true),
    playLine: (index) => start(index, false),
    pause,
    toggle: () => (isPlaying ? pause() : start(current >= lines.length - 1 ? 0 : current, true)),
  };
};
