import { useAuth } from '../../context/AuthContext';
import type { TerrainMapHandle } from '../background/TerrainMap';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSync: () => void;
  syncLoading: boolean;
  syncError: string;
  mapRef: React.RefObject<TerrainMapHandle>;
}

const TABS = [
  { id: 'overview', label: '概览' },
  { id: 'trend', label: '趋势' },
  { id: 'body', label: '身体' },
  { id: 'sleep', label: '睡眠' },
  { id: 'activities', label: '活动' },
];

export default function NavBar({ activeTab, onTabChange, onSync, syncLoading, syncError, mapRef }: Props) {
  const { userName, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-3.5">
      <div className="text-[1.05rem] font-medium tracking-[-0.02em]">
        COROS <span className="text-accent not-italic">Dashboard</span>
      </div>

      <div className="flex items-center rounded-[28px] border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] p-[3px] backdrop-blur-xl">
        {TABS.map(t => (
          <button key={t.id} onClick={() => onTabChange(t.id)}
            className={`rounded-3xl px-[22px] py-2 text-[0.82rem] font-medium transition-colors tracking-[-0.01em] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-black ${
              activeTab === t.id ? 'bg-white/6 text-[#fafafa]' : 'text-[#666] hover:text-[#999]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => mapRef.current?.resetView()}
          className="rounded-3xl bg-white/10 px-5 py-2 text-[0.82rem] font-semibold text-[#fafafa] transition hover:bg-white/15">
          轨迹视角
        </button>
        <button onClick={onSync} disabled={syncLoading}
          className="rounded-3xl bg-accent px-5 py-2 text-[0.82rem] font-semibold text-black transition hover:bg-accent-hover disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black">
          {syncLoading ? '同步中...' : syncError ? '重试同步' : '同步数据'}
        </button>
        {syncError && <span className="text-[0.7rem] text-red-400 max-w-[160px] truncate" title={syncError}>{syncError}</span>}
        <span className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] px-3.5 py-1.5 text-[0.78rem] text-[#999] backdrop-blur-md">
          {userName}
        </span>
        <button onClick={logout} className="text-[0.72rem] text-[#666] hover:text-[#999]">退出</button>
      </div>
    </nav>
  );
}
