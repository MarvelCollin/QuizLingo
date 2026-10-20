import type { KeyHintProps } from './types';
export const KeyHint = ({ children }: KeyHintProps) => (
  <kbd className="hidden rounded-sm border border-current/60 px-1.5 font-sans text-xs font-semibold sm:inline">
    {children}
  </kbd>
);
