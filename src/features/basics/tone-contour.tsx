import { useSyncExternalStore } from 'react';
import { cn } from '../../lib/utils';
import { TONE_NAMES } from './constants';
import { contourOf } from './contour';
import type { ToneContourProps } from './types';

const REDUCED = '(prefers-reduced-motion: reduce)';

const subscribe = (notify: () => void) => {
  const query = window.matchMedia(REDUCED);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};

const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );

const DRAW_SECONDS = 0.9;

// The pitch line of a tone, drawn as you hear it. Changing playKey draws it again.
export const ToneContour = ({ tones, playKey = 0, className }: ToneContourProps) => {
  const contour = contourOf(tones);
  const isReduced = usePrefersReducedMotion();
  const seconds = isReduced ? 0.01 : DRAW_SECONDS;
  const description = `Pitch line: ${tones.map((tone) => TONE_NAMES[tone].toLowerCase()).join(', then ')}`;

  return (
    <svg
      key={playKey}
      viewBox={`0 0 ${contour.width} ${contour.height}`}
      role="img"
      aria-label={description}
      className={cn('w-full max-w-sm', className)}
    >
      {[0, 2, 4].map((position) => (
        <line
          key={position}
          x1={30}
          x2={contour.width}
          y1={contour.guides[position]}
          y2={contour.guides[position]}
          className="stroke-hairline"
          strokeWidth={1}
          strokeDasharray="2 6"
          opacity={0.6}
        />
      ))}
      <text x={0} y={contour.guides[4] + 3} className="fill-muted" fontSize={9}>
        low
      </text>
      <text x={0} y={contour.guides[0] + 3} className="fill-muted" fontSize={9}>
        high
      </text>
      {contour.segments.map((segment, index) => {
        const delay = isReduced ? 0 : index * (DRAW_SECONDS + 0.15);
        return (
          <g key={index}>
            <path
              d={segment.d}
              pathLength={1}
              fill="none"
              className={segment.isNeutral ? 'stroke-line' : 'stroke-strong'}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1"
              style={{ animation: `contour-draw ${seconds}s var(--ease-out) ${delay}s both` }}
            />
            <circle r={6.5} className="fill-primary" opacity={0}>
              <set attributeName="opacity" to="1" begin={`${delay}s`} fill="freeze" />
              <animateMotion dur={`${seconds}s`} begin={`${delay}s`} path={segment.d} fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.2 0.7 0.2 1" />
            </circle>
          </g>
        );
      })}
    </svg>
  );
};
