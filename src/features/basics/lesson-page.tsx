import { useState } from 'react';
import { useParams } from 'react-router';
import { ButtonLink } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { useAudioIndex } from '../study/use-study-data';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import { lessonById } from './curriculum';
import { LessonRun } from './lesson-run';
import type { LessonPhase } from './types';
import { useBasicsPath } from './use-basics';

const LessonSkeleton = () => (
  <div className="mx-auto flex max-w-2xl flex-col gap-6" aria-busy="true" aria-label="Loading the lesson">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-72 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
);

const LessonPage = () => {
  const { lessonId = '' } = useParams();
  const lesson = lessonById(lessonId);
  usePageMeta(lesson?.title ?? 'Lesson', lesson?.summary);

  const { path, isPending: isPathPending, isError: isPathError, error: pathError } = useBasicsPath();
  const vocabulary = useVocabulary();
  const audio = useAudioIndex();
  const needsData = lesson?.source.kind !== 'static';
  const [run, setRun] = useState({ id: 0, phase: null as LessonPhase | null });

  if (!lesson) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <h1 className="text-2xl font-bold text-ink">Lesson not found</h1>
        <p className="text-base text-muted">This link does not match a lesson on the starter path.</p>
        <ButtonLink to="/basics" className="self-start">
          Back to the starter path
        </ButtonLink>
      </div>
    );
  }

  if (isPathError) return <InlineMessage tone="error">{pathError.message}</InlineMessage>;
  if (isPathPending || !path || (needsData && (vocabulary.isPending || audio.isPending))) return <LessonSkeleton />;
  if (vocabulary.isError || audio.isError) {
    return <InlineMessage tone="error">{(vocabulary.error ?? audio.error)?.message}</InlineMessage>;
  }

  const state = path.stages.flatMap((s) => s.lessons).find((l) => l.lesson.id === lesson.id);
  if (state?.status === 'locked') {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <h1 className="text-2xl font-bold text-ink">{lesson.title} is not open yet</h1>
        <p className="text-base text-muted">Finish the lesson before it first, or pass the milestone of the stage before this one.</p>
        <ButtonLink to="/basics" className="self-start">
          Back to the starter path
        </ButtonLink>
      </div>
    );
  }

  return (
    <LessonRun
      key={run.id}
      lesson={lesson}
      context={{ vocabulary: vocabulary.data ?? [], audioWords: audio.data?.words ?? new Set() }}
      initialPhase={run.phase}
      onRestart={(phase) => setRun({ id: run.id + 1, phase })}
    />
  );
};

export default LessonPage;
