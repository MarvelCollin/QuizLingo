import { useId } from 'react';
import { cn } from '../../lib/utils';
import type { TextFieldProps } from './ui.types';

export const TextField = ({ label, hint, error, className, id, ...rest }: TextFieldProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
        className={cn(
          'min-h-11 rounded-md border bg-bg px-3 text-base text-ink placeholder:text-muted/80',
          'transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-strong',
          error ? 'border-bad-strong' : 'border-line/70 hover:border-line',
        )}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-sm font-medium text-bad-strong">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
};
