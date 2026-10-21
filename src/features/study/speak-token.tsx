import { cn } from '../../lib/utils';
import { speak } from '../practice/speech';
import type { SpeakTokenProps } from './types';

export const SpeakToken = ({ token, className, children }: SpeakTokenProps) => (
  <button
    type="button"
    onClick={() => speak(token)}
    aria-label={`Listen to ${token}`}
    title="Tap to listen"
    className={cn(
      'cursor-pointer rounded-sm decoration-dotted underline-offset-[6px] transition-colors duration-150 hover:bg-tint hover:underline focus-visible:bg-tint',
      className,
    )}
  >
    {children ?? token}
  </button>
);
