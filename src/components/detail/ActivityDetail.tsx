import { useEffect, useState } from 'react';
import TabShell from '../tabs/TabShell';
import MetricCard from '../ui/MetricCard';
import DataTable from '../ui/DataTable';
import { LineChart, PieChart } from '../charts';
import { useCorosApi } from '../../hooks/useCorosApi';
import { SPORT_MAP } from '../../lib/constants';
import type { ActivitySummary, ActivityDetail as ActivityDetailType } from '../../types/coros';

interface Props { activity: ActivitySummary | null; onClose: () => void; }

export default function ActivityDetail({ activity, onClose }: Props) {
  const [detail, setDetail] = useState<ActivityDetailType | null>(null);
  const { fetchActivityDetail } = useCorosApi();

  useEffect(() => {
    if (activity) { fetchActivityDetail(activity.id).then(setDetail).catch(() => {}); }
  }, [activity, fetchActivityDetail]);

  if (!activity) return null;
  const sport = SPORT_MAP[activity.sportType] ?? { name: '未知', color: '#666' };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <TabShell active={!!activity} onClose={onClose} title="">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-[11px] h-[11px] rounded-full flex-shrink-0" style={{ background: sport.color }} />
        <div>
          <div className="text-lg font-medium">{activity.name}</div>
          <div className="text-[0.73rem] text-[#666] mt-1">{activity.startTime.slice(0, 10)} · {sport.name}</div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 mb-4">
        {[
          { label: '距离', value: (activity.totalDistance / 1000).toFixed(2), unit: 'km' },
          { label: '时长', value: formatTime(activity.totalTime), unit: '' },
          { label: '爬升', value: String(activity.totalAscent || 0), unit: 'm' },
          { label: '心率', value: String(activity.avgHeartRate || '—'), unit: 'bpm' },
          { label: '消耗', value: String(activity.totalCalories || 0), unit: 'kcal' },
          { label: '负荷', value: activity.trainingLoad != null ? String(activity.trainingLoad) : '—', unit: '' },
        ].map(m => (
          <div key={m.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-xl font-medium text-[#fafafa]">{m.value}<span className="text-[0.7rem] text-[#666] ml-0.5">{m.unit}</span></div>
            <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#666] mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {detail && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <MetricCard title="配速 & 海拔" chart={
              <LineChart data={detail.elevationData?.map(e => ({ x: `${(e.distance / 1000).toFixed(1)}km`, y: e.elevation })) ?? []} />
            } />
            <MetricCard title="心率区间" chart={
              <PieChart data={detail.heartRateZones?.map(z => ({ name: z.name, value: z.duration, color: ['#4ade80', '#facc15', '#f97316', '#ef4444', '#dc2626'][z.zone - 1] ?? '#666' })) ?? []} />
            } />
          </div>
          <DataTable
            columns={[
              { key: 'index', label: '#' },
              { key: 'distance', label: '距离(km)', render: (v) => (Number(v) / 1000).toFixed(2) },
              { key: 'duration', label: '时长', render: (v) => { const s = Number(v); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; } },
              { key: 'pace', label: '配速', render: (v) => v != null ? `${Math.floor(Number(v) / 60)}'${String(Math.round(Number(v) % 60)).padStart(2, '0')}"` : '—' },
              { key: 'heartRate', label: '心率', render: (v) => v != null ? String(v) : '—' },
              { key: 'cadence', label: '步频', render: (v) => v != null ? String(v) : '—' },
              { key: 'ascent', label: '爬升(m)', render: (v) => v != null ? String(v) : '—' },
            ]}
            rows={(detail.lapData ?? []) as unknown as Record<string, unknown>[]}
          />
        </>
      )}
    </TabShell>
  );
}
