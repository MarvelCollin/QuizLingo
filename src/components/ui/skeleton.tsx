import { cn } from '../../lib/utils';
import type { SkeletonProps } from './ui.types';

export const Skeleton = ({ className }: SkeletonProps) => (
  <span
    aria-hidden="true"
    className={cn('block rounded-sm bg-tint [animation:skeleton-pulse_1.6s_ease-in-out_infinite]', className)}
  />
);
