import { Play } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { createWriter } from './writer';
import type { StrokePlayerProps } from './types';

export const StrokePlayer = ({ char, size = 200 }: StrokePlayerProps) => {
  const target = useRef<HTMLDivElement>(null);
  const writer = useRef<ReturnType<typeof createWriter> | null>(null);

  useEffect(() => {
    if (!target.current) return;
    target.current.innerHTML = '';
    const created = createWriter(target.current, char, size, {
      showOutline: true,
      onLoadCharDataSuccess: () => {
        requestAnimationFrame(() => void created.animateCharacter());
      },
    });
    writer.current = created;
    return () => {
      void created.pauseAnimation();
      if (writer.current === created) writer.current = null;
    };
  }, [char, size]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={target}
        role="img"
        aria-label={`Stroke order of ${char}`}
        className="rounded-xl border border-hairline bg-bg"
        style={{ width: size, height: size }}
      />
      <Button variant="secondary" onClick={() => void writer.current?.animateCharacter()}>
        <Play aria-hidden="true" className="size-4" strokeWidth={1.75} />
        Play stroke order
      </Button>
    </div>
  );
};
