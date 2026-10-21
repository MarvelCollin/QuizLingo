import { afterEach, describe, expect, it, vi } from 'vitest';
import * as serverSrs from '../../api/_lib/srs';
import { GuestError, guestRequest } from '../../src/lib/guest-store';
import * as browserSrs from '../../src/lib/srs';
import { apiFetch, ApiError, setGuestMode } from '../../src/lib/http';

const DAY = 86400000;

const memory = () => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
};

afterEach(() => {
  setGuestMode(false);
  vi.restoreAllMocks();
});

describe('guest progress in the browser', () => {
  it('uses the same review schedule as the server', () => {
    expect(browserSrs.INTERVALS).toEqual(serverSrs.INTERVALS);
    expect(browserSrs.MASTERED_BOX).toBe(serverSrs.MASTERED_BOX);
    for (let box = 0; box <= serverSrs.MAX_BOX; box++) {
      for (const correct of [true, false]) expect(browserSrs.review(box, correct, 1000)).toEqual(serverSrs.review(box, correct, 1000));
    }
  });

  it('schedules words with the same review steps as an account', () => {
    const store = memory();
    const now = 1_800_000_000_000;
    guestRequest('/progress', 'POST', { results: [{ word: '好', level: 1, correct: true }] }, store, now);
    const later = guestRequest('/progress', 'POST', { results: [{ word: '好', level: 1, correct: true }] }, store, now + DAY) as {
      progress: { box: number; dueAt: number; correct: number }[];
    };
    expect(later.progress[0]).toMatchObject({ box: 2, correct: 2, dueAt: now + DAY + 3 * DAY });
    guestRequest('/progress', 'POST', { results: [{ word: '好', level: 1, correct: false }] }, store, now + 2 * DAY);
    const all = guestRequest('/progress', 'GET', undefined, store) as { progress: { box: number; wrong: number }[] };
    expect(all.progress).toEqual([expect.objectContaining({ box: 0, wrong: 1 })]);
  });

  it('rejects bad input like the server does', () => {
    const store = memory();
    expect(() => guestRequest('/progress', 'POST', { results: [] }, store)).toThrow(GuestError);
    expect(() => guestRequest('/sessions', 'POST', { mode: 'quiz', level: 1, total: 2, correct: 3 }, store)).toThrow(/exceed/);
    expect(() => guestRequest('/basics', 'POST', { lesson: 'a', score: 101, passed: true }, store)).toThrow(/Score/);
  });

  it('builds the dashboard numbers from saved rounds and words', () => {
    const store = memory();
    const now = Date.UTC(2026, 9, 21, 12);
    guestRequest('/sessions', 'POST', { mode: 'quiz', level: 1, total: 8, correct: 6 }, store, now - DAY);
    guestRequest('/sessions', 'POST', { mode: 'quiz', level: 1, total: 4, correct: 4 }, store, now);
    guestRequest('/progress', 'POST', { results: [{ word: '好', level: 1, correct: true }, { word: '我', level: 1, correct: false }] }, store, now);
    const stats = guestRequest('/stats?tz=0', 'GET', undefined, store, now) as {
      streak: number;
      answers: { correct: number; wrong: number };
      levels: { level: number; seen: number; due: number }[];
      activity: { answers: number }[];
      recent: { total: number }[];
    };
    expect(stats.streak).toBe(2);
    expect(stats.answers).toEqual({ correct: 1, wrong: 1 });
    expect(stats.levels).toEqual([{ level: 1, seen: 2, mastered: 0, due: 0 }]);
    expect(stats.activity.at(-1)!.answers).toBe(4);
    expect(stats.recent.map((r) => r.total)).toEqual([4, 8]);
  });

  it('keeps the best starter path score and can start the path over', () => {
    const store = memory();
    guestRequest('/basics', 'POST', { lesson: 'tones-1', score: 60, passed: false }, store, 1);
    const saved = guestRequest('/basics', 'POST', { lesson: 'tones-1', score: 90, passed: true }, store, 2) as {
      lesson: { best: number; attempts: number; completedAt: number };
    };
    expect(saved.lesson).toEqual({ lesson: 'tones-1', best: 90, attempts: 2, completedAt: 2 });
    expect(guestRequest('/basics', 'DELETE', undefined, store)).toEqual({ removed: 1 });
    expect(guestRequest('/basics', 'GET', undefined, store)).toEqual({ lessons: [] });
  });
});

describe('apiFetch for guests', () => {
  it('answers data requests from the browser and never calls the server', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    localStorage.clear();
    setGuestMode(true);
    await apiFetch('/sessions', { method: 'POST', body: { mode: 'quiz', level: 1, total: 1, correct: 1 } });
    const stats = await apiFetch<{ recent: unknown[] }>('/stats?tz=0');
    expect(stats.recent).toHaveLength(1);
    await expect(apiFetch('/progress', { method: 'POST', body: { results: [] } })).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('still asks the server who is signed in', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ user: null }), { status: 200 }));
    setGuestMode(true);
    await apiFetch('/auth/me');
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
