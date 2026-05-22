import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import TabShell from './TabShell';
import FilterBar from './FilterBar';
import MetricCard from '../ui/MetricCard';
import { BarChart, AreaChart, LineChart, ScatterChart, PieChart } from '../charts';
import DataTable from '../ui/DataTable';
import type { ActivitySummary, SportType } from '../../types/coros';
import { SPORT_MAP, SPORT_TYPE_LABELS } from '../../lib/constants';

interface Props { active: boolean; onClose: () => void; }

const SPORT_COLORS: Record<string, string> = {
  running: '#4ade80', trailRunning: '#22c55e', hiking: '#facc15',
  cycling: '#38bdf8', swimming: '#34d399', strength: '#c084fc', other: '#666',
};

function groupByWeek(activities: ActivitySummary[]) {
  const weeks: Record<string, { distance: number; duration: number; count: number; load: number; calories: number; ascent: number; pace: number[]; hr: number[] }> = {};
  activities.forEach(a => {
    const d = new Date(Number(a.startTime) * 1000);
    const weekStart = new Date(d.getTime() - d.getDay() * 86400000).toISOString().slice(0, 10);
    if (!weeks[weekStart]) weeks[weekStart] = { distance: 0, duration: 0, count: 0, load: 0, calories: 0, ascent: 0, pace: [], hr: [] };
    weeks[weekStart].distance += a.totalDistance / 1000;
    weeks[weekStart].duration += a.totalTime / 3600;
    weeks[weekStart].count += 1;
    weeks[weekStart].load += a.trainingLoad;
    weeks[weekStart].calories += a.totalCalories;
    weeks[weekStart].ascent += a.totalAscent;
    if (a.avgPace > 0) weeks[weekStart].pace.push(a.avgPace);
    if (a.avgHeartRate > 0) weeks[weekStart].hr.push(a.avgHeartRate);
  });
  return Object.entries(weeks).map(([week, d]) => ({
    week, distance: d.distance, duration: d.duration, count: d.count, load: d.load,
    calories: d.calories, ascent: d.ascent,
    avgPace: d.pace.length > 0 ? d.pace.reduce((s, v) => s + v, 0) / d.pace.length : 0,
    avgHr: d.hr.length > 0 ? Math.round(d.hr.reduce((s, v) => s + v, 0) / d.hr.length) : 0,
  }));
}

function groupByMonth(activities: ActivitySummary[]) {
  const months: Record<string, { distance: number; duration: number; count: number; calories: number; ascent: number }> = {};
  activities.forEach(a => {
    const d = new Date(Number(a.startTime) * 1000);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months[m]) months[m] = { distance: 0, duration: 0, count: 0, calories: 0, ascent: 0 };
    months[m].distance += a.totalDistance / 1000;
    months[m].duration += a.totalTime / 3600;
    months[m].count += 1;
    months[m].calories += a.totalCalories;
    months[m].ascent += a.totalAscent;
  });
  return Object.entries(months).map(([m, d]) => ({ month: m, ...d }));
}

function sportDistribution(activities: ActivitySummary[]) {
  const dist: Record<string, { count: number; distance: number; name: string }> = {};
  activities.forEach(a => {
    const s = SPORT_MAP[a.sportType];
    const type = s?.type ?? 'other';
    const name = s?.name ?? '其他';
    if (!dist[type]) dist[type] = { count: 0, distance: 0, name };
    dist[type].count += 1;
    dist[type].distance += a.totalDistance;
  });
  return dist;
}

