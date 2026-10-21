import { TriangleAlert } from 'lucide-react';
import { Link } from 'react-router';

export const GuestBanner = () => (
  <div role="note" aria-label="Guest mode" className="border-b border-accent-soft bg-accent-tint">
    <div className="mx-auto flex max-w-5xl items-start gap-3 px-4 py-2.5 text-sm text-ink">
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-strong" strokeWidth={2} />
      <p>
        <span className="font-semibold">You are trying QuizLingo as a guest.</span> Your progress is saved only in this
        browser. It is lost if you clear site data, use a private window or switch devices, and it does not move to an
        account later.{' '}
        <Link to="/register" className="font-semibold text-strong underline underline-offset-2">
          Create a free account
        </Link>{' '}
        to keep it.
      </p>
    </div>
  </div>
);
