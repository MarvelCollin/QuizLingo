import type { KeyHintProps } from './types';
// Shows the keyboard shortcut on wide screens only, where a keyboard is likely
export const KeyHint = ({ children }: KeyHintProps) => (
  <kbd className="hidden rounded-sm border border-current/40 px-1.5 font-sans text-xs font-semibold opacity-80 sm:inline">
    {children}
  </kbd>
);
