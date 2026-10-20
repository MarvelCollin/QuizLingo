import { cn } from '../../lib/utils';
import { STATUS_LABELS } from './status';
import type { WordStatus } from './types';
import type { StatusLabelProps } from './types';

// One shape per state plus the word, so status never depends on color alone
const SHAPES: Record<WordStatus, string> = {
  new: 'h-0.5 w-2.5 bg-muted',
  learning: 'size-2.5 rounded-full border-2 border-strong',
  due: 'size-2.5 rotate-45 bg-accent-strong',
  mastered: 'size-2.5 bg-strong',
};

const TEXT: Record<WordStatus, string> = {
  new: 'text-muted',
  learning: 'text-ink',
  due: 'text-accent-strong font-semibold',
  mastered: 'text-strong font-semibold',
};

export const StatusLabel = ({ status }: StatusLabelProps) => (
  <span className={cn('inline-flex items-center gap-2 text-sm whitespace-nowrap', TEXT[status])}>
    <span aria-hidden="true" className={cn('inline-block shrink-0', SHAPES[status])} />
    {STATUS_LABELS[status]}
  </span>
);
