import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from '../../src/components/ui/segmented-control';
import { CharacterQuiz } from '../../src/features/characters/character-quiz';
import { ChoiceOption } from '../../src/features/practice/choice-option';
import { ToolHeader, ToolSummary } from '../../src/features/practice/tool-round-parts';
import { useRound } from '../../src/features/practice/use-round';
import { useToolRound } from '../../src/features/practice/use-tool-round';
import { WordOrder } from '../../src/features/practice/word-order';
import { MockItemView } from '../../src/features/tests/mock-item-view';
import { Navigator } from '../../src/features/tests/navigator';
import { QuestionCard } from '../../src/features/tests/question-card';
import { ScriptView } from '../../src/features/tests/script-view';
import type { ScriptPlayer } from '../../src/features/tests/types';
import { sentence, word } from '../fixtures';
import { MemoryRouter } from 'react-router';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('ToolHeader', () => {
  it('ends the round when End round is pressed', async () => {
    const onEnd = vi.fn();
    render(<ToolHeader label="Single tones, HSK 1" index={0} total={15} correct={0} answered={0} onEnd={onEnd} />);
    await userEvent.click(screen.getByRole('button', { name: 'End round' }));
    expect(onEnd).toHaveBeenCalledOnce();
    expect(screen.getByText('1 of 15')).toBeInTheDocument();
  });

  it('shows the summary with missed items and restarts', async () => {
    const onRestart = vi.fn();
    render(
      <ToolSummary title="Round complete" correct={3} total={5} missed={[{ key: '好', main: '好', detail: 'hǎo, good' }]} isSaving={false} onRestart={onRestart} backTo="/practice" backLabel="Back" />,
      { wrapper },
    );
    expect(screen.getByText('3 of 5 right')).toBeInTheDocument();
    expect(screen.getByText('hǎo, good')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Start a new round' }));
    expect(onRestart).toHaveBeenCalledOnce();
  });
});

describe('WordOrder', () => {
  const question = {
    word: word('喜欢', 1, 'xǐhuan', 'to like'),
    sentence: sentence(1, ['我', '喜欢', '学习', '。'], 'I like studying.'),
    options: [],
    pieces: ['学习', '我', '喜欢'],
  };

  it('asks to place every word before checking', async () => {
    const onAnswer = vi.fn();
    render(<WordOrder question={question} onAnswer={onAnswer} onNext={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /Check/ }));
    expect(screen.getByText('Place every word before you check.')).toBeInTheDocument();
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it('accepts the right order', async () => {
    const onAnswer = vi.fn();
    render(<WordOrder question={question} onAnswer={onAnswer} onNext={vi.fn()} />);
    const bank = screen.getByLabelText('Words to place');
    for (const piece of ['我', '喜欢', '学习']) {
      const button = [...bank.querySelectorAll('button')].find((b) => b.textContent?.endsWith(piece) && b.textContent.length === piece.length + 1)!;
      await userEvent.click(button);
    }
    await userEvent.click(screen.getByRole('button', { name: /Check/ }));
    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByRole('status')).toHaveTextContent('Correct');
  });

  it('takes a placed word back when it is tapped', async () => {
    render(<WordOrder question={question} onAnswer={vi.fn()} onNext={vi.fn()} />);
    await userEvent.keyboard('1');
    const placed = screen.getByLabelText('Your sentence');
    expect(placed).toHaveTextContent('学习');
    await userEvent.click(placed.querySelector('button')!);
    expect(placed).not.toHaveTextContent('学习');
  });
});

describe('ChoiceOption', () => {
  it('labels the right answer and a wrong pick in words, not only color', () => {
    const { rerender } = render(
      <ChoiceOption option={{ label: 'good', isHanzi: false, isCorrect: true }} index={0} isAnswered isChosen={false} onChoose={vi.fn()} />,
    );
    expect(screen.getByText('Correct')).toBeInTheDocument();
    rerender(<ChoiceOption option={{ label: 'bad', isHanzi: false, isCorrect: false }} index={1} isAnswered isChosen onChoose={vi.fn()} />);
    expect(screen.getByText('Your answer')).toBeInTheDocument();
  });
});

describe('SegmentedControl', () => {
  it('moves the choice with arrow keys', async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        label="Level"
        value="1"
        onChange={onChange}
        options={[
          { value: '1', label: 'HSK 1' },
          { value: '2', label: 'HSK 2' },
        ]}
      />,
    );
    screen.getByRole('radio', { name: 'HSK 1' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('2');
  });
});

describe('CharacterQuiz', () => {
  it('reports the answer and shows the reading afterwards', async () => {
    const onAnswer = vi.fn();
    const hanzi = { char: '好', level: 1 as const, writeLevel: 2 as const, pinyin: 'hǎo', numeric: 'hao3', meanings: ['good'], words: ['好看'] };
    render(
      <CharacterQuiz
        question={{ hanzi, options: [{ label: 'hǎo, good', isCorrect: true }, { label: 'rén, person', isCorrect: false }] }}
        onAnswer={onAnswer}
        onNext={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByText('rén, person'));
    expect(onAnswer).toHaveBeenCalledWith(false);
    expect(screen.getByText('hǎo')).toBeInTheDocument();
  });
});

describe('listening test parts', () => {
  const question = { prompt: '他去哪儿？', promptPy: '', promptEn: 'Where is he going?', options: ['学校', '商店', '医院'], answer: 1, line: 2, explanation: 'Line 3 says 商店.' };

  it('lets you choose before review and locate the line after review', async () => {
    const onChoose = vi.fn();
    const onLocate = vi.fn();
    const { rerender } = render(<QuestionCard question={question} number={1} chosen={null} isReviewing={false} onChoose={onChoose} onLocate={onLocate} />);
    await userEvent.click(screen.getByRole('radio', { name: /商店/ }));
    expect(onChoose).toHaveBeenCalledWith(1);
    rerender(<QuestionCard question={question} number={1} chosen={0} isReviewing onChoose={onChoose} onLocate={onLocate} />);
    expect(screen.getByText('Not quite')).toBeInTheDocument();
    expect(screen.getByText('Line 3 says 商店.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Locate in audio, line 3/ }));
    expect(onLocate).toHaveBeenCalledOnce();
  });

  it('plays from the line you tap and highlights the line being played', async () => {
    const player: ScriptPlayer = {
      current: 1,
      isPlaying: true,
      failure: null,
      rate: 1,
      setRate: vi.fn(),
      playFrom: vi.fn(),
      playLine: vi.fn(),
      pause: vi.fn(),
      toggle: vi.fn(),
    };
    const lines = [
      { speaker: '男' as const, zh: '你好。', py: 'nǐ hǎo', en: 'Hello.' },
      { speaker: '女' as const, zh: '你去哪儿？', py: '', en: 'Where are you going?' },
    ];
    render(<ScriptView lines={lines} player={player} focusLine={null} isPinyinShown isEnglishShown />);
    expect(screen.getByRole('button', { name: /你去哪儿/ })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /你好/ }));
    expect(player.playFrom).toHaveBeenCalledWith(0);
  });
});

describe('mock test parts', () => {
  const choice = {
    kind: 'choice' as const,
    id: 'c1',
    instruction: 'Listen, then pick the sentence you heard.',
    prompt: '',
    promptEn: '',
    passage: [],
    audio: [{ speaker: '旁白' as const, zh: '我很好。', py: '', en: '' }],
    audioKey: 's-1',
    options: ['我很好。', '你很好。', '他很好。'],
    answer: 0,
    explanation: 'You heard: 我很好。',
    transcript: '我很好。',
  };

  it('stops playing once the plays are used up', () => {
    render(<MockItemView item={choice} number={1} answer={null} playsLeft={0} isReviewing={false} onAnswer={vi.fn()} onPlay={vi.fn()} />);
    expect(screen.getByRole('button', { name: /No plays left/ })).toBeDisabled();
  });

  it('records the chosen answer', async () => {
    const onAnswer = vi.fn();
    render(<MockItemView item={choice} number={1} answer={null} playsLeft={2} isReviewing={false} onAnswer={onAnswer} onPlay={vi.fn()} />);
    await userEvent.click(screen.getByRole('radio', { name: /你很好/ }));
    expect(onAnswer).toHaveBeenCalledWith(1);
  });

  it('colors the answer grid by answered and by right or wrong in review', () => {
    const items = [choice, { ...choice, id: 'c2' }];
    const { rerender } = render(<Navigator items={items} answers={[0, null]} current={0} isReviewing={false} onJump={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Question 1, answered' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Question 2, blank' })).toBeInTheDocument();
    rerender(<Navigator items={items} answers={[0, 2]} current={0} isReviewing onJump={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Question 1, answered, right' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Question 2, answered, wrong' })).toBeInTheDocument();
  });
});

