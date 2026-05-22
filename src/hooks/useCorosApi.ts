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
    const json = await res.json();
    if (json.result && json.result !== '0000') {
      throw new Error(json.message || `API result: ${json.result}`);
    }
    return json;
  }

  function mapActivity(raw: any): ActivitySummary {
    const dist = raw.distance ?? 0;
    const time = raw.totalTime ?? 0;
    const speed = raw.avgSpeed ? Number(raw.avgSpeed) : undefined;
    // avgSpeed 单位是 cm/s，但有些活动返回的是 m/s*100，统一 /100 转 m/s
    const speedMs = speed ? (speed > 1000 ? speed / 100 : speed) : undefined;
    const maxSpd = raw.maxSpeed ? Number(raw.maxSpeed) : undefined;
    const maxSpeedMs = maxSpd ? (maxSpd > 1000 ? maxSpd / 100 : maxSpd) : undefined;
    return {
      id: raw.labelId ?? '',
      name: raw.name ?? '',
      sportType: raw.sportType ?? 0,
      sportName: raw.sportName ?? '',
      startTime: raw.startTime ? String(raw.startTime) : '',
      totalTime: time,
      totalDistance: dist,
      totalCalories: raw.calorie ?? 0,
      avgHeartRate: raw.avgHr ?? 0,
      maxHeartRate: raw.maxHr ?? 0,
      avgPace: dist > 0 && time > 0 ? Math.round(time / (dist / 1000)) : 0,
      totalAscent: raw.ascent ?? 0,
      trainingLoad: raw.trainingLoad ?? 0,
      endTime: raw.endTime ? String(raw.endTime) : undefined,
      descent: raw.descent ?? undefined,
      avgCadence: raw.avgCadence ?? undefined,
      avgSpeed: speedMs,
      maxSpeed: maxSpeedMs,
      device: raw.device ?? undefined,
      step: raw.step ?? undefined,
      workoutTime: raw.workoutTime ?? undefined,
      // New fields
      imageUrl: raw.imageUrl ?? undefined,
      maxSlope: raw.maxSlope ?? undefined,
      bestKm: raw.bestKm ?? undefined,
      best: raw.best ? Number(raw.best) : undefined,
      avgPower: raw.avgPower ?? undefined,
      np: raw.np ?? undefined,
      avgStrkRate: raw.avgStrkRate ?? undefined,
      swolf: raw.swolf ?? undefined,
      lengths: raw.lengths ?? undefined,
      sets: raw.sets ?? undefined,
      totalReps: raw.totalReps ?? undefined,
      downhillDist: raw.downhillDist ?? undefined,
      downhillTime: raw.downhillTime ?? undefined,
      totalDescent: raw.totalDescent ?? undefined,
      bodyTemperature: raw.bodyTemperature ?? undefined,
      waterTemperature: raw.waterTemperature ? raw.waterTemperature / 100 : undefined,
      mode: raw.mode ?? undefined,
      cadence: raw.cadence ?? undefined,
    };
  }

  const syncAll = async (): Promise<{
    activities: ActivitySummary[];
    dailyRecords: DailyRecord[];
    sleepRecords: SleepRecord[];
  }> => {
    // Fetch first page to get total count
    const firstPage = await fetchFromCoros<{ result: string; data: { count: number; dataList: any[] } }>(
      '/activity/query', { size: '100', pageNumber: '1' }
    );

    const rawList = firstPage.data?.dataList ?? [];
    const activities: ActivitySummary[] = rawList.map(mapActivity);
    const totalCount = firstPage.data?.count ?? 0;
    const totalPages = Math.ceil(totalCount / 100);

    // Fetch remaining pages
    if (totalPages > 1) {
      const pagePromises: Promise<ActivitySummary[]>[] = [];
      for (let p = 2; p <= totalPages; p++) {
        pagePromises.push(
          fetchFromCoros<{ result: string; data: { dataList: any[] } }>(
            '/activity/query', { size: '100', pageNumber: String(p) }
          ).then(res => (res.data?.dataList ?? []).map(mapActivity))
        );
      }
      const results = await Promise.all(pagePromises);
      results.forEach(arr => activities.push(...arr));
    }

    // Compute daily records from activities (aggregated by date)
    const dateMap = new Map<string, { distance: number; duration: number; calories: number; trainingLoad: number; count: number }>();
    for (const a of activities) {
      const date = a.startTime ? new Date(Number(a.startTime) * 1000).toISOString().slice(0, 10) : '';
      if (!date) continue;
      const entry = dateMap.get(date) ?? { distance: 0, duration: 0, calories: 0, trainingLoad: 0, count: 0 };
      entry.distance += a.totalDistance;
      entry.duration += a.totalTime;
      entry.calories += a.totalCalories;
      entry.trainingLoad += a.trainingLoad;
      entry.count++;
      dateMap.set(date, entry);
    }

    const dailyRecords: DailyRecord[] = Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date,
        hrv: 0,
        hrvBaseline: 0,
        restingHeartRate: 0,
        trainingLoad: d.trainingLoad,
        loadRatio: 0,
        vo2max: 0,
        stamina: 0,
        fatigue: d.trainingLoad > 50 ? Math.min(d.trainingLoad / 2, 100) : Math.max(50 - d.trainingLoad / 2, 0),
      }));

    return { activities, dailyRecords, sleepRecords: [] };
  };

  const fetchActivityDetail = async (id: string): Promise<ActivityDetail> => {
    // Basic detail from activity list data — detail endpoint unavailable on CN API
    return {
      id,
      name: '',
      sportType: 0,
      sportName: '',
      startTime: '',
      totalTime: 0,
      totalDistance: 0,
      totalCalories: 0,
      avgHeartRate: 0,
      maxHeartRate: 0,
      avgPace: 0,
      totalAscent: 0,
      trainingLoad: 0,
      lapData: [],
      heartRateZones: [],
      elevationData: [],
      paceData: [],
    };
  };

  return { syncAll, fetchActivityDetail };
}
