import { useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { Skeleton } from '../../components/ui/skeleton';
import { percent } from '../../lib/format';
import { usePageMeta } from '../../lib/use-page-meta';
import { useSession } from '../auth/use-session';
import { useStats } from '../progress/use-stats';
import { useProgress } from '../progress/use-progress';
import { useBasicsPath } from '../basics/use-basics';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import { LEVELS } from '../vocabulary/constants';
import type { HskLevel } from '../vocabulary/types';
import type { LevelFilter } from '../practice/types';
import { ActivityChart } from './activity-chart';
import { LevelProgress } from './level-progress';
import { NextStep } from './next-step';
import { RecentRounds } from './recent-rounds';
import { StarterHero } from './starter-hero';
import { StarterStrip } from './starter-strip';
import { SummaryStrip } from './summary-strip';

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading your progress">
    <Skeleton className="h-8 w-56" />
    <Skeleton className="h-44 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-48 w-full" />
  </div>
);

const DashboardPage = () => {
  usePageMeta('Home', 'Your HSK 3.0 progress: words due for review, words mastered per level and recent practice.');
  const session = useSession();
  const stats = useStats();
  const vocabulary = useVocabulary();
  const progress = useProgress();
  const basics = useBasicsPath();

  const totals = useMemo(() => {
    const counts = Object.fromEntries(LEVELS.map((l) => [l, 0])) as Record<HskLevel, number>;
    for (const word of vocabulary.data ?? []) counts[word.level]++;
    return counts;
  }, [vocabulary.data]);

  const nextNewLevel = useMemo((): LevelFilter | null => {
    for (const level of LEVELS) {
      if (vocabulary.data?.some((w) => w.level === level && !progress.byWord.has(w.hanzi))) {
        return String(level) as LevelFilter;
      }
    }
    return null;
  }, [vocabulary.data, progress.byWord]);

  if (stats.isPending || vocabulary.isPending || progress.isPending) return <DashboardSkeleton />;
  if (stats.isError || vocabulary.isError || progress.isError) {
    return (
      <InlineMessage
        tone="error"
        action={
          <Button
            variant="secondary"
            onClick={() => {
              void stats.refetch();
              void vocabulary.refetch();
              void progress.refetch();
            }}
          >
            Try again
          </Button>
        }
      >
        {(stats.error ?? vocabulary.error ?? progress.error)?.message}
      </InlineMessage>
    );
  }

  const data = stats.data;
  const due = data.levels.reduce((sum, l) => sum + l.due, 0);
  const mastered = data.levels.reduce((sum, l) => sum + l.mastered, 0);
  const answered = data.answers.correct + data.answers.wrong;
  const isFirstVisit = progress.byWord.size === 0;

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-xl font-semibold text-ink">Hi {session.data?.name}</h1>
      {isFirstVisit && basics.path?.next ? (
        <StarterHero next={basics.path.next} isFresh={basics.data?.length === 0} />
      ) : (
        <NextStep due={due} nextNewLevel={nextNewLevel} isFirstVisit={isFirstVisit} />
      )}
      {!isFirstVisit && basics.path?.next && basics.data && basics.data.length > 0 && (
        <StarterStrip next={basics.path.next} stagesDone={basics.path.stagesDone} stagesTotal={basics.path.stages.length} />
      )}
      <SummaryStrip
        mastered={mastered}
        totalWords={vocabulary.data.length}
        accuracy={answered === 0 ? null : percent(data.answers.correct, answered)}
        streak={data.streak}
      />
      <LevelProgress totals={totals} stats={data.levels} />
      <div className="grid gap-10 md:grid-cols-2">
        <ActivityChart activity={data.activity} />
        <RecentRounds rounds={data.recent} />
      </div>
    </div>
  );
};

export default DashboardPage;
