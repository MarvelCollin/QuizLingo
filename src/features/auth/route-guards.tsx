import { Navigate, useLocation } from 'react-router';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { Skeleton } from '../../components/ui/skeleton';
import { useSession } from './use-session';
import type { GuardProps } from './types';

const SessionSkeleton = () => (
  <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10" aria-busy="true" aria-label="Loading your account">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);

// Screens behind sign in. Visitors without a session go to /login and come back afterwards.
export const RequireSignIn = ({ children }: GuardProps) => {
  const session = useSession();
  const location = useLocation();

  if (session.isPending) return <SessionSkeleton />;
  if (session.isError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <InlineMessage
          tone="error"
          action={
            <Button variant="secondary" onClick={() => session.refetch()}>
              Try again
            </Button>
          }
        >
          {session.error.message}
        </InlineMessage>
      </div>
    );
  }
  if (!session.data) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
};

// Sign in and sign up pages send people who are already signed in to their dashboard
export const RedirectIfSignedIn = ({ children }: GuardProps) => {
  const session = useSession();
  if (session.data) return <Navigate to="/" replace />;
  return children;
};
