import { useEffect, useRef } from 'react';

export const useDebouncedCallback = <A extends unknown[]>(callback: (...args: A) => void, delay = 250) => {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef(callback);
  useEffect(() => {
    latest.current = callback;
  });
  useEffect(() => () => clearTimeout(timer.current), []);
  return (...args: A) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => latest.current(...args), delay);
  };
};
