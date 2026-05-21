import { useAuth } from '../context/AuthContext';
import { REGION_BASE_URL } from '../lib/constants';
import type { ActivitySummary, ActivityDetail, DailyRecord, SleepRecord } from '../types/coros';

function getApiBase(region: string): string {
  if (import.meta.env.DEV) {
    return `/api/coros/${region}`;
  }
  return (REGION_BASE_URL as Record<string, string>)[region] ?? REGION_BASE_URL.cn;
}

export function useCorosApi() {
  const { accessToken, region } = useAuth();
  const baseUrl = getApiBase(region);

  async function fetchFromCoros<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    if (!accessToken) throw new Error('Not authenticated');
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${baseUrl}${endpoint}${query}`, {
      headers: { 'accessToken': accessToken, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  const syncAll = async (): Promise<{
    activities: ActivitySummary[];
    dailyRecords: DailyRecord[];
    sleepRecords: SleepRecord[];
  }> => {
    const [activities, dailyRecords, sleepRecords] = await Promise.all([
      fetchFromCoros<ActivitySummary[]>('/api/v1/activity/list', { size: '1000' }),
      fetchFromCoros<DailyRecord[]>('/api/v1/analyse/dashboard', {}),
      fetchFromCoros<SleepRecord[]>('/api/v1/sleep/list', { size: '365' }),
    ]);
    return { activities, dailyRecords, sleepRecords };
  };

  const fetchActivityDetail = async (id: string): Promise<ActivityDetail> => {
    return fetchFromCoros<ActivityDetail>(`/api/v1/activity/detail/${id}`);
  };

  return { syncAll, fetchActivityDetail };
}
