import { useEffect, useRef, useState } from 'react';

export const useCountdown = (seconds: number, isRunning: boolean, onExpire: () => void) => {
  const [left, setLeft] = useState(seconds);
  const leftRef = useRef(seconds);
  const expire = useRef(onExpire);
  useEffect(() => {
    expire.current = onExpire;
    leftRef.current = left;
  });
  useEffect(() => {
    if (!isRunning) return;
    const endsAt = Date.now() + leftRef.current * 1000;
    const id = window.setInterval(() => {
      const next = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setLeft(next);
      if (next === 0) {
        window.clearInterval(id);
        expire.current();
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [isRunning]);
  return {
    left,
    reset: (value: number) => {
      leftRef.current = value;
      setLeft(value);
    },
  };
};

export const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
