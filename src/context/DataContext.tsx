import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useCorosApi } from '../hooks/useCorosApi';
import type { ActivitySummary, DailyRecord, SleepRecord, DashboardSummary } from '../types/coros';

interface DataState {
  activities: ActivitySummary[];
  dailyRecords: DailyRecord[];
  sleepRecords: SleepRecord[];
  lastSync: Date | null;
  syncLoading: boolean;
  syncData: () => Promise<void>;
  summary: DashboardSummary;
}

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const { syncAll } = useCorosApi();

  const syncData = useCallback(async () => {
    setSyncLoading(true);
    try {
      const data = await syncAll();
      setActivities(data.activities);
      setDailyRecords(data.dailyRecords);
      setSleepRecords(data.sleepRecords);
      setLastSync(new Date());
    } finally {
      setSyncLoading(false);
    }
  }, [syncAll]);

  const summary: DashboardSummary = {
    year: 2026,
    totalActivities: activities.length,
    totalDistance: activities.reduce((s, a) => s + a.totalDistance, 0),
    totalDuration: activities.reduce((s, a) => s + a.totalTime, 0),
    totalCalories: activities.reduce((s, a) => s + a.totalCalories, 0),
    activities,
  };

  return (
    <DataContext.Provider value={{ activities, dailyRecords, sleepRecords, lastSync, syncLoading, syncData, summary }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
