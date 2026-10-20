import { ButtonLink } from '../../components/ui/button';
import type { StarterStripProps } from './types';

// A slim reminder that the starter path is still going, shown under the main next step
export const StarterStrip = ({ next, stagesDone, stagesTotal }: StarterStripProps) => (
  <section
    aria-labelledby="starter-title"
    className="flex flex-wrap items-center justify-between gap-3 border-y border-hairline py-4"
  >
    <div>
      <h2 id="starter-title" className="text-base font-semibold text-ink">
        Starter path
      </h2>
      <p className="text-sm text-muted">
        {stagesDone} of {stagesTotal} milestones passed. Up next: {next.lesson.title}.
      </p>
    </div>
    <ButtonLink variant="secondary" to={`/basics/${next.lesson.id}`}>
      Continue
    </ButtonLink>
  </section>
);
