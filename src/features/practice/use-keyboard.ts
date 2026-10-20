import { useEffect, useRef } from 'react';

export const useKeyboard = (onKey: (key: string) => boolean | void) => {
  const handler = useRef(onKey);
  useEffect(() => {
    handler.current = onKey;
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      if (handler.current(event.key) === true) event.preventDefault();
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
};
