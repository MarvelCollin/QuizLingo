import { useEffect, useRef } from 'react';
import { Button, ButtonLink } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { percent } from '../../lib/format';
import { isCheckpoint, STAGES, stageOfLesson } from './curriculum';
import { Stamp } from './stamp';
import type { LessonResultProps } from './types';
import { useBasicsPath } from './use-basics';

export const LessonResult = ({
  lesson,
  answers,
  passMark,
  isSaving,
  saveError,
  onRetrySave,
  onTryAgain,
  onReview,
  onPracticeMissed,
}: LessonResultProps) => {
  const { path } = useBasicsPath();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const total = answers.length;
  const right = answers.filter((a) => a.question.options[a.chosen].isCorrect).length;
  const score = percent(right, total);
  const isPassed = score >= passMark;
  const isMilestone = isCheckpoint(lesson);
  const missed = answers.filter((a) => !a.question.options[a.chosen].isCorrect);

  const stage = stageOfLesson(lesson.id);
  const nextStage = stage ? STAGES[STAGES.indexOf(stage) + 1] : undefined;
  const next = isPassed && !isSaving && !saveError ? path?.next : null;
  const hasNext = next && next.lesson.id !== lesson.id;

  return (
    <section aria-labelledby="result-title" className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex flex-wrap items-center gap-6">
        {isPassed && <Stamp kind={isMilestone ? 'milestone' : 'lesson'} />}
        <div className="min-w-0 flex-1">
          <h1 id="result-title" ref={heading} tabIndex={-1} className="text-2xl font-bold text-ink outline-none">
            {isPassed ? (isMilestone ? 'Milestone reached' : 'Lesson complete') : 'Not yet'}
          </h1>
          <p className="mt-2 text-3xl font-bold text-strong">
            {right} of {total} right
          </p>
          <p className="mt-1 text-base text-muted">
            {score}%. The pass mark is {passMark}%.
          </p>
          <p className="mt-1 text-base text-muted" role="status">
            {isSaving ? 'Saving your result' : saveError ? '' : 'Saved to your progress.'}
          </p>
        </div>
      </div>

      {isPassed && isMilestone && (
        <p className="max-w-prose text-base text-ink">
          {nextStage
            ? `${stage?.title} is passed. The next stage, ${nextStage.title.toLowerCase()}, is open.`
            : 'You have passed every milestone. The starter path is complete.'}
        </p>
      )}
      {!isPassed && (
        <p className="max-w-prose text-base text-ink">
          {onReview
            ? 'Look through the cards once more, then try again. The questions change each time.'
            : 'Go back through the lessons of this stage, then try the milestone again.'}
        </p>
      )}

      {saveError && (
        <InlineMessage
          tone="error"
          action={
            <Button variant="secondary" onClick={onRetrySave}>
              Try saving again
            </Button>
          }
        >
          Your result was not saved. {saveError.message}
        </InlineMessage>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        {hasNext ? (
          <ButtonLink size="lg" to={`/basics/${next.lesson.id}`}>
            Next: {next.lesson.title}
          </ButtonLink>
        ) : isPassed ? (
          <ButtonLink size="lg" to="/basics">
            Back to the path
          </ButtonLink>
        ) : (
          <Button size="lg" onClick={onTryAgain}>
            Try again
          </Button>
        )}
        {isPassed ? (
          <Button size="lg" variant="secondary" onClick={onTryAgain}>
            Practice it again
          </Button>
        ) : (
          <>
            {onReview && (
              <Button size="lg" variant="secondary" onClick={onReview}>
                Review the cards
              </Button>
            )}
            <ButtonLink size="lg" variant="quiet" to="/basics">
              Back to the path
            </ButtonLink>
          </>
        )}
      </div>
      {missed.length > 0 && (
        <div>
          <Button variant="secondary" onClick={onPracticeMissed}>
            Practice the {missed.length === 1 ? 'one' : missed.length} you missed
          </Button>
          <p className="mt-2 text-sm text-muted">This is extra practice. It does not change your score.</p>
        </div>
      )}

      {missed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-ink">To look at again</h2>
          <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
            {missed.map(({ question }) => (
              <li key={question.id} className="flex flex-col gap-1 py-3">
                <span className="text-base text-ink">{question.prompt}</span>
                <span className="text-base font-semibold text-strong">
                  {question.options.find((option) => option.isCorrect)?.label}
                </span>
                {question.explain && <span className="text-sm text-muted">{question.explain}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
