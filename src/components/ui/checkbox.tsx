import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CheckboxProps } from './ui.types';

export const Checkbox = ({ label, isChecked, onChange }: CheckboxProps) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={isChecked}
    onClick={() => onChange(!isChecked)}
    className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-sm px-2 text-left text-base text-ink hover:bg-tint"
  >
    <span
      aria-hidden="true"
      className={cn(
        'grid size-5 shrink-0 place-items-center rounded-sm border-2 transition-colors duration-150',
        isChecked ? 'border-strong bg-strong text-on-strong' : 'border-line bg-bg',
      )}
    >
      {isChecked && <Check className="size-3.5" strokeWidth={3} />}
    </span>
    {label}
  </button>
);
