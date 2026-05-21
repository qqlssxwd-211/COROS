import { COROS_BASE_URLS } from '../_lib/coros';

export async function onRequestPost({ request }: { request: Request }) {
  const accessToken = request.headers.get('accessToken') ?? '';
  const region = request.headers.get('region') ?? 'cn';
  const userId = request.headers.get('x-user-id') ?? '';
  const baseUrl = COROS_BASE_URLS[region as keyof typeof COROS_BASE_URLS] ?? COROS_BASE_URLS.cn;

  const body = await request.json() as { size?: number; pageNumber?: number };
  const headers: Record<string, string> = {
    'accessToken': accessToken,
    'Content-Type': 'application/json',
  };
  if (userId) {
    headers['yfheader'] = JSON.stringify({ userId });
  }

  const res = await fetch(`${baseUrl}/activity/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ size: body.size ?? 1000, pageNumber: body.pageNumber ?? 1 }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
