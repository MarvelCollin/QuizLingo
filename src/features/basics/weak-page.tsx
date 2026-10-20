import { useState } from 'react';
import { Button, ButtonLink } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { useSession } from '../auth/use-session';
import { useAudioIndex } from '../study/use-study-data';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import { buildWeakQuiz } from './build-lesson';
import { QuizView } from './quiz-view';
import type { QuizAnswer, WeakRunProps } from './types';
import { readWeakSpots, recordAnswers, weakKeys } from './weak-spots';

const ROUND = 10;

const WeakRun = ({ userId, context, onAgain }: WeakRunProps) => {
  const [questions] = useState(() => buildWeakQuiz(weakKeys(readWeakSpots(userId)).slice(0, ROUND), context));
  const [done, setDone] = useState<{ answers: QuizAnswer[]; before: number; after: number } | null>(null);

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
            <Button size="lg" onClick={onAgain}>
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

const WeakPage = () => {
  usePageMeta('Weak spots', 'Practice the starter path questions you have missed until each one sticks.');
  const userId = useSession().data?.id ?? 'guest';
  const vocabulary = useVocabulary();
  const audio = useAudioIndex();
  const [run, setRun] = useState(0);

  if (vocabulary.isError || audio.isError) {
    return <InlineMessage tone="error">{(vocabulary.error ?? audio.error)?.message}</InlineMessage>;
  }
  if (!vocabulary.data || !audio.data) return <Skeleton className="mx-auto h-72 w-full max-w-2xl" />;

  return (
    <WeakRun
      key={run}
      userId={userId}
      context={{ vocabulary: vocabulary.data, audioWords: audio.data.words }}
      onAgain={() => setRun(run + 1)}
    />
  );
};

export default WeakPage;
