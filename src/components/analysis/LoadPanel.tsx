import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
  aggregateDailyLoads, calcACWR, getACWRStatus,
  classifyIntensityZones, calcRecoveryStatus,
} from '../../lib/analysis';
import { LineChart, AreaChart, PieChart } from '../charts/index';
import MetricCard from '../ui/MetricCard';
import InfoTip from '../ui/InfoTip';

export default function LoadPanel() {
  const { activities } = useData();

  const dailyLoads = useMemo(() => aggregateDailyLoads(activities), [activities]);
  const acwrData = useMemo(() => calcACWR(dailyLoads), [dailyLoads]);
  const intensityZones = useMemo(() => classifyIntensityZones(activities), [activities]);
  const recovery = useMemo(() => calcRecoveryStatus(activities), [activities]);

  const weeklyLoads = useMemo(() => {
    const weeks: Record<string, number> = {};
    activities.forEach(a => {
      const d = new Date(Number(a.startTime) * 1000);
      const weekStart = new Date(d.getTime() - d.getDay() * 86400000).toISOString().slice(0, 10);
      weeks[weekStart] = (weeks[weekStart] || 0) + a.trainingLoad;
    });
    return Object.entries(weeks)
      .map(([week, load]) => ({ week, load: Math.round(load) }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }, [activities]);

  const last12w = weeklyLoads.slice(-12);
  const latestACWR = acwrData.length > 0 ? acwrData[acwrData.length - 1] : null;
  const acwrStatus = latestACWR ? getACWRStatus(latestACWR.ratio) : null;

  const hasData = activities.length >= 28;

  return hasData ? (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {latestACWR && acwrStatus && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center">
            <div className="flex items-center justify-center gap-1">
              <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#666]">急慢性负荷比</div>
              <InfoTip term="ACWR（急慢性负荷比）">
                ACWR = 近7天总负荷（急性）÷ 近28天周均负荷（慢性）。
                {'<0.8'} 训练不足；0.8-1.3 最佳区间；1.3-1.5 偏高需注意；{'>1.5'} 过度训练风险。
                研究表明 ACWR {'>1.5'} 时受伤风险显著增加。
              </InfoTip>
            </div>
            <div className="text-3xl font-medium mt-2" style={{ color: acwrStatus.color }}>{latestACWR.ratio.toFixed(2)}</div>
            <div className="text-[0.65rem] mt-1" style={{ color: acwrStatus.color }}>{acwrStatus.label}</div>
            <div className="text-[0.6rem] text-[#555] mt-1">7天负荷 {latestACWR.acute} · 28天均荷 {latestACWR.chronic}</div>
          </div>
        )}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center">
          <div className="flex items-center justify-center gap-1">
            <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#666]">恢复状态</div>
            <InfoTip term="恢复状态">
              基于近3天训练负荷按时间衰减（当日70%、昨日30%、前日10%）加权计算。
              剩余负荷越低，身体恢复越充分。建议高强度训练前确保恢复状态 ≥ 80%。
            </InfoTip>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{
              width: `${recovery.score}%`,
              background: recovery.color,
            }} />
          </div>
          <div className="text-xl font-medium mt-1.5" style={{ color: recovery.color }}>{recovery.label}</div>
          <div className="text-[0.6rem] text-[#555]">剩余负荷 {recovery.remainingFatigue}</div>
        </div>
      </div>

      {acwrData.length >= 4 && (
        <MetricCard
          title={
            <span className="flex items-center gap-1">
              ACWR 周趋势
              <InfoTip term="ACWR 趋势图">
                展示每周急慢性负荷比的波动。稳定在绿色区间（0.8-1.3）表示训练安排科学合理。
                持续走高应警惕，突然飙升提示短期内训练量增加过快。
              </InfoTip>
            </span>
          }
          chart={
            <LineChart
              data={acwrData.slice(-16).map(p => ({ x: p.week.slice(5), y: p.ratio }))}
              color="#38bdf8"
            />
          }
        />
      )}

      {last12w.length >= 2 && (
        <MetricCard
          title="周训练负荷趋势"
          chart={<AreaChart data={last12w.map(w => ({ x: w.week.slice(5), y: w.load }))} color="#c084fc" area />}
        />
      )}

      {intensityZones.length > 0 && intensityZones.some(z => z.count > 0) && (
        <MetricCard
          title={
            <span className="flex items-center gap-1">
              训练强度分布（跑步）
              <InfoTip term="训练强度分布">
                基于每次跑步配速与个人最佳配速的比值划分区间。
                轻松跑（{'>75%'}最佳配速）、节奏跑（75%-88%）、间歇跑（88%-97%）、冲刺跑（{'<97%'}）。
                建议遵循 80/20 原则：80% 低强度 + 20% 中高强度。
              </InfoTip>
            </span>
          }
          chart={
            <PieChart
              data={intensityZones.filter(z => z.count > 0).map(z => ({
                name: `${z.zone} ${z.percent}%`,
                value: z.count,
                color: z.color,
              }))}
            />
          }
        />
      )}
    </div>
  ) : (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
      <div className="text-[#666] text-sm">数据不足，至少需要 28 天活动数据才能分析训练负荷</div>
    </div>
  );
}
