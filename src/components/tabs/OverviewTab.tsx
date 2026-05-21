import { useData } from '../../context/DataContext';
import TabShell from './TabShell';
import MetricCard from '../ui/MetricCard';
import { BarChart, LineChart } from '../charts';

interface Props { active: boolean; onClose: () => void; }

export default function OverviewTab({ active, onClose }: Props) {
  const { summary } = useData();

  return (
    <TabShell active={active} onClose={onClose} title="概览 · 本月摘要">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard title="月度活动" chart={<BarChart data={[]} />} />
        <MetricCard title="月度距离" chart={<LineChart data={[]} />} />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard title="运动类型分布" chart={<BarChart data={[]} />} />
        <MetricCard title="训练负荷" chart={<LineChart data={[]} />} />
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-[0.78rem] text-[#999] leading-relaxed">
        <strong className="text-accent font-semibold">摘要</strong> — {summary.year}年至今共 {summary.totalActivities} 次活动，
        总距离 {(summary.totalDistance / 1000).toFixed(0)} km，
        总时长 {Math.floor(summary.totalDuration / 3600)}h。
      </div>
    </TabShell>
  );
}
