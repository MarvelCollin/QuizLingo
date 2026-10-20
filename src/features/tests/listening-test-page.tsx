import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button, ButtonLink } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { useSaveRound } from '../progress/use-save-round';
import { levelLabel } from '../vocabulary/constants';
import { levelOfTestId } from './api';
import { AudioBar } from './audio-bar';
import { QuestionCard } from './question-card';
import { ScriptView } from './script-view';
import { useListeningLevel } from './use-listening';
import { useScriptPlayer } from './use-script-player';
import type { ListeningTestViewProps } from './types';

const ListeningTestView = ({ test }: ListeningTestViewProps) => {
  usePageMeta(`${test.title}, listening`, `${levelLabel(test.level)} listening practice: ${test.scene}.`);
  const player = useScriptPlayer(test.lines);
  const saveRound = useSaveRound();
  const [answers, setAnswers] = useState<(number | null)[]>(() => test.questions.map(() => null));
  const [isReviewing, setIsReviewing] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(false);
  const [isPinyinShown, setIsPinyinShown] = useState(false);
  const [isEnglishShown, setIsEnglishShown] = useState(false);
  const [focusLine, setFocusLine] = useState<number | null>(null);
  const [isIncomplete, setIsIncomplete] = useState(false);

  const correct = answers.filter((a, i) => a === test.questions[i].answer).length;
  const blank = answers.filter((a) => a === null).length;

  const check = () => {
    if (blank > 0 && !isIncomplete) {
      setIsIncomplete(true);
      return;
    }
    player.pause();
    setIsReviewing(true);
    setIsIncomplete(false);
    saveRound.mutate({ mode: 'listening-test', level: test.level, total: test.questions.length, correct });
  };

  const retry = () => {
    setAnswers(test.questions.map(() => null));
    setIsReviewing(false);
    setFocusLine(null);
    setIsScriptOpen(false);
  };

  const locate = (line: number) => {
    setIsScriptOpen(true);
    setFocusLine(line);
    player.playLine(line);
  };

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={`/tests?level=${test.level}`}
        className="-ml-3 inline-flex min-h-11 items-center gap-1.5 self-start rounded-md px-3 text-sm font-semibold text-strong hover:bg-tint"
      >
        <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} />
        All tests
      </Link>
      <div>
        <p className="text-sm text-muted">{levelLabel(test.level)} listening</p>
        <h1 className="text-2xl font-bold text-ink">{test.title}</h1>
        <p className="mt-1 text-base text-muted">{test.scene}</p>
      </div>

      <div className="sticky top-16 z-20 -mx-1 bg-bg/95 px-1 py-2 backdrop-blur-sm">
        <AudioBar player={player} total={test.lines.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="questions-title" className="flex flex-col gap-4">
          <h2 id="questions-title" className="text-lg font-semibold text-ink">
            Questions
          </h2>
          {test.questions.map((question, i) => (
            <QuestionCard
              key={i}
              question={question}
              number={i + 1}
              chosen={answers[i]}
              isReviewing={isReviewing}
              onChoose={(option) => {
                setAnswers(answers.map((a, n) => (n === i ? option : a)));
                setIsIncomplete(false);
              }}
              onLocate={() => locate(question.line)}
            />
          ))}
          {isIncomplete && (
            <InlineMessage tone="info">
              {blank} {blank === 1 ? 'question is' : 'questions are'} still blank. Check again to see your score anyway.
            </InlineMessage>
          )}
          {isReviewing ? (
            <div className="flex flex-col gap-3 rounded-xl bg-surface p-4">
              <p className="text-2xl font-bold text-strong" role="status">
                {correct} of {test.questions.length} right
              </p>
              <p className="text-sm text-muted">{saveRound.isPending ? 'Saving' : 'Saved to your activity.'}</p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={retry}>Try again</Button>
                <ButtonLink to={`/tests?level=${test.level}`} variant="secondary">
                  Next test
                </ButtonLink>
              </div>
            </div>
          ) : (
            <Button size="lg" onClick={check}>
              Check answers
            </Button>
          )}
        </section>

        <section aria-labelledby="script-title" className="flex flex-col gap-3">
          <button
            type="button"
            aria-expanded={isScriptOpen}
            aria-controls="script-body"
            onClick={() => setIsScriptOpen(!isScriptOpen)}
            className="flex min-h-11 cursor-pointer items-center justify-between rounded-md text-left"
          >
            <h2 id="script-title" className="text-lg font-semibold text-ink">
              Audioscript
            </h2>
            <span className="flex items-center gap-1 text-sm font-semibold text-strong">
              {isScriptOpen ? 'Hide' : 'Show'}
              <ChevronDown
                aria-hidden="true"
                className={`size-4 transition-transform duration-150 ${isScriptOpen ? 'rotate-180' : ''}`}
                strokeWidth={2}
              />
            </span>
          </button>
          {isScriptOpen ? (
            <div id="script-body" className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="quiet" onClick={() => setIsPinyinShown(!isPinyinShown)}>
                  {isPinyinShown ? 'Hide pinyin' : 'Show pinyin'}
                </Button>
                <Button variant="quiet" onClick={() => setIsEnglishShown(!isEnglishShown)}>
                  {isEnglishShown ? 'Hide English' : 'Show English'}
                </Button>
              </div>
              <ScriptView
                lines={test.lines}
                player={player}
                focusLine={focusLine}
                isPinyinShown={isPinyinShown}
                isEnglishShown={isEnglishShown}
              />
            </div>
          ) : (
            <p id="script-body" className="text-base text-muted">
              Listen first. Open the script any time to read along, tap a line to play from there.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

const ListeningTestPage = () => {
  const { id = '' } = useParams();
  const level = levelOfTestId(id) ?? 1;
  const tests = useListeningLevel(level);
  if (tests.isPending) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading test">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (tests.isError) return <InlineMessage tone="error">{tests.error.message}</InlineMessage>;
  const test = tests.data.find((t) => t.id === id);
  if (!test) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-start gap-4">
        <h1 className="text-2xl font-bold text-ink">This test does not exist</h1>
        <ButtonLink to="/tests">All tests</ButtonLink>
      </div>
    );
  }
  return <ListeningTestView key={test.id} test={test} />;
};

export default ListeningTestPage;
