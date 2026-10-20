export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Options = { method?: 'GET' | 'POST' | 'DELETE'; body?: unknown; signal?: AbortSignal };

// The one place that talks to /api. The session cookie is httpOnly, so it travels automatically.
export const apiFetch = async <T>(path: string, { method = 'GET', body, signal }: Options = {}): Promise<T> => {
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
