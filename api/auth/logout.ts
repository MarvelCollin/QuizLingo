import { destroySession } from '../_lib/auth.js';
import { handle, json } from '../_lib/http.js';

export const POST = handle(async (request) => {
  const cookie = await destroySession(request);
  return json({ ok: true }, { headers: { 'Set-Cookie': cookie } });
});
