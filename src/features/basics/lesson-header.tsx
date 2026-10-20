import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { StackedBar } from '../../components/ui/stacked-bar';
import type { LessonHeaderProps } from './types';

// Always shows the way out, what you are doing, and how far along you are
export const LessonHeader = ({ label, position, total, segments }: LessonHeaderProps) => (
  <div className="flex items-center gap-4">
    <Link
      to="/basics"
      className="-ml-3 inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-strong hover:bg-tint"
    >
      <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} />
      Starter path
    </Link>
    <div className="flex-1">
      <div className="flex justify-between text-sm text-muted">
        <span>{label}</span>
        <span aria-live="polite">
          {Math.min(position, total)} of {total}
        </span>
      </div>
      <StackedBar label={label} total={total} className="mt-1.5 h-1.5" segments={segments} />
    </div>
  </div>
);
