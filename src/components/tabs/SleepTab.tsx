import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import TabShell from './TabShell';
import MetricCard from '../ui/MetricCard';
import { LineChart, PieChart, BarChart } from '../charts';
import DataTable from '../ui/DataTable';

interface Props { active: boolean; onClose: () => void; }

export default function SleepTab({ active, onClose }: Props) {
  const { sleepRecords } = useData();

  const sorted = useMemo(() => [...sleepRecords].sort((a, b) => b.date.localeCompare(a.date)), [sleepRecords]);

  const latest = sorted[0];
  const phaseData = latest ? [
    { name: '深睡眠', value: latest.deepSleepDuration, color: '#4ade80' },
    { name: '浅睡眠', value: latest.lightSleepDuration, color: '#facc15' },
    { name: 'REM', value: latest.remDuration, color: '#38bdf8' },
    { name: '清醒', value: latest.awakeDuration, color: '#f97316' },
  ] : [];

  return (
    <TabShell active={active} onClose={onClose} title="睡眠数据">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard title="睡眠阶段分布" chart={<PieChart data={phaseData} />} />
        <MetricCard title="睡眠质量趋势" chart={<LineChart data={sorted.slice(0, 30).reverse().map(d => ({ x: d.date.slice(5), y: d.qualityScore }))} />} />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard title="睡眠时长 (min)" chart={<BarChart data={sorted.slice(0, 14).reverse().map(d => ({ x: d.date.slice(5), y: d.totalDuration }))} color="#38bdf8" />} />
        <MetricCard title="平均心率" chart={<LineChart data={sorted.slice(0, 14).reverse().map(d => ({ x: d.date.slice(5), y: d.avgHeartRate }))} color="#f97316" />} />
      </div>
      <DataTable
        columns={[
          { key: 'date', label: '日期' },
          { key: 'totalDuration', label: '时长(min)' },
          { key: 'deepSleepDuration', label: '深睡(min)' },
          { key: 'lightSleepDuration', label: '浅睡(min)' },
          { key: 'remDuration', label: 'REM(min)' },
          { key: 'qualityScore', label: '质量', render: (v) => `${v}%` },
        ]}
        rows={sorted.slice(0, 30) as unknown as Record<string, unknown>[]}
      />
    </TabShell>
  );
}
