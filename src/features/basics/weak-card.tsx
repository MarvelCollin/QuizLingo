import { ButtonLink } from '../../components/ui/button';
import { plural } from '../../lib/format';
import type { WeakCardProps } from './types';

export const WeakCard = ({ count }: WeakCardProps) => (
  <section
    aria-labelledby="weak-title"
    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline px-5 py-4"
  >
    <div>
      <h2 id="weak-title" className="text-base font-semibold text-ink">
        Weak spots
      </h2>
      <p className="text-sm text-muted">
        {plural(count, 'question')} you missed. Get each one right twice in a row to clear it.
      </p>
    </div>
    <ButtonLink variant="secondary" to="/basics/weak">
      Practice them
    </ButtonLink>
  </section>
);
