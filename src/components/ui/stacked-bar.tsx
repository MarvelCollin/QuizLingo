import { cn } from '../../lib/utils';
import type { StackedBarProps } from './ui.types';


// A horizontal bar split into parts. The text summary is the accessible name, so color is never the only cue.
export const StackedBar = ({ segments, total, label, className }: StackedBarProps) => {
  const summary = segments.map((s) => `${s.value} ${s.label}`).join(', ');
  return (
    <div
      role="img"
      aria-label={`${label}: ${summary}, out of ${total}`}
      className={cn('flex h-2.5 w-full overflow-hidden rounded-sm bg-tint', className)}
    >
      {segments.map((segment) =>
        segment.value > 0 ? (
          <span
            key={segment.label}
            className={cn('h-full', segment.className)}
            style={{ width: `${(segment.value / Math.max(total, 1)) * 100}%` }}
          />
        ) : null,
      )}
    </div>
  );
};
