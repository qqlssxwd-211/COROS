import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import TabShell from './TabShell';
import FilterBar from './FilterBar';
import MetricCard from '../ui/MetricCard';
import { BarChart, AreaChart, LineChart } from '../charts';
import DataTable from '../ui/DataTable';
import type { ActivitySummary, SportType } from '../../types/coros';
import { SPORT_MAP } from '../../lib/constants';

interface Props { active: boolean; onClose: () => void; }

function groupByWeek(activities: ActivitySummary[]) {
  const weeks: Record<string, { distance: number; duration: number; count: number; load: number }> = {};
  activities.forEach(a => {
    const d = new Date(Number(a.startTime) * 1000);
    const weekStart = new Date(d.getTime() - d.getDay() * 86400000).toISOString().slice(0, 10);
    if (!weeks[weekStart]) weeks[weekStart] = { distance: 0, duration: 0, count: 0, load: 0 };
    weeks[weekStart].distance += a.totalDistance / 1000;
    weeks[weekStart].duration += a.totalTime / 3600;
    weeks[weekStart].count += 1;
    weeks[weekStart].load += a.trainingLoad;
  });
  return Object.entries(weeks).map(([week, d]) => ({ week, ...d }));
}

export default function TrendTab({ active, onClose }: Props) {
  const { activities } = useData();

  // Draft filter state (UI)
  const [sportType, setSportType] = useState<SportType>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Applied filter state (used for actual filtering)
  const [appliedSport, setAppliedSport] = useState<SportType>('all');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  const handleSearch = useCallback(() => {
    setAppliedSport(sportType);
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
  }, [sportType, dateFrom, dateTo]);

  const handleReset = useCallback(() => {
    setSportType('all'); setDateFrom(''); setDateTo('');
    setAppliedSport('all'); setAppliedFrom(''); setAppliedTo('');
  }, []);

  const filtered = useMemo(() => {
    let acts = activities;
    if (appliedSport !== 'all') {
      const typeId = Object.entries(SPORT_MAP).find(([, v]) => v.type === appliedSport)?.[0];
      if (typeId) acts = acts.filter(a => a.sportType === Number(typeId));
    }
    if (appliedFrom || appliedTo) {
      const fromTs = appliedFrom ? new Date(appliedFrom).getTime() / 1000 : 0;
      const toTs = appliedTo ? new Date(appliedTo).getTime() / 1000 + 86400 : Infinity;
      acts = acts.filter(a => {
        const ts = Number(a.startTime);
        return ts >= fromTs && ts < toTs;
      });
    }
    return acts;
  }, [activities, appliedSport, appliedFrom, appliedTo]);

  const weeks = useMemo(() => groupByWeek(filtered), [filtered]);

  return (
    <TabShell active={active} onClose={onClose} title="训练趋势">
      <FilterBar sportType={sportType} onSportChange={setSportType} dateFrom={dateFrom} onDateFromChange={setDateFrom}
        dateTo={dateTo} onDateToChange={setDateTo} onSearch={handleSearch} onReset={handleReset} />
      <div className="mt-1 text-[0.68rem] text-[#555]">显示 {filtered.length} 条活动</div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <MetricCard title="每周距离趋势 (km)" chart={<BarChart data={weeks.map(w => ({ x: w.week, y: w.distance }))} />} />
        <MetricCard title="每周时长趋势 (h)" chart={<AreaChart data={weeks.map(w => ({ x: w.week, y: w.duration }))} area />} />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <MetricCard title="训练负荷趋势" chart={<LineChart data={weeks.map(w => ({ x: w.week, y: w.load }))} />} />
        <MetricCard title="活动次数" chart={<BarChart data={weeks.map(w => ({ x: w.week, y: w.count }))} color="#38bdf8" />} />
      </div>
      <div className="mt-4">
        <DataTable
          columns={[
            { key: 'week', label: '周' }, { key: 'distance', label: '距离(km)', render: (v) => Number(v).toFixed(1) },
            { key: 'duration', label: '时长(h)', render: (v) => Number(v).toFixed(1) },
            { key: 'count', label: '活动' }, { key: 'load', label: '负荷', render: (v) => Math.round(Number(v)) },
          ]}
          rows={weeks.slice(-10).reverse() as unknown as Record<string, unknown>[]}
        />
      </div>
    </TabShell>
  );
}
