import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import TabShell from './TabShell';
import MetricCard from '../ui/MetricCard';
import { LineChart } from '../charts';
import DataTable from '../ui/DataTable';
import type { DailyRecord } from '../../types/coros';

interface Props { active: boolean; onClose: () => void; }

export default function BodyTab({ active, onClose }: Props) {
  const { dailyRecords } = useData();

  const sorted = useMemo(() => [...dailyRecords].sort((a, b) => b.date.localeCompare(a.date)), [dailyRecords]);

  return (
    <TabShell active={active} onClose={onClose} title="身体数据">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <MetricCard title="HRV 趋势" chart={<LineChart data={sorted.slice(0, 30).reverse().map(d => ({ x: d.date.slice(5), y: d.hrv }))} />} />
        <MetricCard title="静息心率" chart={<LineChart data={sorted.slice(0, 30).reverse().map(d => ({ x: d.date.slice(5), y: d.restingHeartRate }))} color="#38bdf8" />} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <MetricCard title="训练负荷" chart={<LineChart data={sorted.slice(0, 30).reverse().map(d => ({ x: d.date.slice(5), y: d.trainingLoad }))} color="#facc15" />} />
        <MetricCard title="VO2max" chart={<LineChart data={sorted.slice(0, 30).reverse().map(d => ({ x: d.date.slice(5), y: d.vo2max }))} color="#c084fc" />} />
      </div>
      <DataTable
        columns={[
          { key: 'date', label: '日期' },
          { key: 'hrv', label: 'HRV', render: (v) => v ? `${v} ms` : '—' },
          { key: 'restingHeartRate', label: '静息心率', render: (v) => v ? `${v} bpm` : '—' },
          { key: 'trainingLoad', label: '负荷', render: (v) => v ? Math.round(Number(v)) : '—' },
          { key: 'vo2max', label: 'VO2max', render: (v) => v ? Number(v).toFixed(1) : '—' },
          { key: 'stamina', label: '体力', render: (v) => v != null ? String(v) : '—' },
        ]}
        rows={sorted.slice(0, 30) as unknown as Record<string, unknown>[]}
      />
    </TabShell>
  );
}
