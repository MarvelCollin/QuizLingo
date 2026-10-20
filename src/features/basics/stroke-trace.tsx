import { RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { createWriter } from '../characters/writer';
import type { StrokeTraceProps } from './types';

const SIZE = 200;

// Draw the character over its faint outline. A wrong stroke is flagged, and a hint shows after a second miss.
export const StrokeTrace = ({ char }: StrokeTraceProps) => {
  const target = useRef<HTMLDivElement>(null);
  const [mistakes, setMistakes] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!target.current) return;
    target.current.innerHTML = '';
    const writer = createWriter(target.current, char, SIZE, {
      showCharacter: false,
      showOutline: true,
      showHintAfterMisses: 2,
    });
    void writer.quiz({ onComplete: ({ totalMistakes }) => setMistakes(totalMistakes) });
    return () => writer.cancelQuiz();
  }, [char, attempt]);

  const retry = () => {
    setMistakes(null);
    setAttempt((value) => value + 1);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={target}
        role="img"
        aria-label={`Drawing area for ${char}. Draw each stroke in order.`}
        className="touch-none rounded-xl border border-line/60 bg-bg"
        style={{ width: SIZE, height: SIZE }}
      />
      <p role="status" className="min-h-6 text-base font-semibold text-strong">
        {mistakes === null
          ? 'Draw the first stroke'
          : mistakes === 0
            ? 'Perfect, no slips'
            : `Done with ${mistakes} ${mistakes === 1 ? 'slip' : 'slips'}`}
      </p>
      <Button variant="secondary" onClick={retry}>
        <RotateCcw aria-hidden="true" className="size-4" strokeWidth={1.75} />
        {mistakes === null ? 'Start over' : 'Try again'}
      </Button>
    </div>
  );
};
