import { X } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { StackedBar } from '../../components/ui/stacked-bar';
import { buildQuestion } from './build-question';
import { buildSentenceQuestion } from './build-sentence-question';
import { ChoiceQuestion } from './choice-question';
import { LEVEL_LABELS, PRACTICE_MODES } from './constants';
import { Flashcard } from './flashcard';
import { RoundSummary } from './round-summary';
import { SentenceChoice } from './sentence-choice';
import { useRound } from './use-round';
import { WordOrder } from './word-order';
import type { RoundProps, SentenceModeId, WordModeId } from './types';

export const Round = ({ words, pool, sentences, config, onPracticeWords, onNewRound }: RoundProps) => {
  const round = useRound(words, config.mode, config.level);
  const mode = PRACTICE_MODES.find((m) => m.id === config.mode)!;
  const modeLabel = mode.label;
  const current = round.current;
  const question = useMemo(
    () => (current && !mode.usesSentences ? buildQuestion(current, config.mode as WordModeId, pool) : null),
    [current, config.mode, mode.usesSentences, pool],
  );
  const sentenceQuestion = useMemo(
    () =>
      current && mode.usesSentences
        ? buildSentenceQuestion(current, config.mode as SentenceModeId, pool, sentences)
        : null,
    [current, config.mode, mode.usesSentences, pool, sentences],
  );

  if (round.isDone || (!question && !sentenceQuestion)) {
    return (
      <RoundSummary
        records={round.records}
        unsavedCount={round.unsavedCount}
        isSaving={round.isSavingRound}
        saveError={round.roundSaveError}
        onRetrySave={round.retryUnsaved}
        onPracticeWords={onPracticeWords}
        onNewRound={onNewRound}
      />
    );
  }

  const correctSoFar = round.records.filter((r) => r.isCorrect).length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="sr-only">
        {modeLabel} round, {LEVEL_LABELS[config.level]}
      </h1>
      <div className="flex items-center gap-4">
        <Link
          to="/practice"
          className="-ml-3 inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-strong hover:bg-tint"
        >
          <X aria-hidden="true" className="size-4" strokeWidth={2} />
          End round
        </Link>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-muted">
            <span>
              {modeLabel}, {LEVEL_LABELS[config.level]}
            </span>
            <span aria-live="polite">
              Word {round.index + 1} of {round.total}
            </span>
          </div>
          <StackedBar
            label="Round progress"
            total={round.total}
            className="mt-1.5 h-1.5"
            segments={[
              { label: 'right', value: correctSoFar, className: 'bg-strong' },
              { label: 'missed', value: round.records.length - correctSoFar, className: 'bg-accent-strong' },
            ]}
          />
        </div>
      </div>

      {sentenceQuestion ? (
        config.mode === 'order' ? (
          <WordOrder key={round.index} question={sentenceQuestion} onAnswer={round.answer} onNext={round.next} />
        ) : (
          <SentenceChoice
            key={round.index}
            question={sentenceQuestion}
            mode={config.mode as Exclude<SentenceModeId, 'order'>}
            onAnswer={round.answer}
            onNext={round.next}
          />
        )
      ) : question && config.mode === 'flashcard' ? (
        <Flashcard
          key={round.index}
          word={question.word}
          onGrade={(isCorrect) => {
            round.answer(isCorrect);
            round.next();
          }}
        />
      ) : (
        question && (
          <ChoiceQuestion
            key={round.index}
            question={question}
            mode={config.mode as Exclude<WordModeId, 'flashcard'>}
            onAnswer={round.answer}
            onNext={round.next}
          />
        )
      )}
    </div>
  );
};
