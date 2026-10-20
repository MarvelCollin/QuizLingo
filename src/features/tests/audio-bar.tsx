import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { AudioBarProps } from './types';

const RATES = [0.75, 1, 1.25];

const iconButton =
  'inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-tint disabled:cursor-default disabled:opacity-40';

export const AudioBar = ({ player, total }: AudioBarProps) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-hairline bg-bg px-3 py-2 shadow-raise sm:flex-nowrap sm:px-4 sm:py-3">
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={iconButton}
        aria-label="Previous line"
        disabled={player.current === 0}
        onClick={() => player.playFrom(player.current - 1)}
      >
        <SkipBack aria-hidden="true" className="size-5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={player.toggle}
        aria-label={player.isPlaying ? 'Pause' : 'Play'}
        className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full bg-primary text-on-primary transition-colors duration-150 hover:bg-primary-hover"
      >
        {player.isPlaying ? (
          <Pause aria-hidden="true" className="size-5" strokeWidth={2} />
        ) : (
          <Play aria-hidden="true" className="size-5" strokeWidth={2} />
        )}
      </button>
      <button
        type="button"
        className={iconButton}
        aria-label="Next line"
        disabled={player.current >= total - 1}
        onClick={() => player.playFrom(player.current + 1)}
      >
        <SkipForward aria-hidden="true" className="size-5" strokeWidth={1.75} />
      </button>
    </div>

    <div className="order-last flex w-full min-w-0 flex-col gap-1.5 sm:order-none sm:w-auto sm:flex-1">
      <div className="flex gap-0.5" role="group" aria-label="Jump to a line">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Play from line ${i + 1}`}
            onClick={() => player.playFrom(i)}
            className={cn(
              'h-2.5 flex-1 cursor-pointer rounded-sm transition-colors duration-150',
              i < player.current ? 'bg-strong' : i === player.current ? 'bg-primary' : 'bg-tint hover:bg-soft',
            )}
          />
        ))}
      </div>
      <p className="text-sm text-muted" aria-live="polite">
        Line {player.current + 1} of {total}
        {player.isPlaying ? ', playing' : ''}
      </p>
    </div>

    <div className="ml-auto flex items-center gap-0.5 sm:gap-1" role="radiogroup" aria-label="Speed">
      {RATES.map((rate) => (
        <button
          key={rate}
          type="button"
          role="radio"
          aria-checked={player.rate === rate}
          onClick={() => player.setRate(rate)}
          className={cn(
            'min-h-11 cursor-pointer rounded-md px-1.5 text-sm transition-colors duration-150 sm:px-3',
            player.rate === rate ? 'bg-tint font-semibold text-ink' : 'font-medium text-muted hover:bg-tint hover:text-ink',
          )}
        >
          {rate}x
        </button>
      ))}
    </div>
  </div>
);
