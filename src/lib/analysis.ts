import type { ActivitySummary } from '../types/coros';

// ========== VO2max 估算 (Jack Daniels VDOT) ==========

interface VO2maxResult {
  vo2max: number;
  confidence: 'low' | 'medium' | 'high';
  sampleCount: number;
  bestDistance: number;
  bestPace: number;
}

function paceToVO2max(paceSecPerKm: number, distanceM: number): number {
  const velocity = 1000 / paceSecPerKm * 60;
  const factor = distanceM >= 15000 ? 1.0 : distanceM >= 10000 ? 0.98 : distanceM >= 5000 ? 0.96 : 0.92;
  const raw = -4.60 + 0.182258 * velocity + 0.000104 * velocity * velocity;
  return Math.round(raw * factor * 10) / 10;
}

export function estimateVO2max(activities: ActivitySummary[]): VO2maxResult | null {
  const running = activities.filter(a =>
    [100, 101, 102].includes(a.sportType) && a.totalDistance >= 1500 && a.avgPace > 0
  );
  if (running.length < 3) return null;

  const estimates = running
    .map(a => ({ vo2max: paceToVO2max(a.avgPace, a.totalDistance), dist: a.totalDistance }))
    .sort((a, b) => b.vo2max - a.vo2max);

  const topN = estimates.slice(0, Math.min(5, estimates.length));
  const median = topN[Math.floor(topN.length / 2)].vo2max;
  const best = estimates[0];

  return {
    vo2max: median,
    confidence: running.length >= 30 ? 'high' : running.length >= 10 ? 'medium' : 'low',
    sampleCount: running.length,
    bestDistance: best.dist,
    bestPace: running.reduce((min, a) => a.avgPace > 0 && a.avgPace < min ? a.avgPace : min, Infinity),
  };
}

// ========== 成绩预测 ==========

interface RacePrediction {
  distance: number;
  label: string;
  time: number;
  pace: number;
}

const RACE_DISTANCES = [
  { dist: 1600, label: '1.6K' },
  { dist: 5000, label: '5K' },
  { dist: 10000, label: '10K' },
  { dist: 21097, label: '半马' },
  { dist: 42195, label: '全马' },
];

function vo2maxToTime(vo2max: number, targetDistanceM: number): number {
  const d = targetDistanceM / 1000;
  const factor = d >= 42 ? 0.94 : d >= 21 ? 0.96 : d >= 10 ? 0.98 : d >= 5 ? 0.99 : 1.0;
  const adjustedVDOT = vo2max / factor;
  const a = 0.000104, b = 0.182258, c = -4.60 - adjustedVDOT;
  const v = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  const paceSecPerKm = 1000 / v * 60;
  return Math.round(targetDistanceM / 1000 * paceSecPerKm);
}

export function predictRaceTimes(vo2max: number): RacePrediction[] {
  return RACE_DISTANCES.map(({ dist, label }) => {
    const time = vo2maxToTime(vo2max, dist);
    return { distance: dist, label, time, pace: Math.round(1000 * time / dist) };
  });
}

// ========== 配速-心率效率指数 ==========

interface EfficiencyPoint {
  date: string;
  efficiency: number;
  pace: number;
  hr: number;
}

