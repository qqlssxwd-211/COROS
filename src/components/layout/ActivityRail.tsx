import type { ActivitySummary } from '../../types/coros';
import { SPORT_MAP } from '../../lib/constants';

interface Props {
  activities: ActivitySummary[];
  onSelect: (activity: ActivitySummary) => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

export default function ActivityRail({ activities, onSelect }: Props) {
  const recent = activities.slice(0, 5);

  return (
    <div className="fixed right-6 bottom-8 z-20 flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
      {recent.map(a => {
        const sport = SPORT_MAP[a.sportType] ?? { name: '未知', color: '#666' };
        return (
          <button key={a.id} onClick={() => onSelect(a)}
            className="flex items-center gap-2.5 min-w-[225px] rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] px-3.5 py-2.5 text-left backdrop-blur-xl transition hover:bg-[rgba(15,15,15,0.96)] hover:border-white/12">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sport.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-[0.8rem] font-medium truncate">{a.name}</div>
              <div className="text-[0.68rem] text-[#666] mt-0.5 font-[family-name:var(--font-text)]">
                {a.startTime.slice(5)} · {formatDuration(a.totalTime)}
              </div>
            </div>
            <span className="text-[0.78rem] text-[#666] font-[family-name:var(--font-text)] whitespace-nowrap">
              <strong className="text-[#fafafa] font-medium font-[family-name:var(--font-display)]">{(a.totalDistance / 1000).toFixed(1)}</strong> km
            </span>
          </button>
        );
      })}
    </div>
  );
}
