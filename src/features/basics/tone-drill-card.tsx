import { ButtonLink } from '../../components/ui/button';

export const ToneDrillCard = () => (
  <section
    aria-labelledby="tone-drill-title"
    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline px-5 py-4"
  >
    <div>
      <h2 id="tone-drill-title" className="text-base font-semibold text-ink">
        Tone drill
      </h2>
      <p className="text-sm text-muted">Hear a syllable and pick its tone mark, ˉ ˊ ˇ or ˋ. As many rounds as you like.</p>
    </div>
    <ButtonLink variant="secondary" to="/practice/tones?kind=basic">
      Start drilling
    </ButtonLink>
  </section>
);
