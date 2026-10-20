import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getDb } from '../../api/_lib/db';
import * as login from '../../api/auth/login';
import * as logout from '../../api/auth/logout';
import * as me from '../../api/auth/me';
import * as register from '../../api/auth/register';
import * as progress from '../../api/progress';
import * as sessions from '../../api/sessions';
import * as stats from '../../api/stats';

const BASE = 'http://localhost/quizlingo/api';

const call = async (handler: (request: Request) => Promise<Response>, path: string, options: { body?: unknown; cookie?: string; method?: string } = {}) => {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['content-type'] = 'application/json';
  if (options.cookie) headers.cookie = options.cookie;
  const response = await handler(
    new Request(`${BASE}${path}`, {
      method: options.method ?? (options.body === undefined ? 'GET' : 'POST'),
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    }),
  );
  const cookie = response.headers.get('set-cookie')?.split(';')[0] ?? '';
  return { status: response.status, body: (await response.json()) as Record<string, unknown>, cookie };
};

const email = `tester-${Date.now()}@example.com`;
let cookie = '';

beforeAll(() => {
  expect(process.env.TURSO_DATABASE_URL?.startsWith('file:')).toBe(true);
});

afterAll(async () => {
  (await getDb()).close();
});

describe('accounts', () => {
  it('registers, rejects a second account with the same email, and signs in', async () => {
    const created = await call(register.POST, '/auth/register', { body: { name: 'Tester', email, password: 'password123' } });
    expect(created.status).toBe(201);
    expect(created.cookie).toMatch(/^ql_session=/);

    const duplicate = await call(register.POST, '/auth/register', { body: { name: 'Tester', email, password: 'password123' } });
    expect(duplicate.status).toBe(409);

    const wrong = await call(login.POST, '/auth/login', { body: { email, password: 'nope-nope' } });
    expect(wrong.status).toBe(401);

    const signedIn = await call(login.POST, '/auth/login', { body: { email: email.toUpperCase(), password: 'password123' } });
    expect(signedIn.status).toBe(200);
    cookie = signedIn.cookie;

    const session = await call(me.GET, '/auth/me', { cookie });
    expect(session.body.user).toMatchObject({ email, name: 'Tester' });
  });

  it('treats a fake session as signed out', async () => {
    expect((await call(me.GET, '/auth/me', { cookie: 'ql_session=fake' })).body.user).toBeNull();
    expect((await call(progress.GET, '/progress', { cookie: 'ql_session=fake' })).status).toBe(401);
    expect((await call(stats.GET, '/stats', { cookie: 'ql_session=fake' })).status).toBe(401);
    expect((await call(sessions.POST, '/sessions', { cookie: 'ql_session=fake', body: { mode: 'quiz', level: 1, total: 1, correct: 1 } })).status).toBe(401);
  });
});

describe('progress and stats', () => {
  it('schedules answers and merges repeats of the same word', async () => {
    const saved = await call(progress.POST, '/progress', {
      cookie,
      body: {
        results: [
          { word: '你好', level: 1, correct: true },
          { word: '你好', level: 1, correct: true },
          { word: '经济', level: 4, correct: false },
        ],
      },
    });
    expect(saved.status).toBe(200);
    const list = saved.body.progress as { word: string; box: number; correct: number; wrong: number }[];
    expect(list.find((p) => p.word === '你好')).toMatchObject({ box: 2, correct: 2, wrong: 0 });
    expect(list.find((p) => p.word === '经济')).toMatchObject({ box: 0, correct: 0, wrong: 1 });

    const all = await call(progress.GET, '/progress', { cookie });
    expect((all.body.progress as unknown[]).length).toBe(2);
  });

  it('rejects bad answers', async () => {
    expect((await call(progress.POST, '/progress', { cookie, body: { results: [] } })).status).toBe(400);
    expect((await call(progress.POST, '/progress', { cookie, body: { results: [{ word: '你', level: 9, correct: true }] } })).status).toBe(400);
  });

  it('saves rounds for every kind of practice and reports them in stats', async () => {
    for (const roundMode of ['quiz', 'tones', 'listening-test', 'mock-test', 'speaking']) {
      const round = await call(sessions.POST, '/sessions', { cookie, body: { mode: roundMode, level: 7, total: 10, correct: 6 } });
      expect(round.status).toBe(201);
    }
    expect((await call(sessions.POST, '/sessions', { cookie, body: { mode: 'quiz', level: 1, total: 2, correct: 3 } })).status).toBe(400);

    const summary = await call(stats.GET, '/stats?tz=-420', { cookie });
    expect(summary.status).toBe(200);
    expect(summary.body.answers).toEqual({ correct: 2, wrong: 1 });
    expect(summary.body.streak).toBe(1);
    expect((summary.body.recent as unknown[]).length).toBe(5);
    expect((summary.body.activity as unknown[]).length).toBe(14);
    const levels = summary.body.levels as { level: number; seen: number }[];
    expect(levels.find((l) => l.level === 4)?.seen).toBe(1);
  });

  it('signs out and ends the session', async () => {
    const out = await call(logout.POST, '/auth/logout', { cookie, body: {} });
    expect(out.status).toBe(200);
    expect((await call(me.GET, '/auth/me', { cookie })).body.user).toBeNull();
  });
});

describe('login throttling', () => {
  it('blocks an email after 10 failed attempts', async () => {
    const target = `throttle-${Date.now()}@example.com`;
    await call(register.POST, '/auth/register', { body: { name: 'T', email: target, password: 'password123' } });
    for (let i = 0; i < 10; i++) {
      expect((await call(login.POST, '/auth/login', { body: { email: target, password: 'wrong-pass' } })).status).toBe(401);
    }
    expect((await call(login.POST, '/auth/login', { body: { email: target, password: 'password123' } })).status).toBe(429);
  }, 60000);
});
