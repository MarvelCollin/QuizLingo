import { Check, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { SentenceView, SourceNote } from '../study/sentence-view';
import { KeyHint } from './key-hint';
import type { AnswerFooterProps } from './types';

export const AnswerFooter = ({ isCorrect, question, onNext }: AnswerFooterProps) => {
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => nextRef.current?.focus(), []);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-xl border border-hairline px-5 py-4">
        <p
          role="status"
          className={cn('flex items-center gap-1.5 text-base font-semibold', isCorrect ? 'text-ok-strong' : 'text-bad-strong')}
        >
          {isCorrect ? (
            <Check aria-hidden="true" className="size-5" strokeWidth={2.5} />
          ) : (
            <X aria-hidden="true" className="size-5" strokeWidth={2.5} />
          )}
          {isCorrect ? 'Correct' : 'Not quite'}
        </p>
        <SentenceView sentence={question.sentence} highlight={question.word.hanzi} />
        <p className="text-base text-ink">
          <span lang="zh-CN" className="font-hanzi text-lg">
            {question.word.hanzi}
          </span>{' '}
          <span className="font-semibold text-strong">{question.word.pinyin}</span>{' '}
          <span className="text-muted">{question.word.meaning}</span>
        </p>
        <SourceNote sentence={question.sentence} />
      </div>
      <Button ref={nextRef} size="lg" onClick={onNext}>
        Next <KeyHint>Enter</KeyHint>
      </Button>
    </div>
  );
};
