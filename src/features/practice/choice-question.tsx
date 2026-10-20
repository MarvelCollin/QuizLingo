import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { KeyHint } from './key-hint';
import { ListenButton } from './listen-button';
import { ChoiceOption } from './choice-option';
import { speak } from './speech';
import { useKeyboard } from './use-keyboard';
import { WordReveal } from './word-reveal';
import type { ChoiceQuestionProps } from './types';

const PROMPTS = {
  meaning: 'What does this word mean?',
  pinyin: 'How is this word read?',
  listening: 'Which word did you hear?',
} as const;

export const ChoiceQuestion = ({ question, mode, onAnswer, onNext }: ChoiceQuestionProps) => {
  const [chosen, setChosen] = useState<number | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const isAnswered = chosen !== null;
  const isListening = mode === 'listening';

  useEffect(() => {
    if (isListening) speak(question.word.hanzi);
  }, [isListening, question.word.hanzi]);

  const handleChoose = (index: number) => {
    if (isAnswered) return;
    setChosen(index);
    onAnswer(question.options[index].isCorrect);
    requestAnimationFrame(() => nextRef.current?.focus());
  };

  useKeyboard((key) => {
    const index = Number(key) - 1;
    if (!isAnswered && index >= 0 && index < question.options.length) {
      handleChoose(index);
      return true;
    }
    if (isAnswered && key === 'Enter') {
      onNext();
      return true;
    }
    if (isListening && key === ' ') {
      speak(question.word.hanzi);
      return true;
    }
  });

  const isCorrect = isAnswered && question.options[chosen].isCorrect;

  return (
    <section aria-label="Question" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 rounded-xl bg-surface px-6 py-10 text-center">
        <h2 className="text-base font-medium text-muted">{PROMPTS[mode]}</h2>
        {isListening && !isAnswered ? (
          <ListenButton text={question.word.hanzi} label="Play again" size="lg" className="mt-4" />
        ) : (
          <p lang="zh-CN" className="font-hanzi text-[clamp(3.5rem,12vw,6rem)] leading-tight text-ink">
            {question.word.hanzi}
          </p>
        )}
        {isAnswered && (
          <div className="mt-4 w-full max-w-md border-t border-hairline pt-5 text-left">
            <WordReveal word={question.word} />
          </div>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((option, index) => (
          <ChoiceOption
            key={option.label}
            option={option}
            index={index}
            isAnswered={isAnswered}
            isChosen={chosen === index}
            onChoose={() => handleChoose(index)}
          />
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {isAnswered && (isCorrect ? 'Correct.' : `Not quite. The answer is ${question.word.meaning}.`)}
      </p>

      {isAnswered && (
        <Button ref={nextRef} size="lg" onClick={onNext}>
          Next <KeyHint>Enter</KeyHint>
        </Button>
      )}
    </section>
  );
};
