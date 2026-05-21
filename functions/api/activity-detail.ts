import { COROS_BASE_URLS } from '../_lib/coros';

export async function onRequestGet({ request }: { request: Request }) {
  const accessToken = request.headers.get('accessToken') ?? '';
  const region = request.headers.get('region') ?? 'cn';
  const baseUrl = COROS_BASE_URLS[region as keyof typeof COROS_BASE_URLS] ?? COROS_BASE_URLS.cn;
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  const res = await fetch(`${baseUrl}/activity/detail/${id}`, {
    headers: { 'accessToken': accessToken, 'Content-Type': 'application/json' },
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
