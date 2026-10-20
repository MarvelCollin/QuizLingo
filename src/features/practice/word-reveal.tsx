import { SentenceView } from '../study/sentence-view';
import { useSentences } from '../study/use-study-data';
import type { WordRevealProps } from './types';

export const WordReveal = ({ word, isExampleShown = true }: WordRevealProps) => {
  const sentences = useSentences(word.level);
  const example = isExampleShown ? sentences.data?.byWord.get(word.hanzi)?.[0] : undefined;
  return (
    <dl className="flex flex-col gap-3">
      {word.readings.map((reading) => (
        <div key={reading.pinyin}>
          <dt className="text-lg font-semibold text-strong">{reading.pinyin}</dt>
          <dd className="text-base text-ink">{reading.meanings.slice(0, 4).join(', ')}</dd>
        </div>
      ))}
      {word.traditional !== word.hanzi && (
        <div className="text-sm text-muted">
          <dt className="inline">Traditional: </dt>
          <dd lang="zh-TW" className="inline font-hanzi text-base">
            {word.traditional}
          </dd>
        </div>
      )}
      {example && (
        <div className="border-t border-hairline pt-3">
          <dt className="sr-only">Example</dt>
          <dd>
            <SentenceView sentence={example} highlight={word.hanzi} />
          </dd>
        </div>
      )}
    </dl>
  );
};
