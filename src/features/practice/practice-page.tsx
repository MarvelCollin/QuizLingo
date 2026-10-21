import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { Skeleton } from '../../components/ui/skeleton';
import { percent, plural } from '../../lib/format';
import { usePageMeta } from '../../lib/use-page-meta';
import { useProgress } from '../progress/use-progress';
import { useSentences } from '../study/use-study-data';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import { LEVEL_FILTERS, LEVEL_LABELS, MORE_PRACTICE, PRACTICE_MODES, WORD_SET_LABELS } from './constants';
import { learningStep, STEP_GROWTH } from './learning-step';
import { sessionWords, wordsForMode, wordsInLevel, wordsInSet } from './pick-words';
import { configFromParams, configToSearch } from './round-config';
import { isSpeechSupported } from './speech';
import type { LevelFilter, RoundConfig, StepProgressProps, WordSetId } from './types';

const SetupSkeleton = () => (
  <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading practice options">
    {[0, 1, 2].map((row) => (
      <div key={row} className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-14 w-full" />
      </div>
    ))}
  </div>
);

const StepProgress = ({ step, level }: StepProgressProps) => (
  <div className="flex flex-col gap-2 rounded-lg border border-hairline px-4 py-3" aria-live="polite">
    <p className="text-sm font-semibold text-ink">
      {step.size.toLocaleString('en-US')} of {plural(step.total, `${level} word`)} open
    </p>
    <div
      role="progressbar"
      aria-label="Known words in this step"
      aria-valuemin={0}
      aria-valuemax={step.needed}
      aria-valuenow={Math.min(step.known, step.needed)}
      className="h-2 overflow-hidden rounded-full bg-tint"
    >
      <div className="h-full rounded-full bg-strong" style={{ width: `${percent(Math.min(step.known, step.needed), step.needed)}%` }} />
    </div>
    <p className="text-sm text-muted">
      {step.isComplete
        ? 'Every word in this level is open and known. Keep reviewing them when they are due.'
        : step.size === step.total
          ? `${plural(step.known, 'word')} known. All words are open, so keep reviewing until you know ${step.needed}.`
          : `${plural(step.known, 'word')} known. Know ${step.needed} to open ${Math.min(STEP_GROWTH, step.total - step.size)} more. A word counts as known once you get it right again after at least a day.`}
    </p>
  </div>
);

const PracticePage = () => {
  usePageMeta('Practice', 'Set up a practice round: pick the HSK level, the words and the way you want to practice.');
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const config = configFromParams(params);
  const vocabulary = useVocabulary();
  const progress = useProgress();
  const usesSentences = PRACTICE_MODES.find((m) => m.id === config.mode)!.usesSentences;
  const sentences = useSentences(usesSentences ? 7 : 1);
  const [now] = useState(() => Date.now());

  const update = (change: Partial<RoundConfig>) =>
    setParams(new URLSearchParams({ ...config, ...change }), { replace: true });

  const counts = useMemo(() => {
    if (!vocabulary.data) return null;
    const usable = wordsForMode(vocabulary.data, config.mode, sentences.data);
    const level = wordsInLevel(usable, config.level);
    const step = learningStep(wordsInLevel(vocabulary.data, config.level), progress.byWord);
    const open = new Set(step.open.map((w) => w.hanzi));
    const count = (set: WordSetId) => wordsInSet(level, set, progress.byWord, now, open).length;
    return {
      step,
      session: sessionWords(wordsInSet(level, config.set, progress.byWord, now, open), config.set, progress.byWord).length,
      levels: Object.fromEntries(
        LEVEL_FILTERS.map((l) => [l, wordsInLevel(usable, l).length]),
      ) as Record<LevelFilter, number>,
      sets: { step: count('step'), due: count('due'), new: count('new'), all: level.length } as Record<WordSetId, number>,
    };
  }, [vocabulary.data, sentences.data, progress.byWord, config.level, config.mode, config.set, now]);

  const modes = isSpeechSupported() ? PRACTICE_MODES : PRACTICE_MODES.filter((m) => !m.needsVoice);
  const roundLength = counts?.session ?? 0;
  const modeLabel = PRACTICE_MODES.find((m) => m.id === config.mode)!.label;
  const setWord = { step: 'open', new: 'new', due: 'due', all: 'mixed' }[config.set];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Practice</h1>
        <p className="mt-1 text-base text-muted">
          QuizLingo picks the words for you: reviews that are due first, then a few new ones. Every answer updates your review schedule.
        </p>
      </div>

      {(vocabulary.isError || progress.isError) && (
        <InlineMessage tone="error">{(vocabulary.error ?? progress.error)?.message}</InlineMessage>
      )}

      {!counts || progress.isPending || (usesSentences && sentences.isPending) ? (
        <SetupSkeleton />
      ) : (
        <form
          className="flex flex-col gap-8"
          onSubmit={(event) => {
            event.preventDefault();
            if (roundLength > 0) navigate(`/practice/round${configToSearch(config)}`);
          }}
        >
          <SegmentedControl
            label="Level"
            value={config.level}
            onChange={(level) => update({ level })}
            isWrapped
            options={LEVEL_FILTERS.map((value) => ({
              value,
              label: LEVEL_LABELS[value],
              detail: plural(counts.levels[value], 'word'),
            }))}
          />
          <SegmentedControl
            label="Words"
            value={config.set}
            onChange={(set) => update({ set })}
            options={(['step', 'new', 'due', 'all'] as WordSetId[]).map((value) => ({
              value,
              label: WORD_SET_LABELS[value],
              detail: `${counts.sets[value].toLocaleString('en-US')} available`,
            }))}
          />
          {config.set === 'step' && <StepProgress step={counts.step} level={LEVEL_LABELS[config.level]} />}
          <SegmentedControl
            label="Way to practice"
            value={config.mode}
            onChange={(mode) => update({ mode })}
            isStacked
            options={modes.map((m) => ({ value: m.id, label: m.label, detail: m.detail }))}
          />

          <div className="flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base text-ink" aria-live="polite">
              {roundLength > 0
                ? `${roundLength} ${setWord} ${roundLength === 1 ? 'word' : 'words'} from ${LEVEL_LABELS[config.level]} in ${modeLabel} mode. Words you miss come back a few cards later, and the session ends when you know them all.`
                : config.set === 'step'
                  ? 'Your open words are resting until their next review. Come back when they are due.'
                  : config.set === 'due'
                  ? 'Nothing is due right now. Pick New words to keep going.'
                  : 'No words left in this set. Pick another set or level.'}
            </p>
            <Button type="submit" size="lg" disabled={roundLength === 0}>
              Start session
            </Button>
          </div>
        </form>
      )}

      <section aria-labelledby="more-title" className="flex flex-col gap-3">
        <h2 id="more-title" className="text-lg font-semibold text-ink">
          More ways to practice
        </h2>
        <ul className="divide-y divide-hairline border-y border-hairline">
          {MORE_PRACTICE.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className="flex items-center justify-between gap-4 py-4 hover:bg-surface">
                <span>
                  <span className="block text-base font-semibold text-ink">{item.label}</span>
                  <span className="block text-sm text-muted">{item.detail}</span>
                </span>
                <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" strokeWidth={1.75} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default PracticePage;
