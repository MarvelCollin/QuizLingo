import { Volume2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { playSyllable, speak } from '../practice/speech';
import type { PlayButtonProps } from './types';

// Plays a native syllable recording, or a word with its recording or the browser voice
export const PlayButton = ({ sound, word, label = 'Listen', size = 'md' }: PlayButtonProps) => {
  if (!sound && !word) return null;
  return (
    <button
      type="button"
      onClick={() => (sound ? playSyllable(sound) : speak(word!))}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-md border border-line/60 bg-bg font-semibold text-ink transition-colors duration-150 hover:bg-tint active:bg-soft',
        size === 'md' ? 'min-h-11 px-4 text-base' : 'min-h-12 px-6 text-lg',
      )}
    >
      <Volume2 aria-hidden="true" className={size === 'md' ? 'size-4' : 'size-5'} strokeWidth={1.75} />
      {label}
    </button>
  );
};
