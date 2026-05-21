import md5 from 'blueimp-md5';
import { REGION_BASE_URL } from './constants';
import type { CorosCredentials } from '../types/coros';

function getApiBase(region: string): string {
  if (import.meta.env.DEV) {
    return `/api/coros/${region}`;
  }
  return (REGION_BASE_URL as Record<string, string>)[region] ?? REGION_BASE_URL.cn;
}

export async function loginCoros(credentials: CorosCredentials): Promise<{ accessToken: string; userId: string }> {
  const baseUrl = getApiBase(credentials.region);
  const passwordHash = md5(credentials.password);
  const url = `${baseUrl}/account/login`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      account: credentials.email,
      password: passwordHash,
      accountType: 2,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Login failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (data.result !== '0000') {
    throw new Error(data.message || `Login failed, result: ${data.result}`);
  }
  if (!data.accessToken || !data.userId) {
    throw new Error('Login response missing required fields');
  }

  return { accessToken: data.accessToken, userId: data.userId };
}

export function buildCorosRequest(baseUrl: string, accessToken: string, endpoint: string, params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return {
    url: `${baseUrl}${endpoint}${query}`,
    headers: { 'accessToken': accessToken, 'Content-Type': 'application/json' },
  };
}
