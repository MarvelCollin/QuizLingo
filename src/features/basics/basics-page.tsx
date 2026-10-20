import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { NextLesson } from './next-lesson';
import { PathSummary } from './path-summary';
import { StageSection } from './stage-section';
import { useBasicsPath } from './use-basics';

const PathSkeleton = () => (
  <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading the starter path">
    <Skeleton className="h-44 w-full" />
    <Skeleton className="h-14 w-full" />
    {[0, 1, 2].map((row) => (
      <Skeleton key={row} className="h-16 w-full" />
    ))}
  </div>
);

const BasicsPage = () => {
  usePageMeta('Starter path', 'A step by step start for new learners: the four tones, the sounds of pinyin, basic strokes and your first words.');
  const { path, data, isPending, isError, error, refetch } = useBasicsPath();
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Starter path</h1>
        <p className="mt-1 text-base text-muted">
          New to Chinese? Go in order. Each stage ends with a milestone, and you can test out of any stage you already know.
        </p>
      </div>

      {isPending && <PathSkeleton />}
      {isError && (
        <InlineMessage
          tone="error"
          action={
            <Button variant="secondary" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        >
          {error.message}
        </InlineMessage>
      )}

      {path && data && (
        <>
          <NextLesson next={path.next} stagesDone={path.stagesDone} isFresh={data.length === 0} />
          <PathSummary
            stagesDone={path.stagesDone}
            stagesTotal={path.stages.length}
            lessonsDone={path.lessonsDone}
            lessonsTotal={path.lessonsTotal}
            percent={path.percent}
          />
          <div className="flex flex-col">
            {path.stages.map((state, index) => {
              const isCurrent = path.next?.stage.id === state.stage.id;
              return (
                <StageSection
                  key={state.stage.id}
                  state={state}
                  index={index}
                  isOpen={toggled[state.stage.id] ?? isCurrent}
                  nextId={path.next?.lesson.id ?? null}
                  onToggle={() =>
                    setToggled((current) => ({ ...current, [state.stage.id]: !(current[state.stage.id] ?? isCurrent) }))
                  }
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default BasicsPage;
