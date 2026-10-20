import { apiFetch } from '../../lib/http';
import type { Answer, RoundSummary, Stats, WordProgress } from './types';

export const fetchProgress = async () => (await apiFetch<{ progress: WordProgress[] }>('/progress')).progress;

export const saveAnswers = async (answers: Answer[]) =>
  (await apiFetch<{ progress: WordProgress[] }>('/progress', { method: 'POST', body: { results: answers } })).progress;

export const saveRound = (round: RoundSummary) => apiFetch('/sessions', { method: 'POST', body: round });

export const fetchStats = () => apiFetch<Stats>(`/stats?tz=${new Date().getTimezoneOffset()}`);
