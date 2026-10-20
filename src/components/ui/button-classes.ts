import { cn } from '../../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';
export type ButtonSize = 'md' | 'lg';

export const buttonClasses = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md') =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap select-none',
    'transition-colors duration-150 ease-out cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
    size === 'md' ? 'min-h-11 px-4 text-base' : 'min-h-12 px-6 text-lg',
    variant === 'primary' && 'bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-hover',
    variant === 'secondary' && 'bg-bg text-ink border border-line/60 hover:bg-tint active:bg-soft',
    variant === 'quiet' && 'text-strong hover:bg-tint active:bg-soft',
    variant === 'danger' && 'text-bad-strong hover:bg-bad-tint',
  );
