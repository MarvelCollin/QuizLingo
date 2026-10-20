import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ChoiceOptionProps } from './types';

// After answering, the right option and a wrong pick are marked with an icon and a word, not color alone
export const ChoiceOption = ({ option, index, isAnswered, isChosen, onChoose }: ChoiceOptionProps) => {
  const showCorrect = isAnswered && option.isCorrect;
  const showWrong = isAnswered && isChosen && !option.isCorrect;

  return (
    <button
      type="button"
      onClick={onChoose}
      disabled={isAnswered}
      aria-describedby={undefined}
      className={cn(
        'flex min-h-14 w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-150',
        !isAnswered && 'cursor-pointer border-line/50 bg-bg hover:border-strong hover:bg-tint',
        showCorrect && 'border-ok-strong bg-ok-tint',
        showWrong && 'border-bad-strong bg-bad-tint',
        isAnswered && !showCorrect && !showWrong && 'border-hairline bg-bg opacity-70',
      )}
    >
      <span className="w-5 shrink-0 text-sm font-semibold text-muted">{index + 1}</span>
      <span
        lang={option.isHanzi ? 'zh-CN' : undefined}
        className={cn('flex-1 text-ink', option.isHanzi ? 'font-hanzi text-2xl' : 'text-base font-medium')}
      >
        {option.label}
      </span>
      {showCorrect && (
        <span className="flex items-center gap-1 text-sm font-semibold text-ok-strong">
          <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
          Correct
        </span>
      )}
      {showWrong && (
        <span className="flex items-center gap-1 text-sm font-semibold text-bad-strong">
          <X aria-hidden="true" className="size-4" strokeWidth={2.5} />
          Your answer
        </span>
      )}
    </button>
  );
};
