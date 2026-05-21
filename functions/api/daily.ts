import { COROS_BASE_URLS } from '../lib/coros';

export async function onRequestGet({ request }: { request: Request }) {
  const accessToken = request.headers.get('accessToken') ?? '';
  const region = request.headers.get('region') ?? 'cn';
  const userId = request.headers.get('x-user-id') ?? '';
  const baseUrl = COROS_BASE_URLS[region as keyof typeof COROS_BASE_URLS] ?? COROS_BASE_URLS.cn;

  const headers: Record<string, string> = {
    'accessToken': accessToken,
    'Content-Type': 'application/json',
  };
  if (userId) {
    headers['yfheader'] = JSON.stringify({ userId });
  }

  const res = await fetch(`${baseUrl}/analyse/dashboard`, { headers });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
