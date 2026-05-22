import TabShell from '../tabs/TabShell';
import { SPORT_MAP } from '../../lib/constants';
import type { ActivitySummary } from '../../types/coros';

interface Props { activity: ActivitySummary | null; onClose: () => void; }

function fmtTime(s: number) {
  if (!s || s <= 0) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

function fmtPace(secPerKm: number) {
  if (!secPerKm || secPerKm <= 0) return '—';
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}'${String(sec).padStart(2, '0')}"`;
}

function fmtDate(ts: string) {
  const d = new Date(Number(ts) * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function fmtSpeed(ms: number | undefined): string {
  if (!ms || ms <= 0) return '—';
  return (ms * 3.6).toFixed(1);
}

function MetricBlock({ label, value, unit, highlight }: { label: string; value: string; unit: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 md:p-4 text-center ${highlight ? 'border-accent/30 bg-accent/[0.04]' : 'border-white/5 bg-white/[0.02]'}`}>
      <div className="text-lg md:text-xl font-medium text-[#fafafa]">{value}<span className="text-[0.7rem] text-[#666] ml-0.5">{unit}</span></div>
      <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#666] mt-1">{label}</div>
    </div>
  );
}

export default function ActivityDetail({ activity, onClose }: Props) {
  if (!activity) return null;
  const sport = SPORT_MAP[activity.sportType] ?? { name: '未知运动', color: '#666' };
  const st = activity.sportType;
  const isHike = st === 104 || st === 105;
  const isRun = st === 100 || st === 101 || st === 102;
  const isSwim = st === 301 || st === 302;
  const isCycle = st === 200 || st === 201;
  const isStrength = st === 400;

  // Elevation per km
  const elevPerKm = activity.totalDistance > 0
    ? Math.round(activity.totalAscent / (activity.totalDistance / 1000))
    : 0;

  // Calories per hour
  const calPerHr = activity.totalTime > 0
    ? Math.round(activity.totalCalories / (activity.totalTime / 3600))
    : 0;

  // Average speed in km/h
  const avgKmh = activity.totalTime > 0
    ? ((activity.totalDistance / 1000) / (activity.totalTime / 3600)).toFixed(1)
    : '—';

  // Max pace
  const maxPace = activity.best ? fmtPace(1000 / (Number(activity.best) / 100)) : '—';

  return (
    <TabShell active={!!activity} onClose={onClose} title="">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="w-3 h-3 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ background: sport.color }} />
        <div>
          <div className="text-lg font-medium tracking-[-0.01em]">{activity.name || '未命名活动'}</div>
          <div className="text-[0.73rem] text-[#666] mt-1">
            {fmtDate(activity.startTime)} · {sport.name}{activity.device ? ` · ${activity.device}` : ''}
          </div>
        </div>
      </div>

      {/* Route image from COROS */}
      {activity.imageUrl && (
        <div className="mb-5 rounded-2xl overflow-hidden border border-white/8">
          <img src={activity.imageUrl} alt="活动路线" className="w-full h-48 md:h-64 object-cover" loading="lazy" />
          <div className="bg-white/[0.02] px-4 py-2 text-[0.68rem] text-[#555]">活动路线图</div>
        </div>
      )}

      {/* Primary metrics */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-2 md:mb-3">
        <MetricBlock label="距离" value={(activity.totalDistance / 1000).toFixed(2)} unit="km" highlight />
        <MetricBlock label="时长" value={fmtTime(activity.totalTime)} unit="" highlight />
        <MetricBlock label="配速" value={fmtPace(activity.avgPace)} unit="/km" />
        <MetricBlock label="心率" value={activity.avgHeartRate > 0 ? String(activity.avgHeartRate) : '—'} unit="bpm" />
        <MetricBlock label="消耗" value={activity.totalCalories > 0 ? String(Math.round(activity.totalCalories)) : '—'} unit="kcal" />
        <MetricBlock label="负荷" value={activity.trainingLoad > 0 ? String(activity.trainingLoad) : '—'} unit="" />
      </div>

      {/* Speed & elevation metrics */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-2 md:mb-3">
        <MetricBlock label="均速" value={fmtSpeed(activity.avgSpeed)} unit="km/h" />
        <MetricBlock label="极速" value={fmtSpeed(activity.maxSpeed)} unit="km/h" />
        <MetricBlock label="最佳配速" value={maxPace} unit="/km" />
        <MetricBlock label="爬升" value={activity.totalAscent > 0 ? String(activity.totalAscent) : '—'} unit="m" />
        <MetricBlock label="下降" value={activity.totalDescent || activity.descent ? String(activity.totalDescent || activity.descent) : '—'} unit="m" />
        <MetricBlock label="升/公里" value={elevPerKm > 0 ? String(elevPerKm) : '—'} unit="m/km" />
      </div>

      {/* Sport-specific metrics */}
      {(isHike || isRun) && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-2 md:mb-3">
          <MetricBlock label="步频" value={activity.avgCadence ? String(activity.avgCadence) : '—'} unit="spm" />
          <MetricBlock label="步数" value={activity.step ? String(activity.step) : '—'} unit="步" />
          <MetricBlock label="热量/时" value={calPerHr > 0 ? String(calPerHr) : '—'} unit="kcal/h" />
          <MetricBlock label="最大坡度" value={activity.maxSlope ? `${activity.maxSlope}%` : '—'} unit="" />
          <MetricBlock label="下坡距离" value={activity.downhillDist ? (activity.downhillDist / 1000).toFixed(1) : '—'} unit="km" />
          <MetricBlock label="下坡时长" value={activity.downhillTime ? fmtTime(activity.downhillTime) : '—'} unit="" />
        </div>
      )}

      {isCycle && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-2 md:mb-3">
          <MetricBlock label="功率" value={activity.avgPower ? String(activity.avgPower) : '—'} unit="W" />
          <MetricBlock label="NP" value={activity.np ? String(activity.np) : '—'} unit="W" />
          <MetricBlock label="踏频" value={activity.avgCadence ? String(activity.avgCadence) : '—'} unit="rpm" />
          <MetricBlock label="热量/时" value={calPerHr > 0 ? String(calPerHr) : '—'} unit="kcal/h" />
          <MetricBlock label="最大坡度" value={activity.maxSlope ? `${activity.maxSlope}%` : '—'} unit="" />
          <MetricBlock label="下坡距离" value={activity.downhillDist ? (activity.downhillDist / 1000).toFixed(1) : '—'} unit="km" />
        </div>
      )}

      {isSwim && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-2 md:mb-3">
          <MetricBlock label="SWOLF" value={activity.swolf ? String(activity.swolf) : '—'} unit="" />
          <MetricBlock label="划频" value={activity.avgStrkRate ? String(activity.avgStrkRate) : '—'} unit="次/分" />
          <MetricBlock label="趟数" value={activity.lengths ? String(activity.lengths) : '—'} unit="趟" />
          <MetricBlock label="水温" value={activity.waterTemperature ? `${activity.waterTemperature.toFixed(1)}°C` : '—'} unit="" />
          <MetricBlock label="热量/时" value={calPerHr > 0 ? String(calPerHr) : '—'} unit="kcal/h" />
          <MetricBlock label="最佳百米" value={activity.best ? (activity.best > 1000 ? '—' : `${(100 / (activity.best / 100)).toFixed(1)}s`) : '—'} unit="" />
        </div>
      )}

      {isStrength && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-2 md:mb-3">
          <MetricBlock label="组数" value={activity.sets ? String(activity.sets) : '—'} unit="组" />
          <MetricBlock label="总次数" value={activity.totalReps ? String(activity.totalReps) : '—'} unit="次" />
          <MetricBlock label="热量/时" value={calPerHr > 0 ? String(calPerHr) : '—'} unit="kcal/h" />
          <MetricBlock label="体温" value={activity.bodyTemperature ? `${activity.bodyTemperature.toFixed(1)}°C` : '—'} unit="" />
          <MetricBlock label="时长" value={fmtTime(activity.totalTime)} unit="" />
          <MetricBlock label="负荷" value={activity.trainingLoad > 0 ? String(activity.trainingLoad) : '—'} unit="" />
        </div>
      )}

      {/* Time details */}
      {activity.endTime && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-4">
          <div className="text-[0.7rem] uppercase tracking-[0.06em] text-[#666] mb-3">时间详情</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div>
              <div className="text-[0.68rem] text-[#666] mb-0.5">开始时间</div>
              <div className="text-[0.85rem] text-[#e0e0e0]">{fmtDate(activity.startTime)}</div>
            </div>
            <div>
              <div className="text-[0.68rem] text-[#666] mb-0.5">结束时间</div>
              <div className="text-[0.85rem] text-[#e0e0e0]">{fmtDate(activity.endTime)}</div>
            </div>
            <div>
              <div className="text-[0.68rem] text-[#666] mb-0.5">活动时长</div>
              <div className="text-[0.85rem] text-[#e0e0e0]">{fmtTime(activity.totalTime)}</div>
            </div>
            <div>
              <div className="text-[0.68rem] text-[#666] mb-0.5">运动时长</div>
              <div className="text-[0.85rem] text-[#e0e0e0]">{activity.workoutTime ? fmtTime(activity.workoutTime) : '—'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-4">
        <div className="text-[0.7rem] uppercase tracking-[0.06em] text-[#666] mb-3">活动概要</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-[0.82rem]">
          <div className="flex justify-between"><span className="text-[#666]">平均速度</span><span className="text-[#e0e0e0]">{avgKmh} km/h</span></div>
          <div className="flex justify-between"><span className="text-[#666]">运动类型</span><span className="text-[#e0e0e0]">{sport.name}</span></div>
          <div className="flex justify-between"><span className="text-[#666]">设备</span><span className="text-[#e0e0e0]">{activity.device || '—'}</span></div>
          {activity.cadence ? <div className="flex justify-between"><span className="text-[#666]">平均步频</span><span className="text-[#e0e0e0]">{activity.cadence} spm</span></div> : null}
          {elevPerKm > 0 && <div className="flex justify-between"><span className="text-[#666]">爬升率</span><span className="text-[#e0e0e0]">{elevPerKm} m/km</span></div>}
          <div className="flex justify-between"><span className="text-[#666]">热量消耗</span><span className="text-[#e0e0e0]">{Math.round(activity.totalCalories)} kcal</span></div>
          {calPerHr > 0 && <div className="flex justify-between"><span className="text-[#666]">燃脂效率</span><span className="text-[#e0e0e0]">{calPerHr} kcal/h</span></div>}
          <div className="flex justify-between"><span className="text-[#666]">训练负荷</span><span className="text-[#e0e0e0]">{activity.trainingLoad || '—'}</span></div>
        </div>
      </div>
    </TabShell>
  );
}
