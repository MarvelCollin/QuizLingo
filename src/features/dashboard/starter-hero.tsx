import { ButtonLink } from '../../components/ui/button';
import { configToSearch } from '../practice/round-config';
import type { StarterHeroProps } from './types';

export const StarterHero = ({ next, isFresh }: StarterHeroProps) => (
  <section aria-labelledby="next-title" className="rounded-xl bg-surface px-6 py-8 sm:px-8">
    <h2 id="next-title" className="text-2xl font-bold text-ink">
      {isFresh ? 'New to Chinese? Start with the basics' : 'Keep going with the starter path'}
    </h2>
    <p className="mt-2 max-w-prose text-base text-muted">
      {isFresh
        ? 'Hear the four tones, learn the sounds of pinyin and write your first strokes. Short lessons, with a milestone at the end of each stage.'
        : `Up next: ${next?.lesson.title}. Each lesson takes a few minutes and you can stop after any of them.`}
    </p>
    <div className="mt-6 flex flex-wrap gap-3">
      <ButtonLink size="lg" to={isFresh || !next ? '/basics' : `/basics/${next.lesson.id}`}>
        {isFresh ? 'Start the starter path' : 'Continue'}
      </ButtonLink>
      <ButtonLink
        size="lg"
        variant="quiet"
        to={`/practice/round${configToSearch({ mode: 'flashcard', set: 'new', level: '1', size: '10' })}`}
      >
        I know the basics, learn HSK 1 words
      </ButtonLink>
    </div>
  </section>
);
