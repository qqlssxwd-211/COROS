import TabShell from '../tabs/TabShell';
import { SPORT_MAP } from '../../lib/constants';
import type { ActivitySummary } from '../../types/coros';

interface Props { activity: ActivitySummary | null; onClose: () => void; }

function fmtTime(s: number) {
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

function MetricBlock({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 md:p-4 text-center">
      <div className="text-lg md:text-xl font-medium text-[#fafafa]">{value}<span className="text-[0.7rem] text-[#666] ml-0.5">{unit}</span></div>
      <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#666] mt-1">{label}</div>
    </div>
  );
}

export default function ActivityDetail({ activity, onClose }: Props) {
  if (!activity) return null;
  const sport = SPORT_MAP[activity.sportType] ?? { name: '未知运动', color: '#666' };

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

      {/* Primary metrics */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-2 md:mb-3">
        <MetricBlock label="距离" value={(activity.totalDistance / 1000).toFixed(2)} unit="km" />
        <MetricBlock label="时长" value={fmtTime(activity.totalTime)} unit="" />
        <MetricBlock label="配速" value={fmtPace(activity.avgPace)} unit="/km" />
        <MetricBlock label="心率" value={activity.avgHeartRate > 0 ? String(activity.avgHeartRate) : '—'} unit="bpm" />
        <MetricBlock label="消耗" value={activity.totalCalories > 0 ? String(activity.totalCalories) : '—'} unit="kcal" />
        <MetricBlock label="负荷" value={activity.trainingLoad > 0 ? String(activity.trainingLoad) : '—'} unit="" />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mb-4 md:mb-5">
        <MetricBlock label="爬升" value={activity.totalAscent > 0 ? String(activity.totalAscent) : '—'} unit="m" />
        <MetricBlock label="下降" value={activity.descent ? String(activity.descent) : '—'} unit="m" />
        <MetricBlock label="步频" value={activity.avgCadence ? String(activity.avgCadence) : '—'} unit="spm" />
        <MetricBlock label="均速" value={activity.avgSpeed ? (activity.avgSpeed / 100).toFixed(1) : '—'} unit="m/s" />
        <MetricBlock label="极速" value={activity.maxSpeed ? (activity.maxSpeed / 100).toFixed(1) : '—'} unit="m/s" />
        <MetricBlock label="步数" value={activity.step ? String(activity.step) : '—'} unit="步" />
      </div>

      {/* Time & duration detail */}
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

      {/* No detail note */}
      <p className="text-[0.68rem] text-[#555] text-center mt-4 font-[family-name:var(--font-text)]">
        * 详细分段数据（圈速、心率区间、海拔曲线）需 COROS 官方开放接口后支持
      </p>
    </TabShell>
  );
}
