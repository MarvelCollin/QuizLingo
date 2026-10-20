import { X } from 'lucide-react';
import { Link } from 'react-router';
import { Button, ButtonLink } from '../../components/ui/button';
import { StackedBar } from '../../components/ui/stacked-bar';
import type { ToolHeaderProps, ToolSummaryProps } from './types';

export const ToolHeader = ({ label, index, total, correct, answered, backTo }: ToolHeaderProps) => (
  <div className="flex items-center gap-4">
    <Link
      to={backTo}
      className="-ml-3 inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-strong hover:bg-tint"
    >
      <X aria-hidden="true" className="size-4" strokeWidth={2} />
      End round
    </Link>
    <div className="flex-1">
      <div className="flex justify-between text-sm text-muted">
        <span>{label}</span>
        <span aria-live="polite">
          {Math.min(index + 1, total)} of {total}
        </span>
      </div>
      <StackedBar
        label="Round progress"
        total={total}
        className="mt-1.5 h-1.5"
        segments={[
          { label: 'right', value: correct, className: 'bg-strong' },
          { label: 'missed', value: answered - correct, className: 'bg-accent-strong' },
        ]}
      />
    </div>
  </div>
);

export const ToolSummary = ({
  title,
  correct,
  total,
  missed,
  isSaving,
  onRestart,
  backTo,
  backLabel,
}: ToolSummaryProps) => (
  <section aria-labelledby="tool-summary-title" className="mx-auto flex max-w-2xl flex-col gap-8">
    <div>
      <h1 id="tool-summary-title" className="text-2xl font-bold text-ink">
        {title}
      </h1>
      <p className="mt-3 text-3xl font-bold text-strong">
        {correct} of {total} right
      </p>
      <p className="mt-1 text-base text-muted" role="status">
        {isSaving ? 'Saving your round' : 'Saved to your activity.'}
      </p>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button size="lg" onClick={onRestart}>
        Start a new round
      </Button>
      <ButtonLink to={backTo} size="lg" variant="secondary">
        {backLabel}
      </ButtonLink>
    </div>
    {missed.length > 0 && (
      <div>
        <h2 className="text-lg font-semibold text-ink">To look at again</h2>
        <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
          {missed.map((item) => (
            <li key={item.key} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
              <span lang="zh-CN" className="font-hanzi text-2xl text-ink">
                {item.main}
              </span>
              <span className="text-muted">{item.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </section>
);
