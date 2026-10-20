export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const json = (body: unknown, init: ResponseInit = {}): Response => {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(body), { ...init, headers });
};

const MAX_BODY_BYTES = 64 * 1024;

export const readJson = async <T>(request: Request): Promise<T> => {
  const type = request.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) throw new HttpError(415, 'Expected a JSON body');
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new HttpError(413, 'Request body is too large');
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }
};

export const parseCookies = (request: Request): Record<string, string> => {
  const header = request.headers.get('cookie') ?? '';
  const cookies: Record<string, string> = {};
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    cookies[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return cookies;
};

export const handle =
  (handler: (request: Request) => Promise<Response>) =>
  async (request: Request): Promise<Response> => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ error: error.message }, { status: error.status });
      }
      console.error(error);
      return json({ error: 'Something went wrong on our side. Please try again.' }, { status: 500 });
    }
  };
