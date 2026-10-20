import { cn } from '../../lib/utils';
import { isAnswered, isRight } from './mock-score';
import type { NavigatorProps } from './mock-types';

export const Navigator = ({ items, answers, current, isReviewing, onJump }: NavigatorProps) => (
  <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10" role="group" aria-label="Questions">
    {items.map((item, i) => {
      const answered = isAnswered(answers[i]);
      const right = isReviewing && isRight(item, answers[i]);
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onJump(i)}
          aria-current={i === current ? 'true' : undefined}
          aria-label={`Question ${i + 1}${answered ? ', answered' : ', blank'}${isReviewing ? (right ? ', right' : ', wrong') : ''}`}
          className={cn(
            'h-10 cursor-pointer rounded-md border text-sm font-semibold transition-colors duration-150',
            i === current && 'ring-2 ring-strong ring-offset-1 ring-offset-bg',
            !isReviewing && (answered ? 'border-strong bg-tint text-ink' : 'border-line/50 bg-bg text-muted hover:bg-tint'),
            isReviewing && (right ? 'border-ok-strong bg-ok-tint text-ok-strong' : 'border-bad-strong bg-bad-tint text-bad-strong'),
          )}
        >
          {i + 1}
        </button>
      );
    })}
  </div>
);
