import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { useResetPath } from './use-basics';

export const ResetPath = () => {
  const [isAsking, setIsAsking] = useState(false);
  const reset = useResetPath();

  if (!isAsking) {
    return (
      <div className="border-t border-hairline pt-4">
        <Button variant="quiet" onClick={() => setIsAsking(true)}>
          Start the path over
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-hairline pt-4" role="group" aria-label="Start the path over">
      <p className="max-w-prose text-base text-ink">
        This clears your score on every lesson and milestone and closes the stages again. Your word reviews and practice history stay.
      </p>
      {reset.isError && <InlineMessage tone="error">{reset.error.message}</InlineMessage>}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="danger"
          isLoading={reset.isPending}
          loadingText="Clearing"
          onClick={() => reset.mutate(undefined, { onSuccess: () => setIsAsking(false) })}
        >
          Clear my path
        </Button>
        <Button variant="secondary" onClick={() => setIsAsking(false)} disabled={reset.isPending}>
          Keep my progress
        </Button>
      </div>
    </div>
  );
};
