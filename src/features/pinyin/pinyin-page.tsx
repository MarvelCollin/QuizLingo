import { useMemo, useState } from 'react';
import { LibraryTabs } from '../../components/layout/library-tabs';
import { InlineMessage } from '../../components/ui/inline-message';
import { SearchField } from '../../components/ui/search-field';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { playSyllable } from '../practice/speech';
import { useAudioIndex } from '../study/use-study-data';
import { markTone } from '../vocabulary/pinyin';
import { buildChart } from './chart';
import { ChartGrid } from './chart-grid';

const TONES = [
  { value: '1', label: 'Tone 1', detail: 'High, flat' },
  { value: '2', label: 'Tone 2', detail: 'Rising' },
  { value: '3', label: 'Tone 3', detail: 'Dipping' },
  { value: '4', label: 'Tone 4', detail: 'Falling' },
] as const;

// Turns what someone types, such as "Lü3" or "nǚ", into the spelling the recordings use
const toSpelling = (text: string) =>
  text
    .toLowerCase()
    .replace(/[ǖǘǚǜü]|u:/g, 'v')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');

const PinyinPage = () => {
  usePageMeta('Pinyin chart', 'Every pinyin syllable with a native recording, by initial and final. Press one to hear it in any tone.');
  const audio = useAudioIndex();
  const [tone, setTone] = useState('1');
  const [query, setQuery] = useState('');
  const [playing, setPlaying] = useState<string | null>(null);

  const chart = useMemo(() => (audio.data ? buildChart(audio.data.syllables) : null), [audio.data]);
  const found = useMemo(() => {
    const spelling = toSpelling(query);
    return chart && spelling && chart.tones.has(spelling) ? spelling : null;
  }, [chart, query]);

  const play = (base: string) => {
    setPlaying(base);
    playSyllable(`${base}${tone}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Library</h1>
        <p className="mt-1 text-base text-muted">Every pinyin syllable with a native recording. Choose a tone, then press a syllable to hear it.</p>
      </div>
      <LibraryTabs />

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <SearchField
          label="Find a syllable"
          isLabelVisible
          value={query}
          placeholder="Try zhang, xue or lü"
          onChange={setQuery}
        />
        <div className="sm:w-96">
          <SegmentedControl label="Tone to play" value={tone} onChange={setTone} options={TONES} />
        </div>
      </div>
      {query && (
        <p className="text-sm text-muted" role="status">
          {found ? `${markTone(found, Number(tone))} is in the chart and highlighted.` : 'No recording for that spelling. Pinyin writes ü as u after j, q, x and y.'}
        </p>
      )}

      {audio.isError && <InlineMessage tone="error">{audio.error.message}</InlineMessage>}
      {audio.isPending && <Skeleton className="h-96 w-full" />}
      {chart && <ChartGrid chart={chart} tone={Number(tone)} found={found} playing={playing} onPlay={play} />}
    </div>
  );
};

export default PinyinPage;
