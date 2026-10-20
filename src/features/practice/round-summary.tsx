import { Button, ButtonLink } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { plural } from '../../lib/format';
import type { RoundSummaryProps } from './types';

export const RoundSummary = ({
  records,
  unsavedCount,
  isSaving,
  saveError,
  onRetrySave,
  onPracticeWords,
  onNewRound,
}: RoundSummaryProps) => {
  const correct = records.filter((r) => r.isCorrect).length;
  const missed = records.filter((r) => !r.isCorrect).map((r) => r.word);

  return (
    <section aria-labelledby="summary-title" className="flex flex-col gap-8">
      <div>
        <h1 id="summary-title" className="text-2xl font-bold text-ink">
          Round complete
        </h1>
        <p className="mt-3 text-3xl font-bold text-strong">
          {correct} of {records.length} right
        </p>
        <p className="mt-1 text-base text-muted" role="status">
          {isSaving ? 'Saving your round' : 'Saved. Words you missed come back sooner, words you knew come back later.'}
        </p>
      </div>

      {unsavedCount > 0 && (
        <InlineMessage
          tone="error"
          action={
            <Button variant="secondary" onClick={onRetrySave}>
              Try saving again
            </Button>
          }
        >
          {plural(unsavedCount, 'answer')} could not be saved.
        </InlineMessage>
      )}
      {saveError && <InlineMessage tone="error">The round summary could not be saved. {saveError.message}</InlineMessage>}

      <div className="flex flex-col gap-3 sm:flex-row">
        {missed.length > 0 && (
          <Button size="lg" onClick={() => onPracticeWords(missed)}>
            Practice the {plural(missed.length, 'word')} you missed
          </Button>
        )}
        <Button size="lg" variant={missed.length > 0 ? 'secondary' : 'primary'} onClick={onNewRound}>
          Start a new round
        </Button>
        <ButtonLink to="/" size="lg" variant="quiet">
          Back to home
        </ButtonLink>
      </div>

      {missed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-ink">Words to look at again</h2>
          <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
            {missed.map((word) => (
              <li key={word.hanzi} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
                <span lang="zh-CN" className="font-hanzi text-2xl text-ink">
                  {word.hanzi}
                </span>
                <span className="font-semibold text-strong">{word.pinyin}</span>
                <span className="text-muted">{word.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
