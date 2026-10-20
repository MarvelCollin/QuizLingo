import { cn } from '../../lib/utils';
import type { SpinnerProps } from './ui.types';

export const Spinner = ({ className }: SpinnerProps) => (
  <span
    aria-hidden="true"
    className={cn('inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent', className)}
  />
);
