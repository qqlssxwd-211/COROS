import { md5, COROS_BASE_URLS } from '../_lib/coros';

export async function onRequestPost({ request }: { request: Request }) {
  const { email, password, region } = await request.json() as { email: string; password: string; region: string };
  const baseUrl = COROS_BASE_URLS[region as keyof typeof COROS_BASE_URLS] ?? COROS_BASE_URLS.cn;
  const hash = md5(password);

  const res = await fetch(`${baseUrl}/account/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: email, password: hash, accountType: 2 }),
  });

  if (!res.ok) return new Response(JSON.stringify({ error: 'login failed' }), { status: 401 });
  const data = await res.json() as Record<string, unknown>;
  if (data.result !== '0000') {
    return new Response(JSON.stringify({ error: data.message || `Login failed (${data.result})` }), { status: 401 });
  }
  return new Response(JSON.stringify({ accessToken: data.accessToken, userId: data.userId }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
