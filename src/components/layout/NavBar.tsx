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
    <nav className="fixed top-0 left-0 right-0 z-30 flex flex-col md:flex-row md:items-center md:justify-between px-3 md:px-5 py-2 md:py-3.5 gap-1.5 md:gap-0 bg-gradient-to-b from-black/90 to-transparent pb-3 md:bg-none md:pb-0">
      {/* Top row: logo + actions */}
      <div className="flex items-center justify-between md:hidden">
        <div className="text-[0.95rem] font-medium tracking-[-0.02em]">
          COROS <span className="text-accent not-italic">Dashboard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => mapRef.current?.resetView()}
            className="rounded-2xl bg-white/10 px-3 py-1.5 text-[0.7rem] font-semibold text-[#fafafa] transition hover:bg-white/15">
            轨迹
          </button>
          <button onClick={onSync} disabled={syncLoading}
            className="rounded-2xl bg-accent px-3 py-1.5 text-[0.7rem] font-semibold text-black transition hover:bg-accent-hover disabled:opacity-50">
            {syncLoading ? '同步中' : syncError ? '重试' : '同步'}
          </button>
          <span className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] px-2 py-1 text-[0.68rem] text-[#999] backdrop-blur-md max-w-[80px] truncate">
            {userName}
          </span>
          <button onClick={logout} className="text-[0.68rem] text-[#666] hover:text-[#999]">退出</button>
        </div>
      </div>

      {/* Desktop logo */}
      <div className="hidden md:block text-[1.05rem] font-medium tracking-[-0.02em]">
        COROS <span className="text-accent not-italic">Dashboard</span>
      </div>

      {/* Tabs - scrollable on mobile */}
      <div className="flex items-center rounded-[28px] border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] p-[3px] backdrop-blur-xl overflow-x-auto md:overflow-visible max-md:w-full max-md:justify-start">
        {TABS.map(t => (
          <button key={t.id} onClick={() => onTabChange(t.id)}
            className={`rounded-3xl whitespace-nowrap px-3.5 md:px-[22px] py-1.5 md:py-2 text-[0.72rem] md:text-[0.82rem] font-medium transition-colors tracking-[-0.01em] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-black ${
              activeTab === t.id ? 'bg-white/6 text-[#fafafa]' : 'text-[#666] hover:text-[#999]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Desktop actions */}
      <div className="hidden md:flex items-center gap-3">
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
