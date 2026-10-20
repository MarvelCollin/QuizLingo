import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { Skeleton } from '../../components/ui/skeleton';
import { shuffle } from '../../lib/random';
import { usePageMeta } from '../../lib/use-page-meta';
import { ToolHeader, ToolSummary } from '../practice/tool-round-parts';
import { useToolRound } from '../practice/use-tool-round';
import { useAudioIndex } from '../study/use-study-data';
import { LEVELS, levelLabel } from '../vocabulary/constants';
import type { HskLevel } from '../vocabulary/types';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import { toneItemsFor } from './build-tone-items';
import { ToneQuestion } from './tone-question';
import type { ToneItem, ToneKind, ToneRoundProps } from './types';

const ROUND = 15;

const ToneRound = ({ kind, level, items, onRestart, onEnd }: ToneRoundProps) => {
  const round = useToolRound(items, 'tones', level);
  const label = `${kind === 'syllable' ? 'Single tones' : 'Tone pairs'}, ${levelLabel(level)}`;
  if (round.isDone || !round.current) {
    return (
      <ToolSummary
        title="Round complete"
        correct={round.correct}
        total={round.total}
        missed={round.missed.map((item) => ({ key: item.key, main: item.hanzi, detail: `${item.answer}, ${item.meaning}` }))}
        isSaving={round.isSaving}
        onRestart={onRestart}
        backTo="/practice"
        backLabel="Back to practice"
      />
    );
  }
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="sr-only">{label}</h1>
      <ToolHeader label={label} index={round.index} total={round.total} correct={round.correct} answered={round.results.length} onEnd={onEnd} />
      <ToneQuestion key={round.index} item={round.current} onAnswer={round.answer} onNext={round.next} />
    </div>
  );
};

const TonesPage = () => {
  usePageMeta('Tones', 'Hear native recordings and pick the tone, one syllable or a whole word at a time.');
  const vocabulary = useVocabulary();
  const audio = useAudioIndex();
  const [params, setParams] = useSearchParams();
  const kind: ToneKind = params.get('kind') === 'pair' ? 'pair' : 'syllable';
  const requested = Number(params.get('level')) as HskLevel;
  const level = LEVELS.includes(requested) ? requested : 1;
  const [round, setRound] = useState<{ id: number; items: ToneItem[] } | null>(null);

  if (vocabulary.isPending || audio.isPending) return <Skeleton className="mx-auto h-72 w-full max-w-2xl" />;
  if (vocabulary.isError || audio.isError) {
    return <InlineMessage tone="error">{(vocabulary.error ?? audio.error)?.message}</InlineMessage>;
  }

  const pool = toneItemsFor(vocabulary.data, audio.data, kind, level);
  const start = (id: number) => setRound({ id, items: shuffle(pool).slice(0, ROUND) });
  const update = (change: Record<string, string>) =>
    setParams({ kind, level: String(level), ...change }, { replace: true });

  if (round) return <ToneRound key={round.id} kind={kind} level={level} items={round.items} onRestart={() => start(round.id + 1)} onEnd={() => setRound(null)} />;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Tones</h1>
        <p className="mt-1 text-base text-muted">
          Native recordings of each syllable and word. Listen, then pick what you heard. Space plays it again.
        </p>
      </div>
      <SegmentedControl
        label="What to hear"
        value={kind}
        onChange={(value) => update({ kind: value })}
        options={[
          { value: 'syllable', label: 'Single tones', detail: 'One syllable, pick tone 1 to 4' },
          { value: 'pair', label: 'Tone pairs', detail: 'A two character word, pick both tones' },
        ]}
      />
      <SegmentedControl
        label="Level"
        value={String(level)}
        onChange={(value) => update({ level: value })}
        isWrapped
        options={LEVELS.map((l) => ({ value: String(l), label: levelLabel(l) }))}
      />
      <div className="flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base text-ink">
          {pool.length === 0
            ? 'No recordings for this choice yet. Pick another level.'
            : `${Math.min(ROUND, pool.length)} of ${pool.length.toLocaleString('en-US')} recordings from ${levelLabel(level)}.`}
        </p>
        <Button size="lg" disabled={pool.length === 0} onClick={() => start(0)}>
          Start round
        </Button>
      </div>
    </div>
  );
};

export default TonesPage;
