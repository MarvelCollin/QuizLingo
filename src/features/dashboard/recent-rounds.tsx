import { timeAgo } from '../../lib/format';
import { levelLabel } from '../vocabulary/constants';
import { PRACTICE_MODES } from '../practice/constants';
import type { RecentRoundsProps } from './types';

const MODE_NAMES: Record<string, string> = {
  ...Object.fromEntries(PRACTICE_MODES.map((m) => [m.apiMode, m.label])),
  hanzi: 'Character quiz',
  writing: 'Writing',
  tones: 'Tones',
  'listening-test': 'Listening test',
  'mock-test': 'Mock test',
  speaking: 'Speaking',
};

export const RecentRounds = ({ rounds }: RecentRoundsProps) => (
  <section aria-labelledby="recent-title">
    <h2 id="recent-title" className="text-lg font-semibold text-ink">
      Recent rounds
    </h2>
    {rounds.length === 0 ? (
      <p className="mt-2 text-base text-muted">Your finished rounds will show up here.</p>
    ) : (
      <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
        {rounds.slice(0, 5).map((round) => (
          <li key={round.id} className="flex items-baseline justify-between gap-4 py-3 text-base">
            <span className="text-ink">
              {MODE_NAMES[round.mode] ?? round.mode}, {levelLabel(round.level)}
            </span>
            <span className="text-right text-muted">
              <span className="font-semibold text-ink">
                {round.correct} of {round.total}
              </span>{' '}
              right, {timeAgo(round.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    )}
  </section>
);
