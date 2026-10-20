import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import type { ScriptViewProps } from './types';

const SPEAKER_LABEL = { 男: 'Man', 女: 'Woman', 旁白: 'Narrator' } as const;

export const ScriptView = ({ lines, player, focusLine, isPinyinShown, isEnglishShown }: ScriptViewProps) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    if (focusLine !== null) refs.current[focusLine]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [focusLine]);

  return (
    <ol className="flex flex-col gap-1">
      {lines.map((line, i) => {
        const isCurrent = player.isPlaying && player.current === i;
        const isFocused = focusLine === i;
        return (
          <li key={i}>
            <button
              ref={(node) => {
                refs.current[i] = node;
              }}
              type="button"
              onClick={() => player.playFrom(i)}
              aria-current={isCurrent ? 'true' : undefined}
              className={cn(
                'flex w-full cursor-pointer gap-3 rounded-md border-l-4 px-3 py-2 text-left transition-colors duration-150',
                isCurrent || isFocused ? 'border-strong bg-tint' : 'border-transparent hover:bg-surface',
              )}
            >
              <span className="w-16 shrink-0 pt-1 text-sm font-semibold text-strong">
                <span lang="zh-CN" className="font-hanzi">
                  {line.speaker}
                </span>{' '}
                <span className="sr-only">{SPEAKER_LABEL[line.speaker]}</span>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                {isPinyinShown && <span className="text-sm text-muted">{line.py}</span>}
                <span lang="zh-CN" className="font-hanzi text-xl text-ink">
                  {line.zh}
                </span>
                {isEnglishShown && <span className="text-sm text-muted">{line.en}</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};
