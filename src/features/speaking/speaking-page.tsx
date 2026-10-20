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
import type { Sentence } from '../study/types';
import { useSentences } from '../study/use-study-data';
import { LEVELS, levelLabel } from '../vocabulary/constants';
import type { HskLevel } from '../vocabulary/types';
import { isRecognitionSupported } from './recognition';
import { SpeakingTask } from './speaking-task';
import type { SpeakingRoundProps } from './types';

const ROUND = 8;

const SpeakingRound = ({ level, items, onRestart, onEnd }: SpeakingRoundProps) => {
  const round = useToolRound(items, 'speaking', level);
  const label = `Speaking, ${levelLabel(level)}`;
  if (round.isDone || !round.current) {
    return (
      <ToolSummary
        title="Round complete"
        correct={round.correct}
        total={round.total}
        missed={round.missed.map((s) => ({ key: String(s.id), main: s.text, detail: s.english }))}
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
      <SpeakingTask key={round.index} sentence={round.current} onAnswer={round.answer} onNext={round.next} />
    </div>
  );
};

const SpeakingPage = () => {
  usePageMeta('Speaking', 'Read HSK 3.0 sentences aloud and see which characters the speech recogniser heard.');
  const [params, setParams] = useSearchParams();
  const requested = Number(params.get('level')) as HskLevel;
  const level = LEVELS.includes(requested) ? requested : 1;
  const sentences = useSentences(level);
  const [round, setRound] = useState<{ id: number; items: Sentence[] } | null>(null);

  if (!isRecognitionSupported()) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <h1 className="text-2xl font-bold text-ink">Speaking</h1>
        <InlineMessage tone="error">This browser has no speech recognition. Open QuizLingo in Chrome, Edge or Safari to practice speaking.</InlineMessage>
      </div>
    );
  }
  if (sentences.isPending) return <Skeleton className="mx-auto h-72 w-full max-w-2xl" />;
  if (!sentences.data) return <InlineMessage tone="error">The sentences could not be loaded. Reload the page to try again.</InlineMessage>;

  const pool = sentences.data.all.filter((s) => s.level === level && s.text.length <= (level <= 3 ? 12 : 20));
  const start = (id: number) => setRound({ id, items: shuffle(pool).slice(0, ROUND) });
  if (round) return <SpeakingRound key={round.id} level={level} items={round.items} onRestart={() => start(round.id + 1)} onEnd={() => setRound(null)} />;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Speaking</h1>
        <p className="mt-1 text-base text-muted">
          Read each sentence aloud. The characters the recogniser heard turn green. A match of 80 percent or more counts as right, and you get three tries.
        </p>
        <p className="mt-2 text-sm text-muted">
          Your voice goes to your browser's speech service (Google in Chrome, Microsoft in Edge, Apple in Safari). QuizLingo does not record or keep it.
        </p>
      </div>
      <SegmentedControl
        label="Level"
        value={String(level)}
        onChange={(value) => setParams({ level: value }, { replace: true })}
        isWrapped
        options={LEVELS.map((l) => ({ value: String(l), label: levelLabel(l) }))}
      />
      <div className="flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base text-ink">{Math.min(ROUND, pool.length)} sentences from {levelLabel(level)}.</p>
        <Button size="lg" disabled={pool.length === 0} onClick={() => start(0)}>
          Start round
        </Button>
      </div>
    </div>
  );
};

export default SpeakingPage;
