import { getDb } from './db.js';
import { HttpError } from './http.js';

export const clientIp = (request: Request): string | null =>
  request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

export const limitRate = async (request: Request, kind: string, max: number, windowMs: number, message: string) => {
  const key = clientIp(request);
  if (!key) return;
  const db = await getDb();
  const now = Date.now();
  const [count] = await db.batch(
    [
      { sql: 'SELECT COUNT(*) AS n FROM rate_events WHERE kind = ? AND key = ? AND at > ?', args: [kind, key, now - windowMs] },
      { sql: 'DELETE FROM rate_events WHERE at < ?', args: [now - windowMs] },
      { sql: 'INSERT INTO rate_events (kind, key, at) VALUES (?, ?, ?)', args: [kind, key, now] },
    ],
    'write',
  );
  if (Number(count.rows[0]?.n ?? 0) >= max) throw new HttpError(429, message);
};
