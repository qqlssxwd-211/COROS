import { COROS_BASE_URLS } from '../_lib/coros';

export async function onRequestGet({ request }: { request: Request }) {
  const accessToken = request.headers.get('accessToken') ?? '';
  const region = request.headers.get('region') ?? 'cn';
  const baseUrl = COROS_BASE_URLS[region as keyof typeof COROS_BASE_URLS] ?? COROS_BASE_URLS.cn;
  const url = new URL(request.url);
  const size = url.searchParams.get('size') ?? '1000';
  const page = url.searchParams.get('page') ?? '1';

  const res = await fetch(`${baseUrl}/activity/list?size=${size}&page=${page}`, {
    headers: { 'accessToken': accessToken, 'Content-Type': 'application/json' },
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
