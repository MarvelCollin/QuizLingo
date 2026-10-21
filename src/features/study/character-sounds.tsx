import { Volume2 } from 'lucide-react';
import { sayCharacter } from '../practice/speech';
import type { CharacterSoundsProps } from './types';
import { useHanzi } from './use-study-data';

export const CharacterSounds = ({ text }: CharacterSoundsProps) => {
  const hanzi = useHanzi();
  const byChar = new Map((hanzi.data ?? []).map((h) => [h.char, h]));
  const chars = [...new Set(text)].filter((char) => byChar.has(char));
  if (chars.length < 2) return null;
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm text-muted">Each character</dt>
      <dd className="flex flex-wrap gap-2">
        {chars.map((char) => {
          const info = byChar.get(char)!;
          return (
            <button
              key={char}
              type="button"
              onClick={() => sayCharacter(char, info.numeric)}
              aria-label={`Listen to ${char}, ${info.pinyin}`}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-hairline px-3 transition-colors duration-150 hover:bg-tint"
            >
              <span lang="zh-CN" className="font-hanzi text-xl text-ink">
                {char}
              </span>
              <span className="text-sm font-semibold text-strong">{info.pinyin}</span>
              <Volume2 aria-hidden="true" className="size-4 text-muted" strokeWidth={1.75} />
            </button>
          );
        })}
      </dd>
    </div>
  );
};
