import { apiFetch } from '../../lib/http';
import type { Credentials, Registration, User } from './types';

export const fetchMe = async () => (await apiFetch<{ user: User | null }>('/auth/me')).user;

export const login = async (credentials: Credentials) =>
  (await apiFetch<{ user: User }>('/auth/login', { method: 'POST', body: credentials })).user;

export const register = async (registration: Registration) =>
  (await apiFetch<{ user: User }>('/auth/register', { method: 'POST', body: registration })).user;

export const logout = () => apiFetch('/auth/logout', { method: 'POST', body: {} });
