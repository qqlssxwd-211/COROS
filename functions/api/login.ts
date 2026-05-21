import { md5, COROS_BASE_URLS } from '../_lib/coros';

export async function onRequestPost({ request }: { request: Request }) {
  const { email, password, region } = await request.json() as { email: string; password: string; region: string };
  const baseUrl = COROS_BASE_URLS[region as keyof typeof COROS_BASE_URLS] ?? COROS_BASE_URLS.cn;
  const hash = md5(password);

  const res = await fetch(`${baseUrl}/account/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: email, pwd: hash, accountType: 2 }),
  });

  if (!res.ok) return new Response(JSON.stringify({ error: 'login failed' }), { status: 401 });
  const body = await res.json() as Record<string, unknown>;
  if (body.result !== '0000') {
    return new Response(JSON.stringify({ error: body.message || `Login failed (${body.result})` }), { status: 401 });
  }
  const inner = body.data as Record<string, unknown> | undefined;
  return new Response(JSON.stringify({ accessToken: inner?.accessToken, userId: inner?.userId }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
