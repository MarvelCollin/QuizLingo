import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { percent } from '../../lib/format';
import { shuffle } from '../../lib/random';
import { useSession } from '../auth/use-session';
import { preloadRecording } from '../practice/speech';
import { useKeyboard } from '../practice/use-keyboard';
import type { Answer } from '../progress/types';
import { useSaveAnswers } from '../progress/use-save-answers';
import { useSaveRound } from '../progress/use-save-round';
import { buildLesson } from './build-lesson';
import { CardView } from './card-view';
import { CHECKPOINT_PASS, LESSON_PASS } from './constants';
import { isCheckpoint } from './curriculum';
import { LessonHeader } from './lesson-header';
import { LessonResult } from './lesson-result';
import { QuizView } from './quiz-view';
import type { AttemptInput, LessonPhase, LessonRunProps, QuizAnswer } from './types';
import { useSaveAttempt } from './use-basics';
import { recordAnswers } from './weak-spots';

export const LessonRun = ({ lesson, context, initialPhase, onRestart }: LessonRunProps) => {
  const [content] = useState(() => buildLesson(lesson, context));
  const hasCards = content.cards.length > 0;
  const [phase, setPhase] = useState<LessonPhase>(() => initialPhase ?? (hasCards ? 'cards' : 'quiz'));
  const [cardIndex, setCardIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const lastAttempt = useRef<AttemptInput | null>(null);

  const userId = useSession().data?.id ?? 'guest';
  const saveAttempt = useSaveAttempt();
  const saveRound = useSaveRound();
  const saveWords = useSaveAnswers();
  const passMark = isCheckpoint(lesson) ? CHECKPOINT_PASS : LESSON_PASS;

  useEffect(() => {
    const upcoming = content.cards[cardIndex + 1];
    if (upcoming) preloadRecording(upcoming);
  }, [content, cardIndex]);

  useKeyboard((key) => {
    if (phase !== 'cards') return;
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

  const submit = (finished: QuizAnswer[]) => {
    const right = finished.filter((a) => a.question.options[a.chosen].isCorrect).length;
    const score = percent(right, finished.length);
    const attempt = { lesson: lesson.id, score, passed: score >= passMark };
    const words: Answer[] = finished.flatMap((a) =>
      a.question.srsWord
        ? [{ word: a.question.srsWord, level: 1 as const, correct: a.question.options[a.chosen].isCorrect }]
        : [],
    );
    lastAttempt.current = attempt;
    recordAnswers(userId, finished);
    saveAttempt.mutate(attempt);
    saveRound.mutate({ mode: 'basics', level: 1, total: finished.length, correct: right });
    if (words.length > 0) saveWords.mutate(words);
    setAnswers(finished);
    setPhase('result');
  };

  const retrySave = () => {
    if (lastAttempt.current) saveAttempt.mutate(lastAttempt.current);
  };

  if (phase === 'quiz') {
    return <QuizView title={lesson.title} questions={content.questions} onFinish={submit} />;
  }

  if (phase === 'missed') {
    const again = answers
      .filter((a) => !a.question.options[a.chosen].isCorrect)
      .map(({ question }) => ({ ...question, options: shuffle(question.options) }));
    return (
      <QuizView
        title={lesson.title}
        label="Missed questions"
        questions={again}
        onFinish={(done) => {
          recordAnswers(userId, done);
          setPhase('result');
        }}
      />
    );
  }

  if (phase === 'result') {
    return (
      <LessonResult
        lesson={lesson}
        answers={answers}
        passMark={passMark}
        isSaving={saveAttempt.isPending}
        saveError={saveAttempt.error}
        onRetrySave={retrySave}
        onTryAgain={() => onRestart('quiz')}
        onReview={hasCards ? () => onRestart('cards') : null}
        onPracticeMissed={() => setPhase('missed')}
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
      <CardView key={card.id} card={card} />
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
