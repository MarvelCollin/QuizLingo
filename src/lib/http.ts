import { GuestError, guestRequest } from './guest-store';

let isGuestMode = false;

export const setGuestMode = (value: boolean) => {
  isGuestMode = value;
};

export const isGuest = () => isGuestMode;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Options = { method?: 'GET' | 'POST' | 'DELETE'; body?: unknown; signal?: AbortSignal };

export const apiFetch = async <T>(path: string, { method = 'GET', body, signal }: Options = {}): Promise<T> => {
  if (isGuestMode && !path.startsWith('/auth/')) {
    try {
      return guestRequest(path, method, body) as T;
    } catch (error) {
      if (error instanceof GuestError) throw new ApiError(error.status, error.message);
      throw error;
    }
  }
  let response: Response;
  try {
    response = await fetch(`${import.meta.env.BASE_URL}api${path}`, {
      method,
      signal,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? 'Something went wrong. Please try again.');
  }
  return data as T;
};
