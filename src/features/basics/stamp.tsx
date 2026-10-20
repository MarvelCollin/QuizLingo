import type { StampProps } from './types';

const PIECES = 14;
const TONES = ['bg-bad-strong', 'bg-accent-strong', 'bg-primary', 'bg-ok-strong'];

// Small pieces fly out from the stamp for a moment. They are decoration, so they are hidden from screen readers.
const Burst = () => (
  <span aria-hidden="true" className="pointer-events-none absolute inset-0">
    {Array.from({ length: PIECES }, (_, i) => {
      const angle = (i / PIECES) * Math.PI * 2;
      const reach = 82 + (i % 3) * 16;
      return (
        <span
          key={i}
          className={`absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${TONES[i % TONES.length]} [animation:burst_0.9s_var(--ease-out)_0.35s_both]`}
          style={{ '--dx': `${Math.round(Math.cos(angle) * reach)}px`, '--dy': `${Math.round(Math.sin(angle) * reach)}px` } as React.CSSProperties}
        />
      );
    })}
  </span>
);

// A red seal style stamp that presses onto the page when a lesson or milestone is passed
export const Stamp = ({ kind }: StampProps) => {
  const isMilestone = kind === 'milestone';
  return (
    <div className="relative shrink-0">
      {isMilestone && <Burst />}
      <div
        role="img"
        aria-label={isMilestone ? 'Milestone stamp' : 'Lesson stamp'}
        className="flex size-28 items-center justify-center rounded-full border-4 border-double border-bad-strong text-bad-strong [animation:stamp-in_0.55s_var(--ease-out)_both]"
      >
        <span lang="zh-CN" className="font-hanzi text-4xl font-bold">
          {isMilestone ? '合格' : '好'}
        </span>
      </div>
    </div>
  );
};