export function calcEfficiencyIndex(activities: ActivitySummary[]): EfficiencyPoint[] {
  return activities
    .filter(a => [100, 101, 102].includes(a.sportType) && a.avgPace > 0 && a.avgHeartRate > 60)
    .map(a => {
      const speedMs = 1000 / a.avgPace;
      return {
        date: new Date(Number(a.startTime) * 1000).toISOString().slice(0, 10),
        efficiency: Math.round(speedMs / a.avgHeartRate * 100 * 100) / 100,
        pace: a.avgPace,
        hr: a.avgHeartRate,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ========== 急慢性负荷比 (ACWR) ==========

interface ACWRPoint {
  week: string;
  acute: number;
  chronic: number;
  ratio: number;
}

export function calcACWR(dailyLoads: { date: string; load: number }[]): ACWRPoint[] {
  if (dailyLoads.length < 28) return [];

  const points: ACWRPoint[] = [];
  for (let i = 27; i < dailyLoads.length; i++) {
    const acute = dailyLoads.slice(i - 6, i + 1).reduce((s, d) => s + d.load, 0);
    const chronic = dailyLoads.slice(i - 27, i + 1).reduce((s, d) => s + d.load, 0) / 4;
    points.push({
      week: dailyLoads[i].date,
      acute: Math.round(acute),
      chronic: Math.round(chronic),
      ratio: chronic > 0 ? Math.round(acute / chronic * 100) / 100 : 0,
    });
  }
  return points;
}

export function getACWRStatus(ratio: number): { label: string; color: string } {
  if (ratio < 0.8) return { label: '训练不足', color: '#666' };
  if (ratio <= 1.3) return { label: '合理范围', color: '#4ade80' };
  if (ratio <= 1.5) return { label: '偏高，注意恢复', color: '#facc15' };
  return { label: '过度训练风险', color: '#ef4444' };
}

// ========== 训练强度分布 ==========

interface IntensityZone {
  zone: string;
  color: string;
  count: number;
  percent: number;
}

export function classifyIntensityZones(activities: ActivitySummary[]): IntensityZone[] {
  const runs = activities.filter(a => [100, 101, 102].includes(a.sportType) && a.avgPace > 0);
  if (runs.length === 0) return [];

  const bestPace = runs.reduce((min, a) => a.avgPace < min ? a.avgPace : min, Infinity);

  const zones = [
    { zone: '轻松跑', color: '#4ade80', minPct: 0, maxPct: 0.75, count: 0 },
    { zone: '节奏跑', color: '#38bdf8', minPct: 0.75, maxPct: 0.88, count: 0 },
    { zone: '间歇跑', color: '#facc15', minPct: 0.88, maxPct: 0.97, count: 0 },
    { zone: '冲刺跑', color: '#ef4444', minPct: 0.97, maxPct: Infinity, count: 0 },
  ];

  runs.forEach(a => {
    const ratio = bestPace / a.avgPace;
    const zone = zones.find(z => ratio >= z.minPct && ratio < z.maxPct);
    if (zone) zone.count++;
  });

  return zones.map(z => ({ ...z, percent: runs.length > 0 ? Math.round(z.count / runs.length * 100) : 0 }));
}

// ========== 恢复状态估算 ==========

interface RecoveryStatus {
  score: number;
  label: string;
  color: string;
  remainingFatigue: number;
}

export function calcRecoveryStatus(activities: ActivitySummary[]): RecoveryStatus {
  const now = Math.floor(Date.now() / 1000);
  const recentLoads = activities
    .filter(a => {
      const ts = Number(a.startTime);
      return now - ts < 3 * 86400;
    })
    .map(a => {
      const daysAgo = (now - Number(a.startTime)) / 86400;
      const decay = daysAgo <= 1 ? 0.7 : daysAgo <= 2 ? 0.3 : 0.1;
      return a.trainingLoad * decay;
    });

  const totalFatigue = recentLoads.reduce((s, l) => s + l, 0);
  const maxDailyLoad = Math.max(...activities.slice(0, 30).map(a => a.trainingLoad), 50);
  const remaining = Math.max(0, totalFatigue);
  const score = Math.max(0, Math.min(100, Math.round(100 - (remaining / maxDailyLoad) * 100)));

  let label: string;
  let color: string;
  if (score >= 80) { label = '已恢复'; color = '#4ade80'; }
  else if (score >= 50) { label = '基本恢复'; color = '#facc15'; }
  else { label = '需要休息'; color = '#ef4444'; }

  return { score, label, color, remainingFatigue: Math.round(remaining) };
}

// ========== 周度训练建议 ==========

interface WeeklySuggestion {
  targetDistance: number;
  targetFrequency: number;
  easyPercent: number;
  intensityPercent: number;
  note: string;
}

export function generateWeeklySuggestion(activities: ActivitySummary[], acwr: number): WeeklySuggestion {
  const now = Math.floor(Date.now() / 1000);
  const fourWeeksAgo = now - 28 * 86400;
  const recent = activities.filter(a => Number(a.startTime) >= fourWeeksAgo);

  const weeklyDist = recent.reduce((s, a) => s + a.totalDistance, 0) / 4 / 1000;
  const weeklyFreq = Math.round(recent.length / 4);

  const reduction = acwr > 1.5 ? 0.7 : acwr > 1.3 ? 0.85 : 1.0;

  return {
    targetDistance: Math.round(weeklyDist * Math.min(1.1, 1.0 / reduction) * 10) / 10,
    targetFrequency: Math.max(3, weeklyFreq + (acwr > 1.3 ? -1 : 1)),
    easyPercent: 80,
    intensityPercent: 20,
    note: acwr > 1.5 ? '负荷偏高，建议本周减量30%' :
          acwr > 1.3 ? '负荷略高，建议本周减量15%' :
          acwr < 0.5 ? '可适度增加训练量（不超过10%）' :
          '维持当前训练量，渐进增加不超过10%',
  };
}

// ========== 综合状态评估 ==========

interface StatusSummary {
  status: 'improving' | 'stable' | 'declining' | 'insufficient';
  label: string;
  detail: string;
}

export function getStatusSummary(
  efficiency: EfficiencyPoint[],
  acwr: number,
  recentFreq: number,
): StatusSummary {
  const half = Math.floor(efficiency.length / 2);
  const firstHalf = efficiency.slice(0, half);
  const secondHalf = efficiency.slice(half);
  const avgEff1 = firstHalf.length > 0 ? firstHalf.reduce((s, p) => s + p.efficiency, 0) / firstHalf.length : 0;
  const avgEff2 = secondHalf.length > 0 ? secondHalf.reduce((s, p) => s + p.efficiency, 0) / secondHalf.length : 0;
  const effChange = avgEff1 > 0 ? (avgEff2 - avgEff1) / avgEff1 : 0;

  if (recentFreq < 1) {
    return { status: 'insufficient', label: '近期训练不足', detail: '建议每周至少运动2-3次以维持体能' };
  }
  if (acwr > 1.5) {
    return { status: 'declining', label: '训练负荷过高', detail: '过度训练风险，建议立即减量并增加休息' };
  }
  if (effChange > 0.03 && acwr <= 1.3) {
    return { status: 'improving', label: '运动能力在提升', detail: '近4周训练稳定，配速-心率效率持续改善，保持当前节奏' };
  }
  if (effChange < -0.03 && efficiency.length >= 8) {
    return { status: 'declining', label: '运动能力有下降', detail: '效率指数下降，建议检查恢复是否充足或调整训练强度' };
  }
  return { status: 'stable', label: '训练状态稳定', detail: '各项指标平稳，可适当增加训练强度刺激进步' };
}

// ========== 日负荷聚合 ==========

export function aggregateDailyLoads(activities: ActivitySummary[]): { date: string; load: number }[] {
  const map: Record<string, number> = {};
  activities.forEach(a => {
    const date = new Date(Number(a.startTime) * 1000).toISOString().slice(0, 10);
    map[date] = (map[date] || 0) + a.trainingLoad;
  });
  return Object.entries(map)
    .map(([date, load]) => ({ date, load }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ========== 交叉训练分析 ==========

export function calcSportDistribution(activities: ActivitySummary[]): Record<string, { name: string; count: number; percent: number }> {
  const dist: Record<string, { name: string; count: number }> = {};
  activities.forEach(a => {
    const typeKey = a.sportType === 100 || a.sportType === 101 || a.sportType === 102 ? 'running' :
                    a.sportType === 104 || a.sportType === 105 ? 'hiking' :
                    a.sportType === 200 || a.sportType === 201 ? 'cycling' :
                    a.sportType === 301 || a.sportType === 302 ? 'swimming' :
                    a.sportType === 400 ? 'strength' : 'other';
    if (!dist[typeKey]) dist[typeKey] = { name: typeKey, count: 0 };
    dist[typeKey].count++;
  });
  const total = activities.length;
  return Object.fromEntries(
    Object.entries(dist).map(([k, v]) => [k, { ...v, percent: Math.round(v.count / total * 100) }])
  );
}

// ========== 历史月度最佳 ==========

export function calcMonthlyBests(activities: ActivitySummary[]) {
  const months: Record<string, { bestDist: number; bestAscent: number; bestDuration: number; count: number }> = {};
  activities.forEach(a => {
    const d = new Date(Number(a.startTime) * 1000);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months[m]) months[m] = { bestDist: 0, bestAscent: 0, bestDuration: 0, count: 0 };
    if (a.totalDistance > months[m].bestDist) months[m].bestDist = a.totalDistance;
    if (a.totalAscent > months[m].bestAscent) months[m].bestAscent = a.totalAscent;
    if (a.totalTime > months[m].bestDuration) months[m].bestDuration = a.totalTime;
    months[m].count++;
  });
  return Object.entries(months)
    .map(([m, d]) => ({ month: m, ...d }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
