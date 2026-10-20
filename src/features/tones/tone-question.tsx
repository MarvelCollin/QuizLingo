import { Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { ChoiceOption } from '../practice/choice-option';
import { KeyHint } from '../practice/key-hint';
import { playSyllable, speak } from '../practice/speech';
import { useKeyboard } from '../practice/use-keyboard';
import type { ToneQuestionProps } from './types';

export const ToneQuestion = ({ item, onAnswer, onNext }: ToneQuestionProps) => {
  const [chosen, setChosen] = useState<number | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const isAnswered = chosen !== null;
  const play = () => (item.kind === 'syllable' ? playSyllable(item.sound) : speak(item.sound));

  useEffect(() => {
    if (item.kind === 'syllable') playSyllable(item.sound);
    else speak(item.sound);
  }, [item.kind, item.sound]);

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
      play();
      return true;
    }
    if (isAnswered && key === 'Enter') {
      onNext();
      return true;
    }
  });

  return (
    <section aria-label="Tone question" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-surface px-6 py-10 text-center">
        <h2 className="text-base font-medium text-muted">
          {item.kind === 'syllable' ? 'Which tone did you hear?' : 'Which tones did you hear?'}
        </h2>
        <Button variant="secondary" size="lg" onClick={play}>
          <Volume2 aria-hidden="true" className="size-5" strokeWidth={1.75} />
          Play again <KeyHint>Space</KeyHint>
        </Button>
        {isAnswered && (
          <div className="flex flex-col items-center gap-1">
            <p lang="zh-CN" className="font-hanzi text-5xl text-ink">
              {item.hanzi}
            </p>
            <p className="text-lg font-semibold text-strong">{item.answer}</p>
            <p className="text-base text-muted">{item.meaning}</p>
          </div>
        )}
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
        <Button ref={nextRef} size="lg" onClick={onNext}>
          Next <KeyHint>Enter</KeyHint>
        </Button>
      )}
    </section>
  );
};
