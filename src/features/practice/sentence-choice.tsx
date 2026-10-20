import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { isWordToken } from '../study/api';
import { SentenceView } from '../study/sentence-view';
import { AnswerFooter } from './answer-footer';
import { ChoiceOption } from './choice-option';
import { ListenButton } from './listen-button';
import { speak } from './speech';
import { useKeyboard } from './use-keyboard';
import type { SentenceChoiceProps } from './types';

const PROMPTS = {
  reading: 'What does this sentence mean?',
  'sentence-listening': 'What did you hear?',
  gap: 'Which word fills the gap?',
} as const;

export const SentenceChoice = ({ question, mode, onAnswer, onNext }: SentenceChoiceProps) => {
  const [chosen, setChosen] = useState<number | null>(null);
  const [isPinyinShown, setIsPinyinShown] = useState(false);
  const isAnswered = chosen !== null;
  const isListening = mode === 'sentence-listening';
  const { sentence } = question;

  useEffect(() => {
    if (isListening) speak(sentence.text);
  }, [isListening, sentence.text]);

  const handleChoose = (index: number) => {
    if (isAnswered) return;
    setChosen(index);
    onAnswer(question.options[index].isCorrect);
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
    if (isListening && !isAnswered && key === ' ') {
      speak(sentence.text);
      return true;
    }
  });

  return (
    <section aria-label="Question" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-surface px-6 py-10 text-center">
        <h2 className="text-base font-medium text-muted">{PROMPTS[mode]}</h2>
        {isListening && !isAnswered && <ListenButton text={sentence.text} label="Play again" size="lg" />}
        {mode === 'gap' && (
          <p lang="zh-CN" className="font-hanzi text-3xl leading-relaxed text-ink">
            {sentence.tokens.map((token, i) =>
              token === question.word.hanzi && isWordToken(token) ? (
                <span key={i} className="mx-1 inline-block w-16 border-b-2 border-strong align-baseline">
                  <span className="sr-only">gap</span>
                </span>
              ) : (
                <span key={i}>{token}</span>
              ),
            )}
          </p>
        )}
        {mode === 'gap' && !isAnswered && <p className="text-base text-muted">{sentence.english}</p>}
        {mode === 'reading' && !isAnswered && (
          <>
            <SentenceView sentence={sentence} isPinyinShown={isPinyinShown} isEnglishShown={false} size="lg" />
            <Button variant="quiet" onClick={() => setIsPinyinShown(!isPinyinShown)}>
              {isPinyinShown ? 'Hide pinyin' : 'Show pinyin'}
            </Button>
          </>
        )}
      </div>

      <div className={mode === 'gap' ? 'grid gap-2 sm:grid-cols-2' : 'grid gap-2'}>
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

      {isAnswered && (
        <AnswerFooter isCorrect={question.options[chosen].isCorrect} question={question} onNext={onNext} />
      )}
    </section>
  );
};
