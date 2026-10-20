import { useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { Skeleton } from '../../components/ui/skeleton';
import { percent } from '../../lib/format';
import { usePageMeta } from '../../lib/use-page-meta';
import { useSession } from '../auth/use-session';
import { useStats } from '../progress/use-stats';
import { useProgress } from '../progress/use-progress';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import type { HskLevel } from '../vocabulary/types';
import type { LevelFilter } from '../practice/types';
import { ActivityChart } from './activity-chart';
import { LevelProgress } from './level-progress';
import { NextStep } from './next-step';
import { RecentRounds } from './recent-rounds';
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

  const totals = useMemo(() => {
    const counts: Record<HskLevel, number> = { 1: 0, 2: 0, 3: 0 };
    for (const word of vocabulary.data ?? []) counts[word.level]++;
    return counts;
  }, [vocabulary.data]);

  // The first level that still has words the user has never seen
  const nextNewLevel = useMemo((): LevelFilter | null => {
    for (const level of [1, 2, 3] as HskLevel[]) {
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
      <NextStep due={due} nextNewLevel={nextNewLevel} isFirstVisit={isFirstVisit} />
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
