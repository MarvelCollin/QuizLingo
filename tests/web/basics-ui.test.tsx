import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { CardView } from '../../src/features/basics/card-view';
import { LessonResult } from '../../src/features/basics/lesson-result';
import { LessonRow } from '../../src/features/basics/lesson-row';
import { buildPath } from '../../src/features/basics/path-state';
import { QuizView } from '../../src/features/basics/quiz-view';
import { ResetPath } from '../../src/features/basics/reset-path';
import { StageSection } from '../../src/features/basics/stage-section';
import { ToneContour } from '../../src/features/basics/tone-contour';
import type { LessonProgress, QuizAnswer, QuizQuestion } from '../../src/features/basics/types';
import { basicsKey } from '../../src/features/basics/use-basics';
import { WeakCard } from '../../src/features/basics/weak-card';
import { ChartGrid } from '../../src/features/pinyin/chart-grid';
import { buildChart } from '../../src/features/pinyin/chart';
import { lessonById } from '../../src/features/basics/curriculum';

const speech = vi.hoisted(() => ({ playSyllable: vi.fn(), speak: vi.fn(), preloadRecording: vi.fn(), stopSpeaking: vi.fn() }));
vi.mock('../../src/features/practice/speech', () => speech);

const wrap = (progress: LessonProgress[] = []) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } } });
  client.setQueryData(basicsKey, progress);
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

const passed = (...ids: string[]): LessonProgress[] => ids.map((lesson) => ({ lesson, best: 90, attempts: 1, completedAt: 1 }));

const question = (id: string, explain?: string): QuizQuestion => ({
  id,
  lesson: 'tones-1',
  prompt: `Question ${id}`,
  sound: 'ma1',
  explain,
  options: [
    { label: 'right', isCorrect: true },
    { label: 'wrong', isCorrect: false },
  ],
});

describe('LessonRow', () => {
  const rows = buildPath(passed('start-1')).stages[0].lessons;

  it('links an open lesson and marks the next one', () => {
    render(<LessonRow state={rows[1]} isNext delay={0} />, { wrapper: wrap() });
    expect(screen.getByRole('link', { name: /Inside one syllable/ })).toHaveAttribute('href', '/basics/start-2');
    expect(screen.getByText('Up next')).toBeInTheDocument();
  });

  it('shows a passed lesson with its best score', () => {
    render(<LessonRow state={rows[0]} isNext={false} delay={0} />, { wrapper: wrap() });
    expect(screen.getByText('Passed, best 90%')).toBeInTheDocument();
  });

  it('does not link a locked lesson and says what opens it', () => {
    const locked = buildPath([]).stages[0].lessons[1];
    render(<LessonRow state={locked} isNext={false} delay={0} hint="Finish characters and pinyin first" />, { wrapper: wrap() });
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.getByText('Finish characters and pinyin first')).toBeInTheDocument();
  });
});

describe('StageSection', () => {
  it('opens and closes with the stage heading and lists the lessons when open', async () => {
    const state = buildPath([]).stages[0];
    const onToggle = vi.fn();
    const { rerender } = render(<StageSection state={state} index={0} isOpen={false} nextId="start-1" onToggle={onToggle} />, { wrapper: wrap() });
    const button = screen.getByRole('button', { name: /Meet Chinese/ });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('list')).toBeNull();
    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();

    rerender(<StageSection state={state} index={0} isOpen nextId="start-1" onToggle={onToggle} />);
    expect(screen.getByRole('button', { name: /Meet Chinese/ })).toHaveAttribute('aria-expanded', 'true');
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(state.lessons.length);
  });
});

