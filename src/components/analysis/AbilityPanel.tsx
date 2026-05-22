import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { estimateVO2max, predictRaceTimes, calcEfficiencyIndex, calcMonthlyBests } from '../../lib/analysis';
import { LineChart, BarChart } from '../charts/index';
import MetricCard from '../ui/MetricCard';
import Badge from '../ui/Badge';
import InfoTip from '../ui/InfoTip';

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

function vo2maxLevel(vo2max: number, gender: 'male' | 'female' = 'male'): string {
  const male = [0, 30, 36, 41, 45, 50, 55, 100];
  const female = [0, 26, 31, 35, 39, 44, 49, 100];
  const table = gender === 'male' ? male : female;
  const labels = ['', '偏低', '一般', '良好', '优秀', '卓越', '精英'];
  for (let i = table.length - 2; i >= 0; i--) {
    if (vo2max >= table[i]) return labels[i];
  }
  return labels[1];
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
  const confidenceColor = vo2maxResult?.confidence === 'high' ? '#4ade80' :
    vo2maxResult?.confidence === 'medium' ? '#facc15' : '#888';

  const hasData = activities.length >= 3;

  return hasData ? (
    <div className="space-y-4">
      {vo2maxResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#999]">估算 VO2max</div>
              <InfoTip term="VO2max（最大摄氧量）">
                指人体在高强度运动中每分钟每公斤体重能摄入的最大氧气量，是衡量有氧耐力的核心指标。
                基于 Jack Daniels VDOT 公式，根据最佳跑步配速估算得出。
                精英跑者通常 55+，普通跑者 35-50。
              </InfoTip>
            </div>
            <div className="text-4xl font-medium text-[#fafafa] tracking-[-0.03em] mt-2">{vo2maxResult.vo2max}</div>
            <div className="text-[0.65rem] text-[#999] mt-1">
              等级：{vo2maxLevel(vo2maxResult.vo2max)}
              <span className="mx-1.5">·</span>
              基于 {vo2maxResult.sampleCount} 条记录
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge label={confidenceBadge} color={confidenceColor} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-center gap-1 mb-3">
              <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#999]">成绩预测</div>
              <InfoTip term="成绩预测">
                基于当前 VO2max 和 Jack Daniels VDOT 跑力表推算各距离完赛时间。
                随训练适应调整，配速会根据不同距离自动修正。仅供参考，实际成绩受天气、地形、状态等因素影响。
              </InfoTip>
            </div>
            <div className="grid grid-cols-5 gap-1 text-center">
              {raceTimes.map(r => (
                <div key={r.label}>
                  <div className="text-[0.6rem] text-[#999]">{r.label}</div>
                  <div className="text-[0.82rem] font-medium text-[#fafafa] tabular-nums">{fmtTime(r.time)}</div>
                  <div className="text-[0.58rem] text-[#888]">{fmtPace(r.pace)}/km</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {efficiency.length >= 3 && (
        <MetricCard
          title={
            <span className="flex items-center gap-1">
              配速-心率效率指数
              <InfoTip term="配速-心率效率指数">
                计算公式：速度(m/s) / 心率 * 100。数值越高表示在同等心率下跑得更快，反映有氧能力提升。
                趋势上升 = 体能改善；趋势下降 = 可能疲劳或状态下滑，需关注恢复。
              </InfoTip>
            </span>
          }
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
  ) : (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
      <div className="text-[#999] text-sm">数据不足，至少需要 3 条跑步活动才能评估运动能力</div>
    </div>
  );
}