function bestOf(activities: ActivitySummary[]) {
  let bestDist = 0, bestDur = 0, bestAscent = 0, bestPace = Infinity;
  let bestDistName = '', bestDurName = '', bestAscentName = '', bestPaceName = '';
  activities.forEach(a => {
    if (a.totalDistance > bestDist) { bestDist = a.totalDistance; bestDistName = a.name; }
    if (a.totalTime > bestDur) { bestDur = a.totalTime; bestDurName = a.name; }
    if (a.totalAscent > bestAscent) { bestAscent = a.totalAscent; bestAscentName = a.name; }
    if (a.avgPace > 0 && a.avgPace < bestPace && a.totalDistance > 1000) { bestPace = a.avgPace; bestPaceName = a.name; }
  });
  return { bestDist, bestDistName, bestDur, bestDurName, bestAscent, bestAscentName, bestPace, bestPaceName };
}

function fmtDur(s: number) { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h${m}min` : `${m}min`; }
function fmtPace(sec: number) { if (!sec || sec <= 0) return '—'; const m = Math.floor(sec / 60); const s = Math.round(sec % 60); return `${m}'${String(s).padStart(2, '0')}"`; }

export default function TrendTab({ active, onClose }: Props) {
  const { activities } = useData();

  const [sportType, setSportType] = useState<SportType>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedSport, setAppliedSport] = useState<SportType>('all');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  const handleSearch = useCallback(() => {
    setAppliedSport(sportType); setAppliedFrom(dateFrom); setAppliedTo(dateTo);
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
      acts = acts.filter(a => { const ts = Number(a.startTime); return ts >= fromTs && ts < toTs; });
    }
    return acts;
  }, [activities, appliedSport, appliedFrom, appliedTo]);

  const weeks = useMemo(() => groupByWeek(filtered), [filtered]);
  const months = useMemo(() => groupByMonth(filtered), [filtered]);
  const sportDist = useMemo(() => sportDistribution(filtered), [filtered]);
  const best = useMemo(() => bestOf(filtered), [filtered]);
  const last12w = weeks.slice(-12);

  // Scatter: load vs distance
  const scatterData = useMemo(() =>
    filtered.filter(a => a.totalDistance > 0 && a.trainingLoad > 0).map(a => ({
      x: a.totalDistance / 1000, y: a.trainingLoad, label: a.name,
    })), [filtered]);

  return (
    <TabShell active={active} onClose={onClose} title="训练分析">
      <FilterBar sportType={sportType} onSportChange={setSportType} dateFrom={dateFrom} onDateFromChange={setDateFrom}
        dateTo={dateTo} onDateToChange={setDateTo} onSearch={handleSearch} onReset={handleReset} />
      <div className="mt-1 text-[0.68rem] text-[#555]">显示 {filtered.length} 条活动</div>

      {/* 个人最佳 */}
      {filtered.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#666]">最长距离</div>
            <div className="text-xl font-medium text-[#fafafa] mt-1">{(best.bestDist / 1000).toFixed(1)}<span className="text-[0.7rem] text-[#666] ml-0.5">km</span></div>
            <div className="text-[0.65rem] text-[#555] mt-1 truncate">{best.bestDistName}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#666]">最长时间</div>
            <div className="text-xl font-medium text-[#fafafa] mt-1">{fmtDur(best.bestDur)}</div>
            <div className="text-[0.65rem] text-[#555] mt-1 truncate">{best.bestDurName}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#666]">最大爬升</div>
            <div className="text-xl font-medium text-[#fafafa] mt-1">{best.bestAscent}<span className="text-[0.7rem] text-[#666] ml-0.5">m</span></div>
            <div className="text-[0.65rem] text-[#555] mt-1 truncate">{best.bestAscentName}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#666]">最佳配速</div>
            <div className="text-xl font-medium text-[#fafafa] mt-1">{fmtPace(best.bestPace)}</div>
            <div className="text-[0.65rem] text-[#555] mt-1 truncate">{best.bestPaceName}</div>
          </div>
        </div>
      )}

      {/* 运动类型分布 */}
      {Object.keys(sportDist).length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <MetricCard title="运动类型分布（次数）"
            chart={<PieChart data={Object.entries(sportDist).map(([k, v]) => ({
              name: SPORT_TYPE_LABELS[k as SportType] ?? v.name,
              value: v.count, color: SPORT_COLORS[k] ?? '#666',
            }))} />}
          />
          <MetricCard title="运动类型分布（距离）"
            chart={<PieChart data={Object.entries(sportDist).filter(([, v]) => v.distance > 0).map(([k, v]) => ({
              name: SPORT_TYPE_LABELS[k as SportType] ?? v.name,
              value: Math.round(v.distance / 1000), color: SPORT_COLORS[k] ?? '#666',
            }))} />}
          />
        </div>
      )}

      {/* 月度对比 */}
      {months.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <MetricCard title="月度距离对比 (km)" chart={<BarChart data={months.map(m => ({ x: m.month, y: Math.round(m.distance) }))} color="#4ade80" />} />
          <MetricCard title="月度时长对比 (h)" chart={<BarChart data={months.map(m => ({ x: m.month, y: Math.round(m.duration) }))} color="#38bdf8" />} />
        </div>
      )}

      {/* 每周趋势 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <MetricCard title="每周距离趋势 (km)" chart={<BarChart data={last12w.map(w => ({ x: w.week.slice(5), y: Math.round(w.distance) }))} />} />
        <MetricCard title="每周时长趋势 (h)" chart={<AreaChart data={last12w.map(w => ({ x: w.week.slice(5), y: Math.round(w.duration) }))} area />} />
      </div>

      {/* 进阶指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <MetricCard title="每周爬升 (m)" chart={<BarChart data={last12w.map(w => ({ x: w.week.slice(5), y: Math.round(w.ascent) }))} color="#facc15" />} />
        <MetricCard title="每周热量 (kcal)" chart={<AreaChart data={last12w.map(w => ({ x: w.week.slice(5), y: Math.round(w.calories) }))} color="#f97316" area />} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <MetricCard title="训练负荷趋势" chart={<LineChart data={last12w.map(w => ({ x: w.week.slice(5), y: Math.round(w.load) }))} />} />
        <MetricCard title="活动次数" chart={<BarChart data={last12w.map(w => ({ x: w.week.slice(5), y: w.count }))} color="#c084fc" />} />
      </div>

      {/* 配速与心率趋势 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <MetricCard title="每周平均配速 (min/km)"
          chart={<LineChart
            data={last12w.filter(w => w.avgPace > 0).map(w => ({ x: w.week.slice(5), y: Math.round(w.avgPace / 60 * 10) / 10 }))}
            color="#facc15"
          />}
        />
        <MetricCard title="每周平均心率 (bpm)"
          chart={<LineChart
            data={last12w.filter(w => w.avgHr > 0).map(w => ({ x: w.week.slice(5), y: w.avgHr }))}
            color="#f97316"
          />}
        />
      </div>

      {/* 训练负荷 vs 距离散点图 */}
      {scatterData.length > 5 && (
        <div className="mt-4">
          <MetricCard title="训练负荷 vs 距离（每条活动）"
            chart={<ScatterChart data={scatterData} xLabel="距离(km)" yLabel="训练负荷" color="#4ade80" />}
          />
        </div>
      )}

      {/* Data table */}
      <div className="mt-4">
        <DataTable
          columns={[
            { key: 'week', label: '周' },
            { key: 'distance', label: '距离(km)', render: (v) => Number(v).toFixed(1) },
            { key: 'duration', label: '时长(h)', render: (v) => Number(v).toFixed(1) },
            { key: 'calories', label: '热量(kcal)', render: (v) => Math.round(Number(v)) },
            { key: 'ascent', label: '爬升(m)', render: (v) => Math.round(Number(v)) },
            { key: 'count', label: '活动' },
            { key: 'load', label: '负荷', render: (v) => Math.round(Number(v)) },
            { key: 'avgHr', label: '心率', render: (v) => Number(v) > 0 ? Math.round(Number(v)) : '—' },
          ]}
          rows={last12w.reverse() as unknown as Record<string, unknown>[]}
        />
      </div>
    </TabShell>
  );
}
