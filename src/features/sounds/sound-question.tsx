import { Check, Volume2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { ChoiceOption } from '../practice/choice-option';
import { KeyHint } from '../practice/key-hint';
import { playSyllable } from '../practice/speech';
import { useKeyboard } from '../practice/use-keyboard';
import type { SoundQuestionProps } from './types';

export const SoundQuestion = ({ item, onAnswer, onNext }: SoundQuestionProps) => {
  const [chosen, setChosen] = useState<number | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const isAnswered = chosen !== null;

  useEffect(() => {
    playSyllable(item.sound);
  }, [item.sound]);

  useEffect(() => {
    if (isAnswered) nextRef.current?.focus();
  }, [isAnswered]);

  const choose = (index: number) => {
    if (isAnswered) return;
    setChosen(index);
    onAnswer(item.options[index].isCorrect);
  };

  useKeyboard((key) => {
    const index = Number(key) - 1;
    if (!isAnswered && index >= 0 && index < item.options.length) {
      choose(index);
      return true;
    }
    if (key === ' ') {
      playSyllable(item.sound);
      return true;
    }
    if (isAnswered && key === 'Enter') {
      onNext();
      return true;
    }
  });

  const isRight = isAnswered && item.options[chosen].isCorrect;

  return (
    <section aria-label="Sound question" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-surface px-6 py-10 text-center">
        <h2 className="text-lg font-semibold text-ink">Which syllable do you hear?</h2>
        <Button variant="secondary" size="lg" onClick={() => playSyllable(item.sound)}>
          <Volume2 aria-hidden="true" className="size-5" strokeWidth={1.75} />
          Play again <KeyHint>Space</KeyHint>
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {item.options.map((option, index) => (
          <ChoiceOption
            key={option.label}
            option={{ label: option.label, isHanzi: false, isCorrect: option.isCorrect }}
            index={index}
            isAnswered={isAnswered}
            isChosen={chosen === index}
            onChoose={() => choose(index)}
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
              {isRight ? 'Correct' : `Not quite, it was ${item.answer}`}
            </p>
            <p className="text-base text-ink">{item.tip}</p>
          </div>
          <Button ref={nextRef} size="lg" onClick={onNext}>
            Next <KeyHint>Enter</KeyHint>
          </Button>
        </div>
      )}
    </section>
  );
};
