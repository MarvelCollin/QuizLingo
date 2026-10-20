import { Mic, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import {
  compareSpeech,
  createRecognizer,
  isRecognitionSupported,
  isRecorderSupported,
  PASS_SCORE,
  PERMANENT_ERRORS,
  RECOGNITION_ERRORS,
} from '../speaking/recognition';
import { useBrave } from '../speaking/use-brave';
import type { Recognizer } from '../speaking/types';
import { stopSpeaking } from '../practice/speech';
import { SelfRecord } from './self-record';
import type { SayItProps } from './types';

export const SayIt = ({ text }: SayItProps) => {
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof compareSpeech> | null>(null);
  const [error, setError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const isBrave = useBrave();
  const recognizer = useRef<Recognizer | null>(null);

  useEffect(() => () => recognizer.current?.abort(), []);
  if (!isRecognitionSupported() || isBrave || isBlocked) return isRecorderSupported() ? <SelfRecord text={text} /> : null;

  const start = () => {
    stopSpeaking();
    const created = createRecognizer();
    if (!created) return;
    recognizer.current = created;
    setResult(null);
    setError('');
    let latest = '';
    created.onresult = (event) => {
      latest = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
    };
    created.onerror = (event) => {
      if (PERMANENT_ERRORS.has(event.error)) setIsBlocked(true);
      else setError(RECOGNITION_ERRORS[event.error] ?? 'Speech recognition stopped. Try again.');
    };
    created.onend = () => {
      setIsListening(false);
      if (latest) setResult(compareSpeech(text, latest));
    };
    setIsListening(true);
    created.start();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button variant="quiet" onClick={isListening ? () => recognizer.current?.stop() : start}>
        {isListening ? (
          <>
            <Square aria-hidden="true" className="size-4" strokeWidth={2} />
            Stop
          </>
        ) : (
          <>
            <Mic aria-hidden="true" className="size-4" strokeWidth={2} />
            {result ? 'Say it again' : 'Say it yourself'}
          </>
        )}
      </Button>
      {(isListening || result) && (
        <p className="text-base" role="status" aria-live="polite">
          {isListening ? (
            <span className="text-muted">Listening</span>
          ) : (
            result && (
              <span className={cn('font-semibold', result.score >= PASS_SCORE ? 'text-ok-strong' : 'text-bad-strong')}>
                {result.score}% match{result.score >= PASS_SCORE ? ', well said' : '. Try once more.'}
              </span>
            )
          )}
        </p>
      )}
      {result && !isListening && result.score < PASS_SCORE && (
        <p lang="zh-CN" className="font-hanzi text-xl">
          {result.marks.map((mark, i) => (
            <span key={i} className={cn(mark.isHeard ? 'text-ok-strong' : 'text-bad-strong underline decoration-2 underline-offset-4')}>
              {mark.char}
            </span>
          ))}
        </p>
      )}
      {error && <p className="max-w-prose text-sm text-bad-strong">{error}</p>}
    </div>
  );
};
