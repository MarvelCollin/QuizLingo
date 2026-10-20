import type { WordRevealProps } from './types';

// The full answer: every reading with its pinyin and meanings
export const WordReveal = ({ word }: WordRevealProps) => (
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
  </dl>
);
