import { describe, expect, it } from 'vitest';
import { hashPassword, normalizeEmail, validatePassword, verifyPassword } from '../../api/_lib/auth';
import { HttpError, parseCookies, readJson } from '../../api/_lib/http';
import { INTERVALS, MAX_BOX, review } from '../../api/_lib/srs';
import { count, level, MODES, mode, word } from '../../api/_lib/validate';

describe('review schedule', () => {
  const now = 1_000_000;

  it('moves a word up one box on a right answer', () => {
    expect(review(0, true, now)).toEqual({ box: 1, dueAt: now + INTERVALS[1] });
    expect(review(MAX_BOX, true, now).box).toBe(MAX_BOX);
  });

  it('sends a word back to box 0 on a wrong answer, due in 10 minutes', () => {
    expect(review(4, false, now)).toEqual({ box: 0, dueAt: now + 10 * 60 * 1000 });
  });
});

describe('input validation', () => {
  it('accepts levels 1 to 7, where 7 is HSK 7-9', () => {
    for (const value of [1, 4, 7]) expect(level(value)).toBe(value);
    for (const value of [0, 8, 2.5, '3']) expect(() => level(value)).toThrow(HttpError);
  });

  it('accepts every practice mode the app sends', () => {
    for (const value of MODES) expect(mode(value)).toBe(value);
    expect(MODES).toEqual(expect.arrayContaining(['reading', 'order', 'tones', 'mock-test', 'speaking', 'writing']));
    expect(() => mode('cheat')).toThrow(HttpError);
  });

  it('checks words and counts', () => {
    expect(word('你好')).toBe('你好');
    expect(() => word('')).toThrow(HttpError);
    expect(() => word('x'.repeat(17))).toThrow(HttpError);
    expect(count(5, 10)).toBe(5);
    expect(() => count(-1, 10)).toThrow(HttpError);
    expect(() => count(11, 10)).toThrow(HttpError);
  });
});

describe('account helpers', () => {
  it('normalizes emails and rejects bad ones', () => {
    expect(normalizeEmail('  Kolin@Example.COM ')).toBe('kolin@example.com');
    expect(() => normalizeEmail('not-an-email')).toThrow(HttpError);
  });

  it('requires passwords of 8 to 200 characters', () => {
    expect(validatePassword('password1')).toBe('password1');
    expect(() => validatePassword('short')).toThrow(HttpError);
    expect(() => validatePassword('x'.repeat(201))).toThrow(HttpError);
  });

  it('hashes passwords with a salt and verifies them', async () => {
    const first = await hashPassword('correct horse');
    const second = await hashPassword('correct horse');
    expect(first).not.toBe(second);
    expect(first.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('correct horse', first)).toBe(true);
    expect(await verifyPassword('wrong horse', first)).toBe(false);
    expect(await verifyPassword('anything', 'garbage')).toBe(false);
  });
});

describe('http helpers', () => {
  it('reads cookies', () => {
    const request = new Request('http://x', { headers: { cookie: 'a=1; ql_session=abc%20d' } });
    expect(parseCookies(request)).toEqual({ a: '1', ql_session: 'abc d' });
  });

  it('only accepts JSON bodies', async () => {
    const form = new Request('http://x', { method: 'POST', body: 'a=1', headers: { 'content-type': 'application/x-www-form-urlencoded' } });
    await expect(readJson(form)).rejects.toMatchObject({ status: 415 });
    const broken = new Request('http://x', { method: 'POST', body: '{', headers: { 'content-type': 'application/json' } });
    await expect(readJson(broken)).rejects.toMatchObject({ status: 400 });
  });
});
