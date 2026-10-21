import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { ButtonLink } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { Skeleton } from '../../components/ui/skeleton';
import { usePageMeta } from '../../lib/use-page-meta';
import { ListenButton } from '../practice/listen-button';
import { WordReveal } from '../practice/word-reveal';
import { configToSearch } from '../practice/round-config';
import { SentenceView, SourceNote } from '../study/sentence-view';
import { useHanzi, useSentences } from '../study/use-study-data';
import type { LevelFilter } from '../practice/types';
import { levelLabel } from '../vocabulary/constants';
import { useVocabulary } from '../vocabulary/use-vocabulary';
import type { WordPageContentProps } from './types';

const WordPageContent = ({ word }: WordPageContentProps) => {
  usePageMeta(`${word.hanzi} ${word.pinyin}`, `${word.hanzi} (${word.pinyin}): ${word.meaning}. HSK ${word.level} word with examples.`);
  const sentences = useSentences(word.level);
  const hanzi = useHanzi();
  const examples = sentences.data?.byWord.get(word.hanzi) ?? [];
  const characters = [...new Set(word.hanzi)].map((char) => ({
    char,
    info: hanzi.data?.find((h) => h.char === char),
  }));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <Link
        to="/words"
        className="-ml-3 inline-flex min-h-11 items-center gap-1.5 self-start rounded-md px-3 text-sm font-semibold text-strong hover:bg-tint"
      >
        <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} />
        All words
      </Link>

      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 lang="zh-CN" className="font-hanzi text-6xl text-ink">
            {word.hanzi}
          </h1>
          <ListenButton text={word.hanzi} />
        </div>
        <p className="text-sm text-muted">{levelLabel(word.level)}</p>
      </header>

      <WordReveal word={word} isExampleShown={false} />

      <section aria-labelledby="chars-title" className="flex flex-col gap-3">
        <h2 id="chars-title" className="text-lg font-semibold text-ink">
          Characters
        </h2>
        <ul className="divide-y divide-hairline border-y border-hairline">
          {characters.map(({ char, info }) => (
            <li key={char}>
              <Link to={`/characters/${encodeURIComponent(char)}`} className="flex items-center gap-4 py-3 hover:bg-surface">
                <span lang="zh-CN" className="w-12 font-hanzi text-3xl text-ink">
                  {char}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-strong">{info?.pinyin ?? ''}</span>
                  <span className="block text-base text-ink">
                    {info ? info.meanings.slice(0, 3).join(', ') : 'Not in the HSK character list'}
                  </span>
                </span>
                {info && <span className="text-sm text-muted">{levelLabel(info.level)}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="examples-title" className="flex flex-col gap-3">
        <h2 id="examples-title" className="text-lg font-semibold text-ink">
          Examples
        </h2>
        {sentences.isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : examples.length === 0 ? (
          <p className="text-base text-muted">No example sentence at this level yet.</p>
        ) : (
          <ul className="flex flex-col gap-5">
            {examples.map((sentence) => (
              <li key={sentence.id} className="flex flex-col gap-1">
                <SentenceView sentence={sentence} highlight={word.hanzi} />
                <SourceNote sentence={sentence} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-3 border-t border-hairline pt-6">
        <ButtonLink to={`/practice/round${configToSearch({ mode: 'meaning', set: 'step', level: String(word.level) as LevelFilter })}`}>
          Practice {levelLabel(word.level)}
        </ButtonLink>
      </div>
    </div>
  );
};

const WordPage = () => {
  const { word: param = '' } = useParams();
  const vocabulary = useVocabulary();
  if (vocabulary.isPending) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4" aria-busy="true" aria-label="Loading word">
        <Skeleton className="h-16 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (vocabulary.isError) return <InlineMessage tone="error">{vocabulary.error.message}</InlineMessage>;
  const word = vocabulary.data.find((w) => w.hanzi === param);
  if (!word) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-start gap-4">
        <h1 className="text-2xl font-bold text-ink">This word is not in the HSK 3.0 list</h1>
        <ButtonLink to="/words">Back to all words</ButtonLink>
      </div>
    );
  }
  return <WordPageContent key={word.hanzi} word={word} />;
};

export default WordPage;