describe('useToolRound', () => {
  it('counts answers and saves the round once at the end', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ session: {} }), { status: 201 }));
    const { result } = renderHook(() => useToolRound(['a', 'b'], 'tones', 1), { wrapper });
    act(() => result.current.answer(true));
    act(() => result.current.answer(false));
    act(() => result.current.next());
    act(() => result.current.answer(false));
    act(() => result.current.next());
    expect(result.current.isDone).toBe(true);
    expect(result.current.correct).toBe(1);
    expect(result.current.missed).toEqual(['b']);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url).endsWith('/api/sessions')).toBe(true);
    expect(JSON.parse(String(init?.body))).toEqual({ mode: 'tones', level: 1, total: 2, correct: 1 });
  });
});

describe('useRound', () => {
  it('saves the first try of each word and later misses, and ends when every word is learned', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response(JSON.stringify({ progress: [], session: {} }), { status: 200 }));
    const words = [word('好', 1, 'hǎo', 'good'), word('我', 1, 'wǒ', 'I')];
    const { result } = renderHook(() => useRound(words, new Map(), 'meaning'), { wrapper });
    const answerAndNext = (isCorrect: boolean) => {
      act(() => result.current.answer(isCorrect));
      act(() => result.current.next());
    };
    answerAndNext(false);
    answerAndNext(true);
    answerAndNext(true);
    answerAndNext(true);
    expect(result.current.isDone).toBe(false);
    answerAndNext(true);
    expect(result.current.isDone).toBe(true);
    expect(result.current.learned).toBe(2);
    await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/api/sessions'))).toBe(true));
    const saved = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/api/progress')).map(([, init]) => JSON.parse(String(init?.body)));
    expect(saved).toHaveLength(2);
    const session = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/api/sessions'))!;
    expect(JSON.parse(String(session[1]?.body))).toEqual({ mode: 'quiz', level: 1, total: 2, correct: 1 });
  });
});
