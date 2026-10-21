import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/utils';
import { usePageMeta } from '../../lib/use-page-meta';
import { useSaveRound } from '../progress/use-save-round';
import { useSentences } from '../study/use-study-data';
import { LEVELS, levelLabel } from '../vocabulary/constants';
import type { HskLevel } from '../vocabulary/types';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import { buildMockPaper } from './build-mock';
import { MOCK_FORMATS } from './mock-format';
import { MockItemView } from './mock-item-view';
import { MockResults } from './mock-results';
import { isAnswered, isRight, scoreSections } from './mock-score';
import type { ChoiceItem, MockAnswer, MockPaper, MockRunProps, MockStage } from './mock-types';
import { Navigator } from './navigator';
import { clock, useCountdown } from './use-countdown';
import { useListeningLevel } from './use-listening';
import { useSequencePlayer } from './use-sequence-player';

const MockRun = ({ paper, onRestart }: MockRunProps) => {
  const [stage, setStage] = useState<MockStage>({ kind: 'section', section: 0 });
  const [answers, setAnswers] = useState<MockAnswer[][]>(() => paper.sections.map((s) => s.items.map(() => null)));
  const [current, setCurrent] = useState(0);
  const [plays, setPlays] = useState<Record<string, number>>({});
  const [isConfirming, setIsConfirming] = useState(false);
  const player = useSequencePlayer();
  const saveRound = useSaveRound();
  const sectionIndex = stage.kind === 'results' ? 0 : stage.section;
  const section = paper.sections[sectionIndex];
  const isReviewing = stage.kind === 'review';

  const expireRef = useRef<() => void>(() => undefined);
  const timer = useCountdown(paper.sections[0].minutes * 60, stage.kind === 'section', () => expireRef.current());

  const finishSection = () => {
    player.stop();
    setIsConfirming(false);
    setCurrent(0);
    if (stage.kind !== 'section') return;
    if (stage.section + 1 < paper.sections.length) {
      setStage({ kind: 'section', section: stage.section + 1 });
      timer.reset(paper.sections[stage.section + 1].minutes * 60);
      return;
    }
    const total = paper.sections.reduce((n, s) => n + s.items.length, 0);
    const correct = paper.sections.reduce((n, s, si) => n + s.items.filter((item, i) => isRight(item, answers[si][i])).length, 0);
    saveRound.mutate({ mode: 'mock-test', level: paper.level, total, correct });
    setStage({ kind: 'results' });
  };

  useEffect(() => {
    expireRef.current = finishSection;
  });

  if (stage.kind === 'results') {
    return (
      <MockResults
        paper={paper}
        answers={answers}
        onRestart={onRestart}
        onReview={(s, i) => {
          setStage({ kind: 'review', section: s });
          setCurrent(i);
        }}
      />
    );
  }

  const item = section.items[current];
  const answer = answers[sectionIndex][current];
  const blank = answers[sectionIndex].filter((a) => !isAnswered(a)).length;
  const setAnswer = (value: MockAnswer) =>
    setAnswers(answers.map((list, s) => (s === sectionIndex ? list.map((a, i) => (i === current ? value : a)) : list)));
  const play = (choice: ChoiceItem) => {
    if (!isReviewing) setPlays({ ...plays, [choice.audioKey]: (plays[choice.audioKey] ?? 0) + 1 });
    player.play(choice.audioKey, choice.audio, 1, () => {
      if (!isReviewing) setPlays((counts) => ({ ...counts, [choice.audioKey]: Math.max(0, (counts[choice.audioKey] ?? 1) - 1) }));
    });
  };
  const playsLeft = item.kind === 'choice' ? Math.max(0, paper.format.plays - (plays[item.audioKey] ?? 0)) : 0;
  const score = isReviewing ? scoreSections(paper, answers)[sectionIndex] : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="sticky top-16 z-20 -mx-1 flex flex-col gap-3 bg-bg/95 px-1 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">
              {levelLabel(paper.level)} mock test, part {sectionIndex + 1} of {paper.sections.length}
            </p>
            <h1 className="text-xl font-bold text-ink">{section.label}</h1>
          </div>
          {isReviewing ? (
            <p className="text-base text-muted">
              {score?.correct} of {score?.total} right
            </p>
          ) : (
            <p
              role="timer"
              aria-label={`${Math.ceil(timer.left / 60)} minutes left`}
              className={cn('text-2xl font-bold tabular-nums', timer.left <= 60 ? 'text-bad-strong' : 'text-ink')}
            >
              {clock(timer.left)}
            </p>
          )}
        </div>
        <Navigator items={section.items} answers={answers[sectionIndex]} current={current} isReviewing={isReviewing} onJump={setCurrent} />
        {player.failure && <InlineMessage tone="error">{player.failure}</InlineMessage>}
      </div>

      <MockItemView
        key={`${sectionIndex}-${current}`}
        item={item}
        number={current + 1}
        answer={answer}
        playsLeft={playsLeft}
        isReviewing={isReviewing}
        onAnswer={setAnswer}
        onPlay={play}
      />

      <div className="flex items-center justify-between gap-3">
        <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} />
          {current > 0 ? `Question ${current}` : 'Previous'}
        </Button>
        <Button variant="secondary" disabled={current >= section.items.length - 1} onClick={() => setCurrent(current + 1)}>
          {current < section.items.length - 1 ? `Question ${current + 2}` : 'Next'}
          <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
        </Button>
      </div>

      {isReviewing ? (
        <div className="flex flex-wrap gap-3 border-t border-hairline pt-6">
          <Button onClick={() => setStage({ kind: 'results' })}>Back to results</Button>
          {sectionIndex + 1 < paper.sections.length && (
            <Button variant="secondary" onClick={() => { setStage({ kind: 'review', section: sectionIndex + 1 }); setCurrent(0); }}>
              Review {paper.sections[sectionIndex + 1].label.toLowerCase()}
            </Button>
          )}
        </div>
      ) : isConfirming ? (
        <div role="alertdialog" aria-labelledby="hand-in-title" className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface p-4">
          <p id="hand-in-title" className="text-base font-semibold text-ink">
            {blank > 0 ? `${blank} ${blank === 1 ? 'question is' : 'questions are'} still blank.` : 'Every question has an answer.'} You cannot come back to {section.label.toLowerCase()} after you hand it in.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={finishSection}>Hand in {section.label.toLowerCase()}</Button>
            <Button variant="secondary" onClick={() => setIsConfirming(false)}>
              Keep checking
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t border-hairline pt-6">
          <Button size="lg" onClick={() => setIsConfirming(true)}>
            Hand in {section.label.toLowerCase()}
          </Button>
        </div>
      )}
    </div>
  );
};

