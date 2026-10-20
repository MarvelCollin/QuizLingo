import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { cn } from '../../lib/utils';
import { isWordToken } from '../study/api';
import { AnswerFooter } from './answer-footer';
import { KeyHint } from './key-hint';
import { useKeyboard } from './use-keyboard';
import type { WordOrderProps } from './types';

const pieceClasses =
  'min-h-12 cursor-pointer rounded-lg border px-4 font-hanzi text-2xl text-ink transition-colors duration-150';

export const WordOrder = ({ question, onAnswer, onNext }: WordOrderProps) => {
  const [placed, setPlaced] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const [isIncomplete, setIsIncomplete] = useState(false);
  const { pieces, sentence } = question;
  const target = sentence.tokens.filter(isWordToken).join('');
  const isChecked = result !== null;
  const free = pieces.map((piece, i) => ({ piece, i })).filter(({ i }) => !placed.includes(i));

  const place = (index: number) => {
    if (isChecked || placed.includes(index)) return;
    setPlaced([...placed, index]);
    setIsIncomplete(false);
  };
  const remove = (position: number) => {
    if (isChecked) return;
    setPlaced(placed.filter((_, i) => i !== position));
  };
  const check = () => {
    if (placed.length < pieces.length) {
      setIsIncomplete(true);
      return;
    }
    const isCorrect = placed.map((i) => pieces[i]).join('') === target;
    setResult(isCorrect);
    onAnswer(isCorrect);
  };

  useKeyboard((key) => {
    if (isChecked) {
      if (key !== 'Enter') return;
      onNext();
      return true;
    }
    const index = Number(key) - 1;
    if (index >= 0 && index < free.length) {
      place(free[index].i);
      return true;
    }
    if (key === 'Backspace' && placed.length > 0) {
      remove(placed.length - 1);
      return true;
    }
    if (key === 'Enter') {
      check();
      return true;
    }
  });

  return (
    <section aria-label="Question" className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 rounded-xl bg-surface px-6 py-8">
        <h2 className="text-center text-base font-medium text-muted">Put the words in order</h2>
        <p className="text-center text-base text-ink">{sentence.english}</p>
        <div
          aria-label="Your sentence"
          className="flex min-h-16 flex-wrap items-center gap-2 rounded-lg border border-dashed border-line/60 bg-bg p-3"
        >
          {placed.length === 0 && <span className="text-sm text-muted">Tap the words below in order</span>}
          {placed.map((pieceIndex, position) => (
            <button
              key={`${pieceIndex}-${position}`}
              type="button"
              lang="zh-CN"
              onClick={() => remove(position)}
              disabled={isChecked}
              className={cn(pieceClasses, 'border-strong bg-tint', isChecked && 'cursor-default')}
            >
              {pieces[pieceIndex]}
            </button>
          ))}
        </div>
        {!isChecked && (
          <div aria-label="Words to place" className="flex flex-wrap justify-center gap-2">
            {free.map(({ piece, i }, n) => (
              <button
                key={i}
                type="button"
                lang="zh-CN"
                onClick={() => place(i)}
                className={cn(pieceClasses, 'flex items-center gap-2 border-line/50 bg-bg hover:border-strong hover:bg-tint')}
              >
                <span className="font-sans text-xs font-semibold text-muted">{n + 1}</span>
                {piece}
              </button>
            ))}
          </div>
        )}
      </div>

      {isIncomplete && <InlineMessage tone="error">Place every word before you check.</InlineMessage>}

      {isChecked ? (
        <AnswerFooter isCorrect={result} question={question} onNext={onNext} />
      ) : (
        <Button size="lg" onClick={check}>
          Check <KeyHint>Enter</KeyHint>
        </Button>
      )}
    </section>
  );
};
