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
    <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-3 md:px-5 py-2 md:py-3.5 gap-2">
      {/* Logo */}
      <div className="text-[0.9rem] md:text-[1.05rem] font-medium tracking-[-0.02em] whitespace-nowrap">
        COROS <span className="text-accent not-italic">Dashboard</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center rounded-[28px] border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] p-[3px] backdrop-blur-xl overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => onTabChange(t.id)}
            className={`rounded-3xl whitespace-nowrap px-3 md:px-[22px] py-1.5 md:py-2 text-[0.72rem] md:text-[0.82rem] font-medium transition-colors tracking-[-0.01em] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-black ${
              activeTab === t.id ? 'bg-white/6 text-[#fafafa]' : 'text-[#666] hover:text-[#999]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 md:gap-3">
        <button onClick={() => mapRef.current?.resetView()}
          className="rounded-3xl bg-white/10 px-3 md:px-5 py-1.5 md:py-2 text-[0.7rem] md:text-[0.82rem] font-semibold text-[#fafafa] transition hover:bg-white/15 whitespace-nowrap">
          <span className="hidden md:inline">轨迹视角</span>
          <span className="md:hidden">轨迹</span>
        </button>
        <button onClick={onSync} disabled={syncLoading}
          className="rounded-3xl bg-accent px-3 md:px-5 py-1.5 md:py-2 text-[0.7rem] md:text-[0.82rem] font-semibold text-black transition hover:bg-accent-hover disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black whitespace-nowrap">
          {syncLoading ? '同步中' : syncError ? '重试' : '同步数据'}
        </button>
        <span className="hidden md:block rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] px-3.5 py-1.5 text-[0.78rem] text-[#999] backdrop-blur-md">
          {userName}
        </span>
        <button onClick={logout} className="text-[0.68rem] md:text-[0.72rem] text-[#666] hover:text-[#999] whitespace-nowrap">退出</button>
      </div>
    </nav>
  );
}
