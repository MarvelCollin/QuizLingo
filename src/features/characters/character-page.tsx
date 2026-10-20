import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { ButtonLink } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { ListenButton } from '../practice/listen-button';
import { useHanzi } from '../study/use-study-data';
import { levelLabel } from '../vocabulary/constants';
import type { HskLevel } from '../vocabulary/types';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import { StrokePlayer } from './stroke-player';

const CharacterPage = () => {
  const { char = '' } = useParams();
  const hanzi = useHanzi();
  const vocabulary = useVocabulary();
  const info = hanzi.data?.find((h) => h.char === char);
  usePageMeta(info ? `${info.char} ${info.pinyin}` : 'Character', info ? `${info.char} (${info.pinyin}): ${info.meanings.slice(0, 2).join(', ')}. Stroke order and words.` : undefined);

  if (hanzi.isPending) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4" aria-busy="true" aria-label="Loading character">
        <Skeleton className="h-52 w-52" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (hanzi.isError) return <InlineMessage tone="error">{hanzi.error.message}</InlineMessage>;
  if (!info) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-start gap-4">
        <h1 className="text-2xl font-bold text-ink">This character is not in the HSK 3.0 list</h1>
        <ButtonLink to="/characters">Back to all characters</ButtonLink>
      </div>
    );
  }

  const words = (vocabulary.data ?? []).filter((w) => w.hanzi.includes(info.char)).sort((a, b) => a.level - b.level).slice(0, 12);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <Link
        to="/characters"
        className="-ml-3 inline-flex min-h-11 items-center gap-1.5 self-start rounded-md px-3 text-sm font-semibold text-strong hover:bg-tint"
      >
        <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} />
        All characters
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <StrokePlayer key={info.char} char={info.char} />
        <div className="flex flex-col gap-2">
          <h1 lang="zh-CN" className="sr-only">
            {info.char}
          </h1>
          <p className="flex items-center gap-2 text-2xl font-semibold text-strong">
            {info.pinyin}
            <ListenButton text={info.char} label="" className="px-2" />
          </p>
          <p className="text-lg text-ink">{info.meanings.join(', ')}</p>
          <p className="text-sm text-muted">
            {levelLabel(info.level)},{' '}
            {info.writeLevel === 0 ? 'read only' : `you need to write it from ${levelLabel(info.writeLevel as HskLevel)}`}
          </p>
        </div>
      </div>

      <section aria-labelledby="char-words-title" className="flex flex-col gap-3">
        <h2 id="char-words-title" className="text-lg font-semibold text-ink">
          Words with {info.char}
        </h2>
        <ul className="divide-y divide-hairline border-y border-hairline">
          {words.map((w) => (
            <li key={w.hanzi}>
              <Link to={`/words/${encodeURIComponent(w.hanzi)}`} className="flex items-baseline gap-4 py-3 hover:bg-surface">
                <span lang="zh-CN" className="w-28 shrink-0 font-hanzi text-2xl text-ink">
                  {w.hanzi}
                </span>
                <span className="font-semibold text-strong">{w.pinyin}</span>
                <span className="min-w-0 flex-1 truncate text-muted">{w.meaning}</span>
                <span className="text-sm text-muted">{levelLabel(w.level)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-muted">Stroke data from Make Me a Hanzi, Arphic Public License.</p>
    </div>
  );
};

export default CharacterPage;