describe('QuizView', () => {
  it('explains each answer and hands every answer back at the end', async () => {
    const onFinish = vi.fn();
    render(<QuizView title="Tones" questions={[question('a', 'Because.'), question('b')]} onFinish={onFinish} />, { wrapper: wrap() });
    expect(screen.getByText('Question a')).toBeInTheDocument();
    expect(speech.playSyllable).toHaveBeenCalledWith('ma1');

    const options = screen.getAllByRole('button').filter((b) => /right|wrong/.test(b.textContent ?? ''));
    await userEvent.click(options.find((b) => /wrong/.test(b.textContent ?? ''))!);
    expect(screen.getByText('Not quite')).toBeInTheDocument();
    expect(screen.getByText('Because.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Next/ }));

    await userEvent.keyboard('{1}');
    await userEvent.click(screen.getByRole('button', { name: /See my result/ }));
    expect(onFinish).toHaveBeenCalledOnce();
    const answers = onFinish.mock.calls[0][0] as QuizAnswer[];
    expect(answers.map((a) => a.question.id)).toEqual(['a', 'b']);
    expect(answers.map((a) => a.question.options[a.chosen].isCorrect)).toEqual([false, true]);
  });

  it('has a heading for screen readers and replays the sound with Space', async () => {
    render(<QuizView title="Tones" questions={[question('a')]} onFinish={vi.fn()} />, { wrapper: wrap() });
    expect(screen.getByRole('heading', { level: 1, name: 'Tones, quiz' })).toBeInTheDocument();
    speech.playSyllable.mockClear();
    await userEvent.keyboard(' ');
    expect(speech.playSyllable).toHaveBeenCalledWith('ma1');
  });
});

describe('CardView', () => {
  it('plays the sound only when asked', async () => {
    speech.playSyllable.mockClear();
    render(<CardView card={{ id: 'a', title: 'mā', subtitle: 'Tone 1', sound: 'ma1', tones: [1] }} />, { wrapper: wrap() });
    expect(speech.playSyllable).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Listen/ }));
    expect(speech.playSyllable).toHaveBeenCalledWith('ma1');
  });

  it('offers to draw a silent tone again and speaks a word card', async () => {
    const { unmount } = render(<CardView card={{ id: 'n', title: 'ma', tones: [5] }} />, { wrapper: wrap() });
    expect(screen.getByRole('button', { name: /Draw it again/ })).toBeInTheDocument();
    unmount();
    render(<CardView card={{ id: 'w', title: '你好', word: '你好' }} />, { wrapper: wrap() });
    await userEvent.click(screen.getByRole('button', { name: /Listen/ }));
    expect(speech.speak).toHaveBeenCalledWith('你好');
  });

  it('hides the say it button when the browser cannot recognise speech', () => {
    render(<CardView card={{ id: 'w', title: '你好', word: '你好' }} />, { wrapper: wrap() });
    expect(screen.queryByRole('button', { name: /Say it/ })).toBeNull();
  });
});

describe('ToneContour', () => {
  it('describes the tones it draws and draws one line for each', () => {
    const { container } = render(<ToneContour tones={[2, 4]} />);
    expect(screen.getByRole('img', { name: 'Pitch line: tone 2, rising, then tone 4, falling' })).toBeInTheDocument();
    expect(container.querySelectorAll('path')).toHaveLength(2);
  });
});

