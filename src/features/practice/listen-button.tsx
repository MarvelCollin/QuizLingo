import { Volume2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { isSpeechSupported, speak } from './speech';
import type { ListenButtonProps } from './types';

export const ListenButton = ({ text, label = 'Listen', size = 'md', className }: ListenButtonProps) => {
  if (!isSpeechSupported()) return null;
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      aria-label={label ? undefined : `Listen to ${text}`}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-md font-semibold text-strong transition-colors duration-150 hover:bg-tint active:bg-soft',
        size === 'md' ? 'min-h-11 px-3 text-sm' : 'min-h-12 px-5 text-base',
        className,
      )}
    >
      <Volume2 aria-hidden="true" className={size === 'md' ? 'size-4' : 'size-5'} strokeWidth={1.75} />
      {label}
    </button>
  );
};
