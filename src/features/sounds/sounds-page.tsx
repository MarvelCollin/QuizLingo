import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { ToolHeader, ToolSummary } from '../practice/tool-round-parts';
import { useToolRound } from '../practice/use-tool-round';
import { useAudioIndex } from '../study/use-study-data';
import { pickRound, soundItemsFor } from './build-sound-items';
import { groupById, SOUND_GROUPS } from './pairs';
import { SoundQuestion } from './sound-question';
import type { SoundItem, SoundRoundProps } from './types';

const ROUND = 15;

const SoundRound = ({ group, items, onRestart, onEnd }: SoundRoundProps) => {
  const round = useToolRound(items, 'sounds', 1);
  if (round.isDone || !round.current) {
    return (
      <ToolSummary
        title="Round complete"
        correct={round.correct}
        total={round.total}
        missed={round.missed.map((item) => ({ key: item.key, main: item.answer, detail: item.tip }))}
        isSaving={round.isSaving}
        onRestart={onRestart}
        backTo="/practice"
        backLabel="Back to practice"
      />
    );
  }
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="sr-only">Sound pairs, {group.label}</h1>
      <ToolHeader label={`Sound pairs, ${group.label}`} index={round.index} total={round.total} correct={round.correct} answered={round.results.length} onEnd={onEnd} />
      <SoundQuestion key={round.index} item={round.current} onAnswer={round.answer} onNext={round.next} />
    </div>
  );
};

const SoundsPage = () => {
  usePageMeta('Sound pairs', 'Train your ear on the pinyin sounds that are easy to mix up, such as b and p, or an and ang.');
  const audio = useAudioIndex();
  const [params, setParams] = useSearchParams();
  const group = groupById(params.get('group'));
  const [round, setRound] = useState<{ id: number; items: SoundItem[] } | null>(null);

  if (audio.isPending) return <Skeleton className="mx-auto h-72 w-full max-w-2xl" />;
  if (audio.isError) return <InlineMessage tone="error">{audio.error.message}</InlineMessage>;

  const pool = soundItemsFor(group, audio.data.syllables);
  const start = (id: number) => setRound({ id, items: pickRound(pool, ROUND) });

  if (round) {
    return <SoundRound key={round.id} group={group} items={round.items} onRestart={() => start(round.id + 1)} onEnd={() => setRound(null)} />;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Sound pairs</h1>
        <p className="mt-1 text-base text-muted">
          Some sounds are hard to tell apart at first. You hear one syllable and pick between two that differ in only one sound.
        </p>
      </div>
      <SegmentedControl
        label="Which sounds"
        value={group.id}
        onChange={(id) => setParams({ group: id }, { replace: true })}
        isStacked
        options={SOUND_GROUPS.map((g) => ({ value: g.id, label: g.label, detail: g.detail }))}
      />
      <div className="flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base text-ink">
          {Math.min(ROUND, pool.length)} questions from {pool.length.toLocaleString('en-US')} recordings.
        </p>
        <Button size="lg" disabled={pool.length === 0} onClick={() => start(0)}>
          Start round
        </Button>
      </div>
    </div>
  );
};

export default SoundsPage;
