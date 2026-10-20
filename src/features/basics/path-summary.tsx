import { StackedBar } from '../../components/ui/stacked-bar';
import type { PathSummaryProps } from './types';

// Two numbers and one bar. The bar fills in when the page opens.
export const PathSummary = ({ stagesDone, stagesTotal, lessonsDone, lessonsTotal, percent }: PathSummaryProps) => (
  <section aria-label="Your progress on the starter path" className="flex flex-col gap-3">
    <div className="flex flex-wrap items-end gap-x-10 gap-y-2">
      <p>
        <span className="block text-sm text-muted">Milestones passed</span>
        <span className="text-xl font-bold text-ink">
          {stagesDone} of {stagesTotal}
        </span>
      </p>
      <p>
        <span className="block text-sm text-muted">Lessons done</span>
        <span className="text-xl font-bold text-ink">
          {lessonsDone} of {lessonsTotal}
        </span>
      </p>
      <p className="ml-auto text-xl font-bold text-strong">{percent}%</p>
    </div>
    <StackedBar
      label="Starter path"
      total={lessonsTotal}
      className="h-2"
      segments={[
        {
          label: 'lessons done',
          value: lessonsDone,
          className: 'origin-left bg-strong [animation:bar-grow_0.8s_var(--ease-out)_both]',
        },
      ]}
    />
  </section>
);
