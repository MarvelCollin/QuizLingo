import type { ActivityChartProps } from './types';

const dayFormat = new Intl.DateTimeFormat('en', { weekday: 'short', day: 'numeric', month: 'short' });
const shortDay = new Intl.DateTimeFormat('en', { weekday: 'narrow' });

// Answers per day for the last two weeks. Each bar has its own label, and the totals are in the accessible name.
export const ActivityChart = ({ activity }: ActivityChartProps) => {
  const max = Math.max(...activity.map((d) => d.answers), 1);
  const total = activity.reduce((sum, d) => sum + d.answers, 0);

  return (
    <section aria-labelledby="activity-title">
      <h2 id="activity-title" className="text-lg font-semibold text-ink">
        Last 14 days
      </h2>
      <p className="text-sm text-muted">
        {total === 0 ? 'No practice yet. Each bar will show the answers you give that day.' : `${total.toLocaleString()} answers`}
      </p>
      <ol className="mt-4 flex h-32 items-end gap-1.5" aria-label="Answers per day">
        {activity.map((day) => {
          const date = new Date(day.date);
          return (
            <li key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="sr-only">
                {dayFormat.format(date)}: {day.answers} answers
              </span>
              <span
                aria-hidden="true"
                className={day.answers > 0 ? 'w-full rounded-t-sm bg-strong' : 'w-full rounded-t-sm bg-tint'}
                style={{ height: day.answers > 0 ? `${Math.max((day.answers / max) * 100, 6)}%` : '3px' }}
              />
              <span aria-hidden="true" className="text-xs text-muted">
                {shortDay.format(date)}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
