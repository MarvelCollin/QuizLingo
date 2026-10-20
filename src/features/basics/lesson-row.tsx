import { Check, Circle, CircleDot, Flag, Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '../../lib/utils';
import type { LessonRowProps, LessonState, LessonStatus } from './types';

type GlyphProps = { status: LessonStatus; isCheckpoint: boolean; isNext: boolean };

const Glyph = ({ status, isCheckpoint, isNext }: GlyphProps) => {
  let glyph: ReactNode;
  if (status === 'done') glyph = <Check aria-hidden="true" className="size-5 text-ok-strong" strokeWidth={2.5} />;
  else if (status === 'locked') glyph = <Lock aria-hidden="true" className="size-5 text-muted" strokeWidth={2} />;
  else if (isCheckpoint) glyph = <Flag aria-hidden="true" className="size-5 text-strong" strokeWidth={2} />;
  else if (status === 'tried') glyph = <CircleDot aria-hidden="true" className="size-5 text-strong" strokeWidth={2} />;
  else glyph = <Circle aria-hidden="true" className="size-5 text-strong" strokeWidth={2} />;
  return (
    <span className="relative flex size-6 shrink-0 items-center justify-center">
      {isNext && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-2 border-primary [animation:ring-pulse_2.2s_var(--ease-out)_infinite]"
        />
      )}
      {glyph}
    </span>
  );
};

const statusWord = ({ status, best, lesson }: LessonState) => {
  if (status === 'done') return best > 0 ? `Passed, best ${best}%` : 'Passed';
  if (status === 'locked') return 'Locked';
  if (status === 'tried') return `Best ${best}%`;
  return `${lesson.minutes} min`;
};

export const LessonRow = ({ state, isNext, delay, hint }: LessonRowProps) => {
  const { lesson, status, isCheckpoint } = state;
  const isLocked = status === 'locked';
  const line = isLocked && hint ? hint : lesson.summary;

  const content = (
    <>
      <Glyph status={status} isCheckpoint={isCheckpoint} isNext={isNext} />
      <span className="min-w-0 flex-1">
        <span className={cn('block text-base font-semibold', isLocked ? 'text-muted' : 'text-ink')}>
          {isNext && <span className="mr-2 text-sm font-bold text-primary">Up next</span>}
          {lesson.title}
        </span>
        <span className="block text-sm text-muted">{line}</span>
      </span>
      <span className={cn('shrink-0 text-right text-sm', status === 'done' ? 'font-semibold text-ok-strong' : 'text-muted')}>
        {statusWord(state)}
      </span>
    </>
  );

  const shared = cn(
    'flex min-h-14 items-center gap-3 rounded-lg px-3 py-2.5 [animation:rise-in_0.3s_var(--ease-out)_both]',
    isCheckpoint && 'border border-line/60',
    isNext && 'bg-surface',
  );
  const style = { animationDelay: `${delay}ms` };

  return (
    <li>
      {isLocked ? (
        <div className={shared} style={style}>
          {content}
        </div>
      ) : (
        <Link
          to={`/basics/${lesson.id}`}
          aria-current={isNext ? 'step' : undefined}
          className={cn(shared, 'transition-colors duration-150 hover:bg-tint')}
          style={style}
        >
          {content}
        </Link>
      )}
    </li>
  );
};