describe('LessonResult', () => {
  const answers = (right: number, total: number): QuizAnswer[] =>
    Array.from({ length: total }, (_, i) => ({ question: question(`q${i}`, 'Explained.'), chosen: i < right ? 0 : 1 }));
  const props = { passMark: 70, isSaving: false, saveError: null, onRetrySave: vi.fn(), onTryAgain: vi.fn(), onReview: vi.fn(), onPracticeMissed: vi.fn() };

  it('congratulates a pass and points to the next lesson', () => {
    render(<LessonResult lesson={lessonById('start-1')!} answers={answers(4, 4)} {...props} />, { wrapper: wrap(passed('start-1')) });
    expect(screen.getByRole('heading', { name: 'Lesson complete' })).toBeInTheDocument();
    expect(screen.getByText('4 of 4 right')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Next: Inside one syllable/ })).toHaveAttribute('href', '/basics/start-2');
    expect(screen.queryByRole('button', { name: /you missed/ })).toBeNull();
  });

  it('says not yet below the pass mark and offers review, retry and practice of the misses', async () => {
    render(<LessonResult lesson={lessonById('start-1')!} answers={answers(1, 4)} {...props} />, { wrapper: wrap() });
    expect(screen.getByRole('heading', { name: 'Not yet' })).toBeInTheDocument();
    expect(screen.getByText('To look at again')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Review the cards' }));
    expect(props.onReview).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: /Practice the 3 you missed/ }));
    expect(props.onPracticeMissed).toHaveBeenCalledOnce();
  });

  it('names the next stage after a milestone', () => {
    render(<LessonResult lesson={lessonById('start-check')!} answers={answers(9, 10)} {...props} passMark={80} />, { wrapper: wrap(passed('start-check')) });
    expect(screen.getByRole('heading', { name: 'Milestone reached' })).toBeInTheDocument();
    expect(screen.getByText(/The next stage, the four tones, is open/)).toBeInTheDocument();
  });

  it('offers to save again when saving failed', async () => {
    render(<LessonResult lesson={lessonById('start-1')!} answers={answers(4, 4)} {...props} saveError={new Error('Offline.')} />, { wrapper: wrap() });
    expect(screen.getByRole('alert')).toHaveTextContent('Your result was not saved. Offline.');
    await userEvent.click(screen.getByRole('button', { name: 'Try saving again' }));
    expect(props.onRetrySave).toHaveBeenCalledOnce();
  });
});

describe('WeakCard', () => {
  it('counts the questions to go back to', () => {
    const { rerender } = render(<WeakCard count={1} />, { wrapper: wrap() });
    expect(screen.getByText(/1 question you missed/)).toBeInTheDocument();
    rerender(<WeakCard count={3} />);
    expect(screen.getByText(/3 questions you missed/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Practice them' })).toHaveAttribute('href', '/basics/weak');
  });
});

describe('ChartGrid', () => {
  it('plays a syllable in the chosen tone and hides syllables that lack that tone', async () => {
    const chart = buildChart(['ba1', 'ba4', 'pa1', 'ma1']);
    const onPlay = vi.fn();
    const { rerender } = render(<ChartGrid chart={chart} tone={1} found={null} playing={null} onPlay={onPlay} />);
    await userEvent.click(screen.getByRole('button', { name: 'Play bā' }));
    expect(onPlay).toHaveBeenCalledWith('ba');
    expect(screen.getByRole('button', { name: 'Play pā' })).toBeInTheDocument();

    rerender(<ChartGrid chart={chart} tone={4} found={null} playing={null} onPlay={onPlay} />);
    expect(screen.getByRole('button', { name: 'Play bà' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Play pà' })).toBeNull();
  });
});

describe('ResetPath', () => {
  it('asks twice and clears the path through the api', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ removed: 2 }), { status: 200 }));
    render(<ResetPath />, { wrapper: wrap(passed('start-1')) });
    expect(screen.queryByRole('button', { name: 'Clear my path' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Start the path over' }));
    await userEvent.click(screen.getByRole('button', { name: 'Keep my progress' }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Start the path over' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Start the path over' }));
    await userEvent.click(screen.getByRole('button', { name: 'Clear my path' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock.mock.calls[0][1]?.method).toBe('DELETE');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Start the path over' })).toBeInTheDocument());
  });

  it('shows the reason when clearing fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: 'Please sign in to continue.' }), { status: 401 }));
    render(<ResetPath />, { wrapper: wrap(passed('start-1')) });
    await userEvent.click(screen.getByRole('button', { name: 'Start the path over' }));
    await userEvent.click(screen.getByRole('button', { name: 'Clear my path' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Please sign in to continue.');
  });
});
