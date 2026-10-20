import { Check, Volume2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { ChoiceOption } from '../practice/choice-option';
import { KeyHint } from '../practice/key-hint';
import { playSyllable, preloadRecording, speak } from '../practice/speech';
import { useKeyboard } from '../practice/use-keyboard';
import { cn } from '../../lib/utils';
import { LessonHeader } from './lesson-header';
import { ToneContour } from './tone-contour';
import type { QuizAnswer, QuizQuestion, QuizViewProps } from './types';

const playQuestion = (question: QuizQuestion) => {
  if (question.sound) playSyllable(question.sound);
  else if (question.word) speak(question.word);
};

export const QuizView = ({ questions, onFinish }: QuizViewProps) => {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [playKey, setPlayKey] = useState(0);

  const question = questions[index];
  const isAnswered = chosen !== null;
  const isLast = index === questions.length - 1;
  const hasSound = Boolean(question.sound || question.word);
  const correct = answers.filter((a) => a.question.options[a.chosen].isCorrect).length;

  useEffect(() => {
    playQuestion(question);
  }, [question]);

  useEffect(() => {
    const upcoming = questions[index + 1];
    if (upcoming) preloadRecording(upcoming);
  }, [questions, index]);

  useEffect(() => {
    if (isAnswered) nextRef.current?.focus();
  }, [isAnswered]);

  const choose = (option: number) => {
    if (isAnswered) return;
    setChosen(option);
    setAnswers((current) => [...current, { question, chosen: option }]);
  };

  const next = () => {
    if (!isAnswered) return;
    if (isLast) {
      onFinish(answers);
      return;
    }
    setIndex(index + 1);
    setChosen(null);
  };

  const replay = () => {
    setPlayKey((key) => key + 1);
    playQuestion(question);
  };

  useKeyboard((key) => {
    const option = Number(key) - 1;
    if (!isAnswered && option >= 0 && option < question.options.length) {
      choose(option);
      return true;
    }
    if (key === ' ' && (hasSound || question.tones)) {
      replay();
      return true;
    }
    if (isAnswered && key === 'Enter') {
      next();
      return true;
    }
  });

  const isRight = isAnswered && question.options[chosen].isCorrect;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <LessonHeader
        label="Quiz"
        position={index + 1}
        total={questions.length}
        segments={[
          { label: 'right', value: correct, className: 'bg-strong' },
          { label: 'missed', value: answers.length - correct, className: 'bg-accent-strong' },
        ]}
      />
      <section aria-label="Question" className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 rounded-xl bg-surface px-6 py-8 text-center">
          <h2 className="text-lg font-semibold text-ink">{question.prompt}</h2>
          {question.hanzi && (
            <p lang="zh-CN" className="font-hanzi text-6xl text-ink">
              {question.hanzi}
            </p>
          )}
          {question.tones && <ToneContour tones={question.tones} playKey={playKey} />}
          {hasSound && (
            <Button variant="secondary" size="lg" onClick={replay}>
              <Volume2 aria-hidden="true" className="size-5" strokeWidth={1.75} />
              Play again <KeyHint>Space</KeyHint>
            </Button>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {question.options.map((option, position) => (
            <ChoiceOption
              key={option.label}
              option={{ label: option.label, isHanzi: Boolean(question.isHanzi), isCorrect: option.isCorrect }}
              index={position}
              isAnswered={isAnswered}
              isChosen={chosen === position}
              onChoose={() => choose(position)}
            />
          ))}
        </div>
        {isAnswered && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 rounded-xl border border-hairline px-5 py-4">
              <p role="status" className={cn('flex items-center gap-1.5 text-base font-semibold', isRight ? 'text-ok-strong' : 'text-bad-strong')}>
                {isRight ? (
                  <Check aria-hidden="true" className="size-5" strokeWidth={2.5} />
                ) : (
                  <X aria-hidden="true" className="size-5" strokeWidth={2.5} />
                )}
                {isRight ? 'Correct' : 'Not quite'}
              </p>
              {question.explain && <p className="text-base text-ink">{question.explain}</p>}
            </div>
            <Button ref={nextRef} size="lg" onClick={next}>
              {isLast ? 'See my result' : 'Next'} <KeyHint>Enter</KeyHint>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
