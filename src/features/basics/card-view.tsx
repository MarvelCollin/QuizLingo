import { Play, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { StrokePlayer } from '../characters/stroke-player';
import { KeyHint } from '../practice/key-hint';
import { playSyllable, speak } from '../practice/speech';
import { useKeyboard } from '../practice/use-keyboard';
import { SayIt } from './say-it';
import { StrokeTrace } from './stroke-trace';
import { hanziSize } from './hanzi-size';
import { ToneContour } from './tone-contour';
import type { CardViewProps } from './types';

const HAS_HANZI = /[一-鿿]/;

export const CardView = ({ card }: CardViewProps) => {
  const [playKey, setPlayKey] = useState(0);
  const [strokeMode, setStrokeMode] = useState<'watch' | 'try'>('watch');
  const hasSound = Boolean(card.sound || card.word);
  const isHanzi = HAS_HANZI.test(card.title);

  const play = () => {
    setPlayKey((key) => key + 1);
    if (card.sound) playSyllable(card.sound);
    else if (card.word) speak(card.word);
  };

  useKeyboard((key) => {
    if (key === ' ' && (hasSound || card.tones)) {
      play();
      return true;
    }
  });

  return (
    <section aria-label={card.title} className="flex flex-col items-center gap-5 rounded-xl bg-surface px-6 py-10 text-center">
      <p lang={isHanzi ? 'zh-CN' : undefined} className={isHanzi ? `font-hanzi ${hanziSize(card.title)} text-ink` : 'text-5xl font-bold text-ink'}>
        {card.title}
      </p>
      {card.subtitle && <p className="text-lg font-semibold text-strong">{card.subtitle}</p>}
      {card.tones && <ToneContour tones={card.tones} playKey={playKey} />}
      {card.strokeChar && (
        <>
          <SegmentedControl
            label="Stroke order"
            value={strokeMode}
            onChange={setStrokeMode}
            options={[
              { value: 'watch', label: 'Watch it' },
              { value: 'try', label: 'Try it' },
            ]}
          />
          {strokeMode === 'watch' ? <StrokePlayer char={card.strokeChar} size={200} /> : <StrokeTrace char={card.strokeChar} />}
        </>
      )}
      {card.note && <p className="max-w-prose text-base text-ink">{card.note}</p>}
      {isHanzi && card.word && <SayIt text={card.word} />}
      {hasSound ? (
        <button
          type="button"
          onClick={play}
          className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border border-line/60 bg-bg px-6 text-lg font-semibold text-ink transition-colors duration-150 hover:bg-tint active:bg-soft"
        >
          <Volume2 aria-hidden="true" className="size-5" strokeWidth={1.75} />
          Listen <KeyHint>Space</KeyHint>
        </button>
      ) : (
        card.tones && (
          <button
            type="button"
            onClick={play}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-4 text-base font-semibold text-strong transition-colors duration-150 hover:bg-tint"
          >
            <Play aria-hidden="true" className="size-4" strokeWidth={1.75} />
            Draw it again <KeyHint>Space</KeyHint>
          </button>
        )
      )}
    </section>
  );
};
