import { Mic, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { cn } from '../../lib/utils';
import { KeyHint } from '../practice/key-hint';
import { ListenButton } from '../practice/listen-button';
import { stopSpeaking } from '../practice/speech';
import { useKeyboard } from '../practice/use-keyboard';
import { compareSpeech, createRecognizer, PASS_SCORE } from './recognition';
import type { Recognizer, SpeakingTaskProps } from './types';

const ERRORS: Record<string, string> = {
  'not-allowed': 'The microphone is blocked. Allow it in the browser address bar, then try again.',
  'no-speech': 'Nothing was heard. Try again a little closer to the microphone.',
  network: 'The speech service could not be reached. Check your connection.',
};

export const SpeakingTask = ({ sentence, onAnswer, onNext }: SpeakingTaskProps) => {
  const [isListening, setIsListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const attemptsRef = useRef(0);
  const [result, setResult] = useState<ReturnType<typeof compareSpeech> | null>(null);
  const recognizer = useRef<Recognizer | null>(null);
  const answerRef = useRef(onAnswer);
  const hasAnswered = useRef(false);
  useEffect(() => {
    answerRef.current = onAnswer;
  });
  useEffect(() => () => recognizer.current?.abort(), []);

  const finish = (text: string) => {
    const scored = compareSpeech(sentence.text, text);
    setResult(scored);
    attemptsRef.current += 1;
    setAttempts(attemptsRef.current);
    if (!hasAnswered.current && (scored.score >= PASS_SCORE || attemptsRef.current >= 3)) {
      hasAnswered.current = true;
      setIsDone(true);
      answerRef.current(scored.score >= PASS_SCORE);
    }
  };

  const start = () => {
    stopSpeaking();
    const created = createRecognizer();
    if (!created) return;
    recognizer.current = created;
    setHeard('');
    setError('');
    setResult(null);
    let latest = '';
    created.onresult = (event) => {
      latest = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setHeard(latest);
    };
    created.onerror = (event) => setError(ERRORS[event.error] ?? 'Speech recognition stopped. Try again.');
    created.onend = () => {
      setIsListening(false);
      if (latest) finish(latest);
    };
    setIsListening(true);
    created.start();
  };

  useKeyboard((key) => {
    if (isDone && key === 'Enter') {
      onNext();
      return true;
    }
  });

  return (
    <section aria-label="Speaking task" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-surface px-6 py-8 text-center">
        <h2 className="text-base font-medium text-muted">Read this sentence aloud</h2>
        <p lang="zh-CN" className="font-hanzi text-3xl text-ink">
          {result
            ? result.marks.map((mark, i) => (
                <span key={i} className={cn(mark.isHeard ? 'text-ok-strong' : 'text-bad-strong underline decoration-2 underline-offset-4')}>
                  {mark.char}
                </span>
              ))
            : sentence.text}
        </p>
        <p className="text-base text-muted">{sentence.pinyin.filter(Boolean).join(' ')}</p>
        <p className="text-base text-ink">{sentence.english}</p>
        <ListenButton text={sentence.text} label="Hear it first" />
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button size="lg" onClick={isListening ? () => recognizer.current?.stop() : start}>
          {isListening ? (
            <>
              <Square aria-hidden="true" className="size-5" strokeWidth={2} />
              Stop
            </>
          ) : (
            <>
              <Mic aria-hidden="true" className="size-5" strokeWidth={2} />
              {attempts === 0 ? 'Start speaking' : 'Try again'}
            </>
          )}
        </Button>
        <p className="min-h-6 text-base text-muted" aria-live="polite">
          {isListening ? 'Listening' : ''}
          {heard && (
            <>
              {isListening ? ': ' : 'Heard: '}
              <span lang="zh-CN" className="font-hanzi text-ink">
                {heard}
              </span>
            </>
          )}
        </p>
        {result && (
          <p role="status" className={cn('text-lg font-semibold', result.score >= PASS_SCORE ? 'text-ok-strong' : 'text-bad-strong')}>
            {result.score}% match{result.score >= PASS_SCORE ? ', well said' : '. Red characters were not heard.'}
          </p>
        )}
      </div>

      {error && <InlineMessage tone="error">{error}</InlineMessage>}

      {isDone && (
        <Button size="lg" onClick={onNext}>
          Next <KeyHint>Enter</KeyHint>
        </Button>
      )}
    </section>
  );
};
