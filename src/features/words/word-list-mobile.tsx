import { Link } from 'react-router';
import { StatusLabel } from '../progress/status-label';
import { levelLabel } from '../vocabulary/constants';
import { ListenButton } from '../practice/listen-button';
import type { WordListMobileProps } from './types';

export const WordListMobile = ({ rows }: WordListMobileProps) => (
  <ul className="divide-y divide-hairline border-y border-hairline">
    {rows.map((row) => (
      <li key={row.hanzi} className="flex items-start gap-3 py-3">
        <Link
          to={`/words/${encodeURIComponent(row.hanzi)}`}
          lang="zh-CN"
          className="w-16 shrink-0 font-hanzi text-2xl text-ink underline-offset-4 hover:underline"
        >
          {row.hanzi}
        </Link>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-strong">{row.pinyin}</p>
          <p className="text-base text-ink">{row.readings.flatMap((r) => r.meanings).slice(0, 2).join(', ')}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted">
            <span>{levelLabel(row.level)}</span>
            <StatusLabel status={row.status} />
            {row.accuracy !== null && <span>{row.accuracy}% right</span>}
          </p>
        </div>
        <ListenButton text={row.hanzi} label="" className="px-2" />
      </li>
    ))}
  </ul>
);
