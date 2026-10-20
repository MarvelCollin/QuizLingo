import { Check, LocateFixed, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { QuestionCardProps } from './types';

const LETTERS = ['A', 'B', 'C', 'D'];

export const QuestionCard = ({ question, number, chosen, isReviewing, onChoose, onLocate }: QuestionCardProps) => {
  const isRight = chosen === question.answer;
  return (
    <fieldset className="flex flex-col gap-3 rounded-xl border border-hairline p-4">
      <legend className="sr-only">Question {number}</legend>
      <div className="flex items-start gap-3">
        <span className="pt-0.5 text-sm font-semibold text-muted">{number}</span>
        <div className="flex flex-col gap-0.5">
          <p lang="zh-CN" className="font-hanzi text-xl text-ink">
            {question.prompt}
          </p>
          <p className="text-sm text-muted">{question.promptEn}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label={`Answers for question ${number}`}>
        {question.options.map((option, i) => {
          const isChosen = chosen === i;
          const isAnswer = i === question.answer;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isChosen}
              disabled={isReviewing}
              onClick={() => onChoose(i)}
              className={cn(
                'flex min-h-12 w-full items-center gap-3 rounded-lg border px-3 text-left transition-colors duration-150',
                !isReviewing && (isChosen ? 'cursor-pointer border-strong bg-tint' : 'cursor-pointer border-line/50 bg-bg hover:border-strong hover:bg-tint'),
                isReviewing && isAnswer && 'border-ok-strong bg-ok-tint',
                isReviewing && isChosen && !isAnswer && 'border-bad-strong bg-bad-tint',
                isReviewing && !isAnswer && !isChosen && 'border-hairline bg-bg opacity-70',
              )}
            >
              <span className="w-5 text-sm font-semibold text-muted">{LETTERS[i]}</span>
              <span lang="zh-CN" className="flex-1 font-hanzi text-lg text-ink">
                {option}
              </span>
              {isReviewing && isAnswer && (
                <span className="flex items-center gap-1 text-sm font-semibold text-ok-strong">
                  <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
                  Answer
                </span>
              )}
              {isReviewing && isChosen && !isAnswer && (
                <span className="flex items-center gap-1 text-sm font-semibold text-bad-strong">
                  <X aria-hidden="true" className="size-4" strokeWidth={2.5} />
                  Your answer
                </span>
              )}
            </button>
          );
        })}
      </div>
      {isReviewing && (
        <div className="flex flex-col gap-2 border-t border-hairline pt-3">
          <p className={cn('text-sm font-semibold', isRight ? 'text-ok-strong' : 'text-bad-strong')}>
            {chosen === null ? 'Not answered' : isRight ? 'Right' : 'Not quite'}
          </p>
          <p className="text-base text-ink">{question.explanation}</p>
          <button
            type="button"
            onClick={onLocate}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-md px-3 text-sm font-semibold text-strong hover:bg-tint"
          >
            <LocateFixed aria-hidden="true" className="size-4" strokeWidth={1.75} />
            Locate in audio, line {question.line + 1}
          </button>
        </div>
      )}
    </fieldset>
  );
};
