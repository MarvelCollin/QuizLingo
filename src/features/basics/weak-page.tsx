import { useMemo, useState } from 'react';
import { Button, ButtonLink } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { useSession } from '../auth/use-session';
import { useAudioIndex } from '../study/use-study-data';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import { buildWeakQuiz } from './build-lesson';
import { QuizView } from './quiz-view';
import type { QuizAnswer } from './types';
import { readWeakSpots, recordAnswers, weakKeys } from './weak-spots';

const ROUND = 10;

const WeakPage = () => {
  usePageMeta('Weak spots', 'Practice the starter path questions you have missed until each one sticks.');
  const userId = useSession().data?.id ?? 'guest';
  const vocabulary = useVocabulary();
  const audio = useAudioIndex();
  const [run, setRun] = useState(0);
  const [done, setDone] = useState<{ answers: QuizAnswer[]; before: number; after: number } | null>(null);

  const questions = useMemo(() => {
    if (!vocabulary.data || !audio.data) return null;
    const keys = weakKeys(readWeakSpots(userId)).slice(0, ROUND);
    return buildWeakQuiz(keys, { vocabulary: vocabulary.data, audioWords: audio.data.words });
    // run starts a fresh round from what is still weak
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vocabulary.data, audio.data, userId, run]);

  if (vocabulary.isError || audio.isError) {
    return <InlineMessage tone="error">{(vocabulary.error ?? audio.error)?.message}</InlineMessage>;
  }
  if (!questions) return <Skeleton className="mx-auto h-72 w-full max-w-2xl" />;

  if (questions.length === 0 && !done) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <h1 className="text-2xl font-bold text-ink">No weak spots</h1>
        <p className="text-base text-muted">Questions you miss in the starter path land here, so you can go back to them later.</p>
        <ButtonLink to="/basics" className="self-start">
          Back to the starter path
        </ButtonLink>
      </div>
    );
  }

  if (done) {
    const right = done.answers.filter((a) => a.question.options[a.chosen].isCorrect).length;
    const cleared = done.before - done.after;
    return (
      <section aria-labelledby="weak-result" className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 id="weak-result" className="text-2xl font-bold text-ink">
          {done.after === 0 ? 'All weak spots cleared' : 'Round complete'}
        </h1>
        <p className="text-3xl font-bold text-strong">
          {right} of {done.answers.length} right
        </p>
        <p className="text-base text-muted">
          {cleared > 0 ? `${cleared} cleared. ` : ''}
          {done.after === 0 ? 'Nothing is left to review.' : `${done.after} still to go.`}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {done.after > 0 && (
            <Button
              size="lg"
              onClick={() => {
                setDone(null);
                setRun((value) => value + 1);
              }}
            >
              Practice the rest
            </Button>
          )}
          <ButtonLink size="lg" variant={done.after > 0 ? 'secondary' : 'primary'} to="/basics">
            Back to the path
          </ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <QuizView
      key={run}
      title="Weak spots"
      label="Weak spots"
      questions={questions}
      onFinish={(answers) => {
        const before = Object.keys(readWeakSpots(userId)).length;
        const after = Object.keys(recordAnswers(userId, answers)).length;
        setDone({ answers, before, after });
      }}
    />
  );
};

export default WeakPage;
