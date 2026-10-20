import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { Skeleton } from '../../components/ui/skeleton';
import { plural } from '../../lib/format';
import { usePageMeta } from '../../lib/use-page-meta';
import { useProgress } from '../progress/use-progress';
import { useSentences } from '../study/use-study-data';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import { LEVEL_LABELS, PRACTICE_MODES, ROUND_SIZES, WORD_SET_LABELS } from './constants';
import { wordsForMode, wordsInLevel, wordsInSet } from './pick-words';
import { configFromParams, configToSearch } from './round-config';
import { isSpeechSupported } from './speech';
import type { LevelFilter, RoundConfig, WordSetId } from './types';

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

const PracticePage = () => {
  usePageMeta('Practice', 'Set up a practice round: pick the HSK level, the words and the way you want to practice.');
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const config = configFromParams(params);
  const vocabulary = useVocabulary();
  const progress = useProgress();
  const sentences = useSentences();
  const [now] = useState(() => Date.now());

  // The options are kept in the URL, so Back and links from the dashboard restore them
  const update = (change: Partial<RoundConfig>) =>
    setParams(new URLSearchParams({ ...config, ...change }), { replace: true });

  const counts = useMemo(() => {
    if (!vocabulary.data) return null;
    const usable = wordsForMode(vocabulary.data, config.mode, sentences.data);
    const level = wordsInLevel(usable, config.level);
    const count = (set: WordSetId) => wordsInSet(level, set, progress.byWord, now).length;
    return {
      levels: Object.fromEntries(
        (['all', '1', '2', '3'] as LevelFilter[]).map((l) => [l, wordsInLevel(usable, l).length]),
      ) as Record<LevelFilter, number>,
      sets: { due: count('due'), new: count('new'), all: level.length } as Record<WordSetId, number>,
    };
  }, [vocabulary.data, sentences.data, progress.byWord, config.level, config.mode, now]);

  const modes = isSpeechSupported() ? PRACTICE_MODES : PRACTICE_MODES.filter((m) => !m.needsVoice);
  const available = counts?.sets[config.set] ?? 0;
  const roundLength = Math.min(available, Number(config.size));
  const modeLabel = PRACTICE_MODES.find((m) => m.id === config.mode)!.label;
  const setWord = { new: 'new', due: 'due', all: 'mixed' }[config.set];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Practice</h1>
        <p className="mt-1 text-base text-muted">Choose what to practice. Every answer updates your review schedule.</p>
      </div>

      {(vocabulary.isError || progress.isError) && (
        <InlineMessage tone="error">{(vocabulary.error ?? progress.error)?.message}</InlineMessage>
      )}

      {!counts || progress.isPending ? (
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
            options={(['1', '2', '3', 'all'] as LevelFilter[]).map((value) => ({
              value,
              label: LEVEL_LABELS[value],
              detail: plural(counts.levels[value], 'word'),
            }))}
          />
          <SegmentedControl
            label="Words"
            value={config.set}
            onChange={(set) => update({ set })}
            options={(['new', 'due', 'all'] as WordSetId[]).map((value) => ({
              value,
              label: WORD_SET_LABELS[value],
              detail: `${counts.sets[value].toLocaleString()} available`,
            }))}
          />
          <SegmentedControl
            label="Way to practice"
            value={config.mode}
            onChange={(mode) => update({ mode })}
            isStacked
            options={modes.map((m) => ({ value: m.id, label: m.label, detail: m.detail }))}
          />
          <SegmentedControl
            label="Round length"
            value={config.size}
            onChange={(size) => update({ size })}
            options={ROUND_SIZES.map((value) => ({ value, label: `${value} words` }))}
          />

          <div className="flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base text-ink" aria-live="polite">
              {roundLength > 0
                ? `${roundLength} ${setWord} ${roundLength === 1 ? 'word' : 'words'} from ${LEVEL_LABELS[config.level]} in ${modeLabel} mode.`
                : config.set === 'due'
                  ? 'Nothing is due right now. Pick New words to keep going.'
                  : 'No words left in this set. Pick another set or level.'}
            </p>
            <Button type="submit" size="lg" disabled={roundLength === 0}>
              Start round
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PracticePage;
