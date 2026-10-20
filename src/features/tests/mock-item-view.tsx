import { Check, Volume2, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import type { MockItemViewProps } from './mock-types';
import { isRight } from './mock-score';

const LETTERS = ['A', 'B', 'C', 'D'];

export const MockItemView = ({ item, number, answer, playsLeft, isReviewing, onAnswer, onPlay }: MockItemViewProps) => {
  const right = isReviewing && isRight(item, answer);

  return (
    <article aria-label={`Question ${number}`} className="flex flex-col gap-4 rounded-xl border border-hairline p-5">
      <p className="text-sm text-muted">
        <span className="font-semibold text-ink">Question {number}.</span> {item.instruction}
      </p>

      {item.kind === 'choice' ? (
        <>
          {item.audio.length > 0 && (
            <Button variant="secondary" disabled={playsLeft === 0 && !isReviewing} onClick={() => onPlay(item)} className="self-start">
              <Volume2 aria-hidden="true" className="size-4" strokeWidth={1.75} />
              {isReviewing ? 'Play again' : playsLeft === 0 ? 'No plays left' : `Play (${playsLeft} left)`}
            </Button>
          )}
          {item.passage.length > 0 && (
            <div lang="zh-CN" className="flex flex-col gap-1 rounded-lg bg-surface p-4 font-hanzi text-lg leading-relaxed text-ink">
              {item.passage.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}
          {item.prompt && (
            <div>
              <p lang="zh-CN" className="font-hanzi text-xl text-ink">
                {item.prompt}
              </p>
              {(isReviewing || item.passage.length === 0) && item.promptEn && (
                <p className="text-sm text-muted">{item.promptEn}</p>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2" role="radiogroup" aria-label={`Answers for question ${number}`}>
            {item.options.map((option, i) => {
              const isChosen = answer === i;
              const isAnswer = i === item.answer;
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isChosen}
                  disabled={isReviewing}
                  onClick={() => onAnswer(i)}
                  className={cn(
                    'flex min-h-12 w-full items-center gap-3 rounded-lg border px-3 text-left transition-colors duration-150',
                    !isReviewing && (isChosen ? 'cursor-pointer border-strong bg-tint' : 'cursor-pointer border-line/50 bg-bg hover:border-strong hover:bg-tint'),
                    isReviewing && isAnswer && 'border-ok-strong bg-ok-tint',
                    isReviewing && isChosen && !isAnswer && 'border-bad-strong bg-bad-tint',
                    isReviewing && !isAnswer && !isChosen && 'border-hairline opacity-70',
                  )}
                >
                  <span className="w-5 text-sm font-semibold text-muted">{LETTERS[i]}</span>
                  <span lang="zh-CN" className="flex-1 font-hanzi text-lg text-ink">
                    {option}
                  </span>
                  {isReviewing && isAnswer && <Check aria-label="Answer" className="size-4 text-ok-strong" strokeWidth={2.5} />}
                  {isReviewing && isChosen && !isAnswer && <X aria-label="Your answer" className="size-4 text-bad-strong" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="text-base text-ink">{item.english}</p>
          <div
            aria-label="Your sentence"
            className="flex min-h-14 flex-wrap items-center gap-2 rounded-lg border border-dashed border-line/60 bg-bg p-3"
          >
            {(Array.isArray(answer) ? answer : []).map((pieceIndex, position) => (
              <button
                key={`${pieceIndex}-${position}`}
                type="button"
                lang="zh-CN"
                disabled={isReviewing}
                onClick={() => onAnswer((answer as number[]).filter((_, p) => p !== position))}
                className="min-h-11 cursor-pointer rounded-lg border border-strong bg-tint px-3 font-hanzi text-xl text-ink disabled:cursor-default"
              >
                {item.pieces[pieceIndex]}
              </button>
            ))}
            {!Array.isArray(answer) || answer.length === 0 ? <span className="text-sm text-muted">Tap the words in order</span> : null}
          </div>
          {!isReviewing && (
            <div className="flex flex-wrap gap-2">
              {item.pieces.map((piece, i) =>
                Array.isArray(answer) && answer.includes(i) ? null : (
                  <button
                    key={i}
                    type="button"
                    lang="zh-CN"
                    onClick={() => onAnswer([...(Array.isArray(answer) ? answer : []), i])}
                    className="min-h-11 cursor-pointer rounded-lg border border-line/50 bg-bg px-3 font-hanzi text-xl text-ink hover:border-strong hover:bg-tint"
                  >
                    {piece}
                  </button>
                ),
              )}
            </div>
          )}
        </>
      )}

      {isReviewing && (
        <div className="flex flex-col gap-1 border-t border-hairline pt-3">
          <p className={cn('text-sm font-semibold', right ? 'text-ok-strong' : 'text-bad-strong')}>{right ? 'Right' : 'Not quite'}</p>
          <p lang="zh-CN" className="text-base text-ink">
            {item.explanation}
          </p>
          {item.transcript && item.transcript !== item.explanation && (
            <details className="text-sm text-muted">
              <summary className="cursor-pointer font-semibold text-strong">Transcript</summary>
              <p lang="zh-CN" className="mt-2 font-hanzi text-base whitespace-pre-line text-ink">
                {item.transcript}
              </p>
            </details>
          )}
        </div>
      )}
    </article>
  );
};
