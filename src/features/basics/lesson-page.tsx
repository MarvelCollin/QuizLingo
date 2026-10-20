import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { Button, ButtonLink } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { Skeleton } from '../../components/ui/skeleton';
import { percent } from '../../lib/format';
import { usePageMeta } from '../../lib/use-page-meta';
import { useKeyboard } from '../practice/use-keyboard';
import type { Answer } from '../progress/types';
import { useSaveAnswers } from '../progress/use-save-answers';
import { useSaveRound } from '../progress/use-save-round';
import { useAudioIndex } from '../study/use-study-data';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import { buildLesson } from './build-lesson';
import { CardView } from './card-view';
import { CHECKPOINT_PASS, LESSON_PASS } from './constants';
import { isCheckpoint, lessonById } from './curriculum';
import { LessonHeader } from './lesson-header';
import { LessonResult } from './lesson-result';
import { QuizView } from './quiz-view';
import type { AttemptInput, LessonPhase, QuizAnswer } from './types';
import { useBasicsPath, useSaveAttempt } from './use-basics';

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

  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<LessonPhase | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const lastAttempt = useRef<AttemptInput | null>(null);
  const lastWords = useRef<Answer[]>([]);

  const saveAttempt = useSaveAttempt();
  const saveRound = useSaveRound();
  const saveWords = useSaveAnswers();

  const content = useMemo(() => {
    if (!lesson || (needsData && (!vocabulary.data || !audio.data))) return null;
    return buildLesson(lesson, { vocabulary: vocabulary.data ?? [], audioWords: audio.data?.words ?? new Set() });
    // run rebuilds the questions with a fresh shuffle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, needsData, vocabulary.data, audio.data, run]);

  const hasCards = (content?.cards.length ?? 0) > 0;
  const current = phase ?? (hasCards ? 'cards' : 'quiz');

  useKeyboard((key) => {
    if (current !== 'cards' || !content) return;
    const last = content.cards.length - 1;
    if ((key === 'Enter' || key === 'ArrowRight') && cardIndex < last) {
      setCardIndex(cardIndex + 1);
      return true;
    }
    if (key === 'ArrowLeft' && cardIndex > 0) {
      setCardIndex(cardIndex - 1);
      return true;
    }
  });

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
  if (!content) return <LessonSkeleton />;

  const passMark = isCheckpoint(lesson) ? CHECKPOINT_PASS : LESSON_PASS;

  const submit = (finished: QuizAnswer[]) => {
    const right = finished.filter((a) => a.question.options[a.chosen].isCorrect).length;
    const score = percent(right, finished.length);
    lastAttempt.current = { lesson: lesson.id, score, passed: score >= passMark };
    lastWords.current = finished.flatMap((a) =>
      a.question.srsWord
        ? [{ word: a.question.srsWord, level: 1 as const, correct: a.question.options[a.chosen].isCorrect }]
        : [],
    );
    saveAttempt.mutate(lastAttempt.current);
    saveRound.mutate({ mode: 'basics', level: 1, total: finished.length, correct: right });
    if (lastWords.current.length > 0) saveWords.mutate(lastWords.current);
    setAnswers(finished);
    setPhase('result');
  };

  const retrySave = () => {
    if (lastAttempt.current) saveAttempt.mutate(lastAttempt.current);
  };

  const restart = (to: LessonPhase) => {
    setAnswers([]);
    setRun((value) => value + 1);
    setPhase(to);
    setCardIndex(0);
  };

  if (current === 'quiz') {
    return <QuizView key={run} questions={content.questions} onFinish={submit} />;
  }

  if (current === 'result') {
    return (
      <LessonResult
        lesson={lesson}
        answers={answers}
        passMark={passMark}
        isSaving={saveAttempt.isPending}
        saveError={saveAttempt.error}
        onRetrySave={retrySave}
        onTryAgain={() => restart('quiz')}
        onReview={hasCards ? () => restart('cards') : null}
      />
    );
  }

  const card = content.cards[cardIndex];
  const isLastCard = cardIndex === content.cards.length - 1;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="sr-only">{lesson.title}</h1>
      <LessonHeader
        label={lesson.title}
        position={cardIndex + 1}
        total={content.cards.length}
        segments={[{ label: 'seen', value: cardIndex + 1, className: 'bg-strong' }]}
      />
      <CardView key={`${run}-${card.id}`} card={card} />
      <div className="flex gap-3">
        {cardIndex > 0 && (
          <Button size="lg" variant="secondary" onClick={() => setCardIndex(cardIndex - 1)}>
            Back
          </Button>
        )}
        <Button size="lg" className="flex-1" onClick={() => (isLastCard ? setPhase('quiz') : setCardIndex(cardIndex + 1))}>
          {isLastCard ? 'Start the quiz' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default LessonPage;
