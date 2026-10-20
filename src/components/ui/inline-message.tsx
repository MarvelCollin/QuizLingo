import { cn } from '../../lib/utils';
import type { InlineMessageProps } from './ui.types';

export const InlineMessage = ({ tone = 'info', children, action, className }: InlineMessageProps) => (
  <div
    role={tone === 'error' ? 'alert' : 'status'}
    className={cn(
      'flex flex-wrap items-center justify-between gap-3 rounded-md px-4 py-3 text-sm',
      tone === 'error' ? 'bg-bad-tint text-bad-strong' : 'bg-tint text-ink',
      className,
    )}
  >
    <p className="font-medium">{children}</p>
    {action}
  </div>
);
