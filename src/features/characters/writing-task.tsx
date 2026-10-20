import { Check, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { KeyHint } from '../practice/key-hint';
import { ListenButton } from '../practice/listen-button';
import { useKeyboard } from '../practice/use-keyboard';
import { createWriter } from './writer';
import type { WritingTaskProps } from './types';

const PAD = 260;
const PASS_MISTAKES = 3;

export const WritingTask = ({ hanzi, onAnswer, onNext }: WritingTaskProps) => {
  const target = useRef<HTMLDivElement>(null);
  const writer = useRef<ReturnType<typeof createWriter> | null>(null);
  const [mistakes, setMistakes] = useState<number | null>(null);
  const [isOutlineShown, setIsOutlineShown] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const isDone = mistakes !== null;
  const isCorrect = isDone && mistakes <= PASS_MISTAKES;
  const answerRef = useRef(onAnswer);
  useEffect(() => {
    answerRef.current = onAnswer;
  });

  useEffect(() => {
    if (!target.current) return;
    target.current.innerHTML = '';
    const created = createWriter(target.current, hanzi.char, PAD, {
      showCharacter: false,
      showOutline: false,
      showHintAfterMisses: 2,
    });
    writer.current = created;
    void created.quiz({
      onComplete: ({ totalMistakes }) => {
        setMistakes(totalMistakes);
        if (attempt === 0) answerRef.current(totalMistakes <= PASS_MISTAKES);
      },
    });
    return () => {
      created.cancelQuiz();
      writer.current = null;
    };
  }, [hanzi.char, attempt]);

  const toggleOutline = () => {
    if (isOutlineShown) void writer.current?.hideOutline();
    else void writer.current?.showOutline();
    setIsOutlineShown(!isOutlineShown);
  };

  useKeyboard((key) => {
    if (isDone && key === 'Enter') {
      onNext();
      return true;
    }
  });

  return (
    <section aria-label="Writing task" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-surface px-6 py-8 text-center">
        <h2 className="text-base font-medium text-muted">Write the character, stroke by stroke</h2>
        <p className="text-2xl font-semibold text-strong">{hanzi.pinyin}</p>
        <p className="text-base text-ink">{hanzi.meanings.slice(0, 3).join(', ')}</p>
        {hanzi.words.some((w) => w !== hanzi.char) && (
          <p lang="zh-CN" className="font-hanzi text-lg text-muted">
            {hanzi.words.filter((w) => w !== hanzi.char).slice(0, 3).map((w) => w.replaceAll(hanzi.char, '＿')).join('  ')}
          </p>
        )}
        <div
          ref={target}
          aria-label="Drawing area"
          className="touch-none rounded-xl border border-line/60 bg-bg"
          style={{ width: PAD, height: PAD }}
        />
        <div className="flex flex-wrap justify-center gap-2">
          <ListenButton text={hanzi.char} />
          {!isDone && (
            <Button variant="quiet" onClick={toggleOutline}>
              {isOutlineShown ? 'Hide outline' : 'Show outline'}
            </Button>
          )}
          <Button
            variant="quiet"
            onClick={() => {
              setMistakes(null);
              setIsOutlineShown(false);
              setAttempt(attempt + 1);
            }}
          >
            <RotateCcw aria-hidden="true" className="size-4" strokeWidth={1.75} />
            Start over
          </Button>
        </div>
      </div>

      {isDone && (
        <div className="flex flex-col gap-5">
          <p
            role="status"
            className={cn('flex items-center gap-1.5 text-base font-semibold', isCorrect ? 'text-ok-strong' : 'text-bad-strong')}
          >
            {isCorrect ? (
              <Check aria-hidden="true" className="size-5" strokeWidth={2.5} />
            ) : (
              <X aria-hidden="true" className="size-5" strokeWidth={2.5} />
            )}
            {mistakes === 0 ? 'Every stroke right' : `${mistakes} ${mistakes === 1 ? 'mistake' : 'mistakes'}`}
            {attempt > 0 && ', practice try'}
          </p>
          <Button size="lg" onClick={onNext}>
            Next <KeyHint>Enter</KeyHint>
          </Button>
        </div>
      )}
    </section>
  );
};
