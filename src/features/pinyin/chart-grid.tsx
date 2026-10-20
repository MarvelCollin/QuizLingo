import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { markTone } from '../vocabulary/pinyin';
import type { ChartGridProps } from './types';

const cornerClass = 'sticky top-0 left-0 z-30 border-r border-b border-hairline bg-bg px-3 py-2 text-left text-sm font-semibold text-muted';

export const ChartGrid = ({ chart, tone, found, playing, onPlay }: ChartGridProps) => {
  const foundRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current?.getBoundingClientRect();
    const cell = foundRef.current?.getBoundingClientRect();
    if (!box || !cell) return;
    boxRef.current?.scrollBy({
      left: cell.left - box.left - box.width / 2 + cell.width / 2,
      top: cell.top - box.top - box.height / 2 + cell.height / 2,
    });
  }, [found]);

  return (
    <div
      ref={boxRef}
      role="region"
      aria-label="Pinyin chart, scrolls sideways and down"
      tabIndex={0}
      className="max-h-[70dvh] overflow-auto rounded-lg border border-hairline"
    >
      <table className="border-separate border-spacing-0 text-center">
        <caption className="sr-only">Pinyin syllables by initial and final. Press a syllable to hear it.</caption>
        <thead>
          <tr>
            <th scope="col" className={cornerClass}>
              Initial
            </th>
            {chart.finals.map((final) => (
              <th key={final} scope="col" className="sticky top-0 z-20 border-b border-hairline bg-bg px-1 py-2 text-base font-semibold text-ink">
                {final}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.initials.map((initial) => (
            <tr key={initial || 'none'}>
              <th
                scope="row"
                className="sticky left-0 z-10 border-r border-hairline bg-bg px-3 py-1 text-left text-base font-semibold text-ink"
              >
                {initial || <span className="text-sm font-medium text-muted">none</span>}
              </th>
              {chart.finals.map((final) => {
                const base = chart.cells.get(`${initial}|${final}`);
                const isAvailable = base !== undefined && chart.tones.get(base)?.has(tone);
                if (!base || !isAvailable) return <td key={final} className="min-w-14" />;
                const isFound = found === base;
                const isPlaying = playing === base;
                return (
                  <td key={final} className="min-w-14 p-0.5">
                    <button
                      ref={isFound ? foundRef : undefined}
                      type="button"
                      onClick={() => onPlay(base)}
                      aria-label={`Play ${markTone(base, tone)}`}
                      className={cn(
                        'min-h-11 w-full cursor-pointer rounded-md px-1 text-base text-ink transition duration-150 hover:bg-tint active:scale-95 active:bg-soft',
                        isPlaying && 'bg-tint font-semibold',
                        isFound && 'bg-accent-tint ring-2 ring-accent-strong',
                      )}
                    >
                      {markTone(base, tone)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
