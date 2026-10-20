import { useId, useRef, type KeyboardEvent } from 'react';
import { cn } from '../../lib/utils';
import type { SegmentedControlProps } from './ui.types';

export const SegmentedControl = <T extends string>({
  label,
  options,
  value,
  onChange,
  isStacked = false,
  isWrapped = false,
}: SegmentedControlProps<T>) => {
  const labelId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-sm font-semibold text-ink">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className={cn(
          'grid gap-1 rounded-lg bg-surface p-1',
          isStacked ? 'grid-cols-1 sm:grid-cols-2' : isWrapped ? 'grid-cols-4' : 'auto-cols-fr grid-flow-col',
        )}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              ref={(node) => {
                refs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                'flex min-h-11 cursor-pointer flex-col justify-center rounded-md py-2 text-left transition-colors duration-150',
                isWrapped ? 'px-1 sm:px-3' : 'px-3',
                isStacked ? 'items-start' : 'items-center text-center',
                isSelected ? 'bg-bg text-ink shadow-raise' : 'text-muted hover:bg-tint hover:text-ink',
              )}
            >
              <span className={cn(isWrapped ? 'text-sm whitespace-nowrap sm:text-base' : 'text-base', isSelected ? 'font-semibold' : 'font-medium')}>
                {option.label}
              </span>
              {option.detail && <span className="text-sm text-muted">{option.detail}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
