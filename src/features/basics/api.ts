import { apiFetch } from '../../lib/http';
import type { AttemptInput, LessonProgress } from './types';

export const fetchLessonProgress = async () => (await apiFetch<{ lessons: LessonProgress[] }>('/basics')).lessons;

export const saveAttempt = async (attempt: AttemptInput) =>
  (await apiFetch<{ lesson: LessonProgress }>('/basics', { method: 'POST', body: attempt })).lesson;
