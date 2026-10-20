import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button, ButtonLink } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { useProgress } from '../progress/use-progress';
import { useSentences } from '../study/use-study-data';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import { pickRoundWords, wordsForMode, wordsInLevel } from './pick-words';
import { Round } from './round';
import { configFromParams, highestLevel } from './round-config';
import type { RoundRunnerProps } from './types';

const RoundSkeleton = () => (
  <div className="mx-auto flex max-w-2xl flex-col gap-6" aria-busy="true" aria-label="Preparing your round">
    <Skeleton className="h-11 w-full" />
    <Skeleton className="h-72 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
);

const RoundRunner = ({ vocabulary, progress, sentences, config }: RoundRunnerProps) => {
  const pool = useMemo(() => {
    const inLevel = wordsInLevel(vocabulary, config.level);
    return inLevel.length >= 8 ? inLevel : vocabulary;
  }, [vocabulary, config.level]);
  const usable = useMemo(() => wordsForMode(vocabulary, config.mode, sentences), [vocabulary, config.mode, sentences]);
  const [round, setRound] = useState(() => ({ id: 0, words: pickRoundWords(usable, config, progress, Date.now()) }));

  if (round.words.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-start gap-4">
        <h1 className="text-2xl font-bold text-ink">No words in this round</h1>
        <p className="text-base text-muted">
          {config.set === 'due'
            ? 'Nothing is due for review right now. Learn some new words, and they will come back here when it is time.'
            : 'You have already started every word in this level. Try the words due for review or a mixed round.'}
        </p>
        <ButtonLink to="/practice">Choose another round</ButtonLink>
      </div>
    );
  }

  return (
    <Round
      key={round.id}
      words={round.words}
      pool={pool}
      sentences={sentences}
      config={config}
      onPracticeWords={(words) => setRound({ id: round.id + 1, words })}
      onNewRound={() =>
        setRound({ id: round.id + 1, words: pickRoundWords(usable, config, progress, Date.now()) })
      }
    />
  );
};

const RoundPage = () => {
  usePageMeta('Practice round', 'Answer one word at a time. Every answer is saved to your progress.');
  const [params] = useSearchParams();
  const config = configFromParams(params);
  const vocabulary = useVocabulary();
  const progress = useProgress();
  const sentences = useSentences(highestLevel(config.level));

  if (vocabulary.isPending || progress.isPending || sentences.isPending) return <RoundSkeleton />;
  if (vocabulary.isError || progress.isError || sentences.isError) {
    return (
      <InlineMessage
        tone="error"
        action={
          <Button
            variant="secondary"
            onClick={() => {
              void vocabulary.refetch();
              void progress.refetch();
              void sentences.refetch();
            }}
          >
            Try again
          </Button>
        }
      >
        {(vocabulary.error ?? progress.error ?? sentences.error)?.message}
      </InlineMessage>
    );
  }
  if (!sentences.data) return <RoundSkeleton />;
  return (
    <RoundRunner
      key={params.toString()}
      vocabulary={vocabulary.data}
      progress={progress.byWord}
      sentences={sentences.data}
      config={config}
    />
  );
};

export default RoundPage;
