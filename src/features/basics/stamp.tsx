import type { StampProps } from './types';

// A red seal style stamp that presses onto the page when a lesson or milestone is passed
export const Stamp = ({ kind }: StampProps) => {
  const isMilestone = kind === 'milestone';
  return (
    <div
      role="img"
      aria-label={isMilestone ? 'Milestone stamp' : 'Lesson stamp'}
      className="flex size-28 shrink-0 items-center justify-center rounded-full border-4 border-double border-bad-strong text-bad-strong [animation:stamp-in_0.55s_var(--ease-out)_both]"
    >
      <span lang="zh-CN" className="font-hanzi text-4xl font-bold">
        {isMilestone ? '合格' : '好'}
      </span>
    </div>
  );
};
