import { Play } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { isWordToken } from '../study/api';
import { SpeakToken } from '../study/speak-token';
import { splitWords } from '../study/split-words';
import type { ScriptViewProps } from './types';

const SPEAKER_LABEL = { 男: 'Man', 女: 'Woman', 旁白: 'Narrator' } as const;

export const ScriptView = ({ lines, player, focusLine, isPinyinShown, isEnglishShown, dictionary }: ScriptViewProps) => {
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
          <li
            key={i}
            className={cn(
              'flex gap-3 rounded-md border-l-4 px-3 py-2 transition-colors duration-150',
              isCurrent || isFocused ? 'border-strong bg-tint' : 'border-transparent hover:bg-surface',
            )}
          >
            <button
              ref={(node) => {
                refs.current[i] = node;
              }}
              type="button"
              onClick={() => player.playFrom(i)}
              aria-current={isCurrent ? 'true' : undefined}
              aria-label={`Play from line ${i + 1}, ${SPEAKER_LABEL[line.speaker]}: ${line.zh}`}
              className="flex min-h-11 w-16 shrink-0 cursor-pointer items-start gap-1 rounded-md pt-1 text-sm font-semibold text-strong hover:bg-soft"
            >
              <Play aria-hidden="true" className="mt-0.5 size-4" strokeWidth={2} />
              <span lang="zh-CN" className="font-hanzi">
                {line.speaker}
              </span>
            </button>
            <span className="flex min-w-0 flex-col gap-0.5">
              {isPinyinShown && <span className="text-sm text-muted">{line.py}</span>}
              <span lang="zh-CN" className="font-hanzi text-xl text-ink">
                {splitWords(line.zh, dictionary).map((token, t) =>
                  isWordToken(token) ? <SpeakToken key={t} token={token} /> : <span key={t}>{token}</span>,
                )}
              </span>
              {isEnglishShown && <span className="text-sm text-muted">{line.en}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
};
