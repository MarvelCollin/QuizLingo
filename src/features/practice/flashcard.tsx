import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { KeyHint } from './key-hint';
import { ListenButton } from './listen-button';
import { useKeyboard } from './use-keyboard';
import { WordReveal } from './word-reveal';
import type { FlashcardProps } from './types';

export const Flashcard = ({ word, onGrade }: FlashcardProps) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useKeyboard((key) => {
    if (!isRevealed && (key === ' ' || key === 'Enter')) {
      setIsRevealed(true);
      return true;
    }
    if (isRevealed && key === '1') onGrade(false);
    if (isRevealed && (key === '2' || key === 'Enter')) onGrade(true);
    return isRevealed;
  });

  return (
    <section aria-label="Flashcard" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-surface px-6 py-12 text-center">
        <p lang="zh-CN" className="font-hanzi text-[clamp(4rem,14vw,7rem)] leading-tight text-ink">
          {word.hanzi}
        </p>
        <ListenButton text={word.hanzi} />
        {isRevealed && (
          <div className="mt-4 w-full max-w-md border-t border-hairline pt-6 text-left">
            <WordReveal word={word} />
          </div>
        )}
      </div>

      {isRevealed ? (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" size="lg" onClick={() => onGrade(false)}>
            Still learning <KeyHint>1</KeyHint>
          </Button>
          <Button size="lg" onClick={() => onGrade(true)}>
            I knew it <KeyHint>2</KeyHint>
          </Button>
        </div>
      ) : (
        <Button size="lg" onClick={() => setIsRevealed(true)}>
          Show answer <KeyHint>Space</KeyHint>
        </Button>
      )}
    </section>
  );
};
