import { cn } from '../../lib/utils';
import { ListenButton } from '../practice/listen-button';
import { isWordToken } from './api';
import { SpeakToken } from './speak-token';
import type { SentenceViewProps, SourceNoteProps } from './types';

export const SentenceView = ({
  sentence,
  highlight,
  isPinyinShown = true,
  isEnglishShown = true,
  size = 'md',
}: SentenceViewProps) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-start gap-2">
      <p lang="zh-CN" className={cn('flex flex-wrap items-end gap-x-1 font-hanzi text-ink', size === 'lg' ? 'text-3xl' : 'text-xl')}>
        {sentence.tokens.map((token, index) => (
          isWordToken(token) ? (
            <SpeakToken key={index} token={token}>
              <ruby className={cn(token === highlight && 'font-semibold text-strong underline decoration-2 underline-offset-[6px]')}>
                {token}
                {isPinyinShown && <rt className="pb-0.5 font-sans text-xs font-medium text-muted">{sentence.pinyin[index]}</rt>}
              </ruby>
            </SpeakToken>
          ) : (
            <span key={index}>{token}</span>
          )
        ))}
      </p>
      <ListenButton text={sentence.text} label="" className="shrink-0 px-2" />
    </div>
    {isEnglishShown && <p className="text-base text-muted">{sentence.english}</p>}
  </div>
);

export const SourceNote = ({ sentence }: SourceNoteProps) => (
  <a
    href={`https://tatoeba.org/en/sentences/show/${sentence.id}`}
    target="_blank"
    rel="noreferrer"
    className="text-xs text-muted underline underline-offset-2 hover:text-ink"
  >
    Tatoeba #{sentence.id}
  </a>
);
