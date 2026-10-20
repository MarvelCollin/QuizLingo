import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { ChoiceOption } from '../practice/choice-option';
import { KeyHint } from '../practice/key-hint';
import { ListenButton } from '../practice/listen-button';
import { useKeyboard } from '../practice/use-keyboard';
import type { CharacterQuizProps } from './types';

export const CharacterQuiz = ({ question, onAnswer, onNext }: CharacterQuizProps) => {
  const [chosen, setChosen] = useState<number | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const isAnswered = chosen !== null;
  const { hanzi } = question;

  useEffect(() => {
    if (isAnswered) nextRef.current?.focus();
  }, [isAnswered]);

  const choose = (index: number) => {
    if (isAnswered) return;
    setChosen(index);
    onAnswer(question.options[index].isCorrect);
  };

  useKeyboard((key) => {
    const index = Number(key) - 1;
    if (!isAnswered && index >= 0 && index < question.options.length) {
      choose(index);
      return true;
    }
    if (isAnswered && key === 'Enter') {
      onNext();
      return true;
    }
  });

  return (
    <section aria-label="Question" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 rounded-xl bg-surface px-6 py-10 text-center">
        <h2 className="text-base font-medium text-muted">What is this character?</h2>
        <p lang="zh-CN" className="font-hanzi text-[clamp(4rem,14vw,7rem)] leading-tight text-ink">
          {hanzi.char}
        </p>
        {isAnswered && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-lg font-semibold text-strong">{hanzi.pinyin}</p>
            <p className="text-base text-ink">{hanzi.meanings.slice(0, 3).join(', ')}</p>
            {hanzi.words.length > 0 && (
              <p lang="zh-CN" className="font-hanzi text-lg text-muted">
                {hanzi.words.join('  ')}
              </p>
            )}
            <ListenButton text={hanzi.char} />
          </div>
        )}
      </div>
      <div className="grid gap-2">
        {question.options.map((option, index) => (
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