const MockTestPage = () => {
  const { level: param } = useParams();
  const requested = Number(param) as HskLevel;
  const level = LEVELS.includes(requested) ? requested : 1;
  usePageMeta(`${levelLabel(level)} mock test`, `A timed ${levelLabel(level)} mock test in the HSK 3.0 format.`);
  const format = MOCK_FORMATS[level];
  const sentences = useSentences(level);
  const vocabulary = useVocabulary();
  const tests = useListeningLevel(level);
  const [run, setRun] = useState<{ id: number; paper: MockPaper } | null>(null);

  if (sentences.isPending || vocabulary.isPending || tests.isPending) {
    return <Skeleton className="mx-auto h-80 w-full max-w-3xl" />;
  }
  if (!sentences.data || vocabulary.isError || tests.isError) {
    return <InlineMessage tone="error">The test content could not be loaded. Reload the page to try again.</InlineMessage>;
  }
  const start = (id: number) => setRun({ id, paper: buildMockPaper(level, sentences.data!, vocabulary.data, tests.data) });

  if (run) return <MockRun key={run.id} paper={run.paper} onRestart={() => start(run.id + 1)} />;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <Link
        to={`/tests?level=${level}`}
        className="-ml-3 inline-flex min-h-11 items-center gap-1.5 self-start rounded-md px-3 text-sm font-semibold text-strong hover:bg-tint"
      >
        <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} />
        All tests
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-ink">{levelLabel(level)} mock test</h1>
        <p className="mt-1 text-base text-muted">Follows the HSK 3.0 layout for this level. Questions are built from QuizLingo content, not official past papers.</p>
      </div>
      <ul className="divide-y divide-hairline border-y border-hairline">
        {format.sections.map((s) => (
          <li key={s.key} className="flex items-baseline justify-between gap-4 py-3">
            <span className="text-base font-semibold text-ink">{s.label}</span>
            <span className="text-base text-muted">
              {s.count} questions, {s.minutes} minutes
            </span>
          </li>
        ))}
      </ul>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-base text-ink">
        <li>Each part has its own clock. When it runs out, the part is handed in for you.</li>
        <li>You can move between questions inside a part, but not go back to a part you handed in.</li>
        <li>Each recording can be played {format.plays === 1 ? 'once' : 'twice'}.</li>
        <li>
          Pass mark: {format.pass} of {format.total}
          {format.isScoringEstimated ? ', estimated until the official HSK 3.0 scoring is published' : ''}.
        </li>
        {level === 7 && <li>Translation and speaking from the real 7-9 exam are not part of this mock.</li>}
        {level >= 4 && <li>Writing here is sentence building. Essay tasks cannot be marked automatically.</li>}
      </ul>
      <Button size="lg" className="self-start" onClick={() => start(0)}>
        Start the test
      </Button>
    </div>
  );
};

export default MockTestPage;
