import { getUser } from '../_lib/auth.js';
import { handle, json } from '../_lib/http.js';

export const GET = handle(async (request) => {
  return json({ user: await getUser(request) });
});
