import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { estimateVO2max, predictRaceTimes, calcEfficiencyIndex, calcMonthlyBests } from '../../lib/analysis';
import { LineChart, BarChart } from '../charts/index';
import MetricCard from '../ui/MetricCard';
import Badge from '../ui/Badge';

function fmtPace(sec: number) {
  if (!sec || sec <= 0) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}'${String(s).padStart(2, '0')}"`;
}

function fmtTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function AbilityPanel() {
  const { activities } = useData();

  const vo2maxResult = useMemo(() => estimateVO2max(activities), [activities]);
  const raceTimes = useMemo(() => vo2maxResult ? predictRaceTimes(vo2maxResult.vo2max) : [], [vo2maxResult]);
  const efficiency = useMemo(() => calcEfficiencyIndex(activities), [activities]);
  const monthlyBests = useMemo(() => calcMonthlyBests(activities), [activities]);
  const last12m = monthlyBests.slice(-12);

  const confidenceBadge = vo2maxResult?.confidence === 'high' ? '较可靠' :
    vo2maxResult?.confidence === 'medium' ? '参考值' : '参考值';

  if (activities.length < 3) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
        <div className="text-[#666] text-sm">数据不足，至少需要 3 条跑步活动才能评估运动能力</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vo2maxResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#666]">估算 VO2max</div>
              <Badge label={confidenceBadge} color={vo2maxResult.confidence === 'high' ? '#4ade80' : '#facc15'} />
            </div>
            <div className="text-4xl font-medium text-[#fafafa] tracking-[-0.03em] mt-2">{vo2maxResult.vo2max}</div>
            <div className="text-[0.65rem] text-[#555] mt-1">基于 {vo2maxResult.sampleCount} 条跑步记录 · 最佳配速 {fmtPace(vo2maxResult.bestPace)}</div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#666] mb-3 text-center">成绩预测</div>
            <div className="grid grid-cols-5 gap-1 text-center">
              {raceTimes.map(r => (
                <div key={r.label}>
                  <div className="text-[0.6rem] text-[#666]">{r.label}</div>
                  <div className="text-[0.82rem] font-medium text-[#fafafa] tabular-nums">{fmtTime(r.time)}</div>
                  <div className="text-[0.58rem] text-[#555]">{fmtPace(r.pace)}/km</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {efficiency.length >= 3 && (
        <MetricCard
          title="配速-心率效率指数（上升 = 体能提升）"
          chart={
            <LineChart
              data={efficiency.slice(-24).map(p => ({ x: p.date.slice(5), y: p.efficiency }))}
              color="#4ade80"
            />
          }
        />
      )}

      {last12m.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <MetricCard
            title="月度最远距离 (km)"
            chart={<BarChart data={last12m.map(m => ({ x: m.month.slice(5), y: Math.round(m.bestDist / 1000) }))} color="#38bdf8" />}
          />
          <MetricCard
            title="月度最大爬升 (m)"
            chart={<BarChart data={last12m.map(m => ({ x: m.month.slice(5), y: Math.round(m.bestAscent) }))} color="#facc15" />}
          />
        </div>
      )}
    </div>
  );
}
