import { Mic, Play, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { speak, stopSpeaking } from '../practice/speech';
import { RECOGNITION_ERRORS } from '../speaking/recognition';
import type { SelfRecordProps } from './types';

const MAX_SECONDS = 8;

const messageFor = (error: unknown) => {
  const name = (error as { name?: string })?.name;
  if (name === 'NotAllowedError') return RECOGNITION_ERRORS['not-allowed'];
  if (name === 'NotFoundError') return RECOGNITION_ERRORS['audio-capture'];
  return 'The recording could not start. Check your microphone and try again.';
};

export const SelfRecord = ({ text }: SelfRecordProps) => {
  const [status, setStatus] = useState<'idle' | 'recording' | 'ready'>('idle');
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (recorder.current?.state === 'recording') recorder.current.stop();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const start = async () => {
    stopSpeaking();
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const created = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      created.ondataavailable = (event) => chunks.push(event.data);
      created.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = URL.createObjectURL(new Blob(chunks, { type: created.mimeType || 'audio/webm' }));
        setUrl(urlRef.current);
        setStatus('ready');
      };
      recorder.current = created;
      created.start();
      setStatus('recording');
      timer.current = setTimeout(() => created.state === 'recording' && created.stop(), MAX_SECONDS * 1000);
    } catch (failure) {
      setError(messageFor(failure));
      setStatus('idle');
    }
  };

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    if (recorder.current?.state === 'recording') recorder.current.stop();
  };

  const playMine = () => {
    if (url) void new Audio(url).play();
  };

  const playBoth = () => speak(text, { onEnd: playMine });

  return (
    <div className="flex max-w-prose flex-col items-center gap-2 text-center">
      <p className="text-sm text-muted">
        This browser cannot score speech. Record yourself and compare with the native voice instead. The recording stays on your device.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {status === 'recording' ? (
          <Button variant="secondary" onClick={stop}>
            <Square aria-hidden="true" className="size-4" strokeWidth={2} />
            Stop recording
          </Button>
        ) : (
          <Button variant="quiet" onClick={() => void start()}>
            <Mic aria-hidden="true" className="size-4" strokeWidth={2} />
            {status === 'ready' ? 'Record again' : 'Record yourself'}
          </Button>
        )}
        {status === 'ready' && (
          <>
            <Button variant="quiet" onClick={playMine}>
              <Play aria-hidden="true" className="size-4" strokeWidth={2} />
              Hear yourself
            </Button>
            <Button variant="quiet" onClick={playBoth}>
              <Play aria-hidden="true" className="size-4" strokeWidth={2} />
              Native, then you
            </Button>
          </>
        )}
      </div>
      <p role="status" className="min-h-5 text-sm text-muted">
        {status === 'recording' ? `Recording, up to ${MAX_SECONDS} seconds` : ''}
      </p>
      {error && <p className="text-sm text-bad-strong">{error}</p>}
    </div>
  );
};
