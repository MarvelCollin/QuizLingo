import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { Checkbox } from './checkbox';
import type { ChecklistPopoverProps } from './ui.types';

export const ChecklistPopover = <T extends string | number>({
  label,
  options,
  selected,
  onChange,
}: ChecklistPopoverProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    rootRef.current?.querySelector<HTMLElement>('[role="checkbox"]')?.focus();
    const handlePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const summary = selected.length === 0 ? 'Any' : `${selected.length} selected`;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={`Filter by ${label}, ${summary}`}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex min-h-9 w-full cursor-pointer items-center justify-between gap-1 rounded-sm border px-2 text-sm',
          selected.length > 0 ? 'border-strong font-semibold text-ink' : 'border-line/50 text-muted hover:border-line',
        )}
      >
        {summary}
        <ChevronDown aria-hidden="true" className="size-3.5" strokeWidth={2} />
      </button>
      {isOpen && (
        <div
          id={panelId}
          role="group"
          aria-label={`Filter by ${label}`}
          className="absolute top-full left-0 z-20 mt-1 w-max min-w-[12rem] rounded-lg bg-bg p-1 shadow-overlay"
        >
          {options.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              isChecked={selected.includes(option.value)}
              onChange={(isChecked) =>
                onChange(isChecked ? [...selected, option.value] : selected.filter((v) => v !== option.value))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
