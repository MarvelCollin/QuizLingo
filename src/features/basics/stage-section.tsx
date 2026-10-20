import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { STAGES } from './curriculum';
import { LessonRow } from './lesson-row';
import type { StageSectionProps } from './types';

const stageWord = (isDone: boolean, isLocked: boolean, doneCount: number) => {
  if (isDone) return 'Passed';
  if (isLocked) return 'Locked';
  return doneCount > 0 ? 'In progress' : 'Open';
};

export const StageSection = ({ state, index, isOpen, nextId, onToggle }: StageSectionProps) => {
  const { stage, lessons, isDone, isLocked, doneCount } = state;
  const bodyId = `stage-${stage.id}`;
  const previous = STAGES[index - 1];

  const hintFor = (position: number) => {
    if (position === 0) return previous ? `Opens after you pass the milestone of ${previous.title.toLowerCase()}` : undefined;
    return `Finish ${stage.lessons[position - 1].title.toLowerCase()} first`;
  };

  return (
    <section aria-labelledby={`${bodyId}-title`} className="border-t border-hairline pt-2">
      <h2 id={`${bodyId}-title`}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={bodyId}
          className="flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-tint"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-muted">Stage {index + 1}</span>
            <span className={cn('block text-lg font-bold', isLocked ? 'text-muted' : 'text-ink')}>{stage.title}</span>
          </span>
          <span className={cn('shrink-0 text-sm', isDone ? 'font-semibold text-ok-strong' : 'text-muted')}>
            {stageWord(isDone, isLocked, doneCount)}
            {!isLocked && !isDone && `, ${doneCount} of ${lessons.length}`}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn('size-5 shrink-0 text-muted transition-transform duration-200', isOpen && 'rotate-180')}
            strokeWidth={1.75}
          />
        </button>
      </h2>
      {isOpen && (
        <div id={bodyId} className="pb-4">
          <p className="max-w-prose px-3 pb-2 text-base text-muted">{stage.blurb}</p>
          <ol className="flex flex-col gap-1">
            {lessons.map((lesson, position) => (
              <LessonRow
                key={lesson.lesson.id}
                state={lesson}
                isNext={lesson.lesson.id === nextId}
                delay={Math.min(position, 8) * 30}
                hint={hintFor(position)}
              />
            ))}
          </ol>
        </div>
      )}
    </section>
  );
};
