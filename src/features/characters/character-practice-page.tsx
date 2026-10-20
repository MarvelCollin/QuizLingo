import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { Skeleton } from '../../components/ui/skeleton';
import { shuffle } from '../../lib/random';
import { usePageMeta } from '../../lib/use-page-meta';
import { ToolHeader, ToolSummary } from '../practice/tool-round-parts';
import { useToolRound } from '../practice/use-tool-round';
import type { Hanzi } from '../study/types';
import { useHanzi } from '../study/use-study-data';
import { LEVELS, levelLabel } from '../vocabulary/constants';
import type { HskLevel } from '../vocabulary/types';
import { CharacterQuiz } from './character-quiz';
import { WritingTask } from './writing-task';
import type { CharacterPracticePageProps, CharacterQuestion, CharacterRoundViewProps } from './types';

const ROUND = 10;

const buildQuestion = (hanzi: Hanzi, pool: Hanzi[]): CharacterQuestion => {
  const label = (h: Hanzi) => `${h.pinyin}, ${h.meanings.slice(0, 2).join(', ')}`;
  const others = shuffle(pool.filter((h) => h.char !== hanzi.char && h.pinyin !== hanzi.pinyin)).slice(0, 3);
  return {
    hanzi,
    options: shuffle([{ label: label(hanzi), isCorrect: true }, ...others.map((h) => ({ label: label(h), isCorrect: false }))]),
  };
};

const RoundView = ({ kind, items, pool, level, onRestart }: CharacterRoundViewProps) => {
  const round = useToolRound(items, kind === 'quiz' ? 'hanzi' : 'writing', level);
  const current = round.current;
  const question = useMemo(() => (current ? buildQuestion(current, pool) : null), [current, pool]);
  const label = `${kind === 'quiz' ? 'Character quiz' : 'Writing'}, ${levelLabel(level)}`;

  if (round.isDone || !round.current || !question) {
    return (
      <ToolSummary
        title="Round complete"
        correct={round.correct}
        total={round.total}
        missed={round.missed.map((h) => ({ key: h.char, main: h.char, detail: `${h.pinyin}, ${h.meanings.slice(0, 2).join(', ')}` }))}
        isSaving={round.isSaving}
        onRestart={onRestart}
        backTo="/characters"
        backLabel="Back to characters"
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="sr-only">{label}</h1>
      <ToolHeader label={label} index={round.index} total={round.total} correct={round.correct} answered={round.results.length} backTo="/characters" />
      {kind === 'quiz' ? (
        <CharacterQuiz key={round.index} question={question} onAnswer={round.answer} onNext={round.next} />
      ) : (
        <WritingTask key={round.index} hanzi={round.current} onAnswer={round.answer} onNext={round.next} />
      )}
    </div>
  );
};

const CharacterPracticePage = ({ kind }: CharacterPracticePageProps) => {
  const isWriting = kind === 'writing';
  usePageMeta(
    isWriting ? 'Writing practice' : 'Character quiz',
    isWriting ? 'Write HSK 3.0 characters stroke by stroke, with hints when you get stuck.' : 'Recognise HSK 3.0 characters by their pinyin and meaning.',
  );
  const hanzi = useHanzi();
  const [params, setParams] = useSearchParams();
  const levels = isWriting ? LEVELS.filter((l) => l >= 2) : LEVELS;
  const requested = Number(params.get('level')) as HskLevel;
  const level = levels.includes(requested) ? requested : levels[0];
  const [round, setRound] = useState<{ id: number; items: Hanzi[] } | null>(null);

  const pool = (hanzi.data ?? []).filter((h) => (isWriting ? h.writeLevel === level : h.level === level));

  if (hanzi.isPending) return <Skeleton className="mx-auto h-72 w-full max-w-2xl" />;
  if (hanzi.isError) return <InlineMessage tone="error">{hanzi.error.message}</InlineMessage>;

  if (round) {
    return (
      <RoundView
        key={round.id}
        kind={kind}
        items={round.items}
        pool={pool.length >= 8 ? pool : hanzi.data}
        level={level}
        onRestart={() => setRound({ id: round.id + 1, items: shuffle(pool).slice(0, ROUND) })}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">{isWriting ? 'Writing practice' : 'Character quiz'}</h1>
        <p className="mt-1 text-base text-muted">
          {isWriting
            ? 'You see the pinyin and meaning, then draw the character. After two wrong strokes the next stroke is shown. Three mistakes or fewer counts as right.'
            : 'You see a character and pick its pinyin and meaning.'}
        </p>
      </div>
      <SegmentedControl
        label="Level"
        value={String(level)}
        onChange={(value) => setParams({ level: value }, { replace: true })}
        isWrapped
        options={levels.map((l) => ({
          value: String(l),
          label: levelLabel(l),
          detail: `${(hanzi.data ?? []).filter((h) => (isWriting ? h.writeLevel === l : h.level === l)).length} characters`,
        }))}
      />
      <div className="flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base text-ink">
          {Math.min(ROUND, pool.length)} characters from {levelLabel(level)}.
        </p>
        <Button size="lg" onClick={() => setRound({ id: 0, items: shuffle(pool).slice(0, ROUND) })}>
          Start round
        </Button>
      </div>
    </div>
  );
};

export const CharacterQuizPage = () => <CharacterPracticePage kind="quiz" />;
export const WritingPracticePage = () => <CharacterPracticePage kind="writing" />;
