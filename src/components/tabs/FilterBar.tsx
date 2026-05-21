import { SPORT_TYPE_LABELS } from '../../lib/constants';
import type { SportType } from '../../types/coros';

interface Props {
  sportType: SportType;
  onSportChange: (v: SportType) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  sortBy?: string;
  onSortChange?: (v: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

const DATE_PRESETS: { label: string; from: string; to: string }[] = [
  { label: '全部时间', from: '', to: '' },
  { label: '近1月', from: daysAgo(30), to: today() },
  { label: '近3月', from: daysAgo(90), to: today() },
  { label: '近6月', from: daysAgo(180), to: today() },
  { label: '今年', from: `${new Date().getFullYear()}-01-01`, to: today() },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysAgo(n: number): string {
  const d = new Date(Date.now() - n * 86400000);
  return d.toISOString().slice(0, 10);
}

const baseInputCls = "h-9 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-[0.78rem] text-[#e0e0e0] outline-none transition placeholder:text-[#555] focus:border-white/20 focus:bg-white/[0.06] [color-scheme:dark] max-md:h-8 max-md:text-[0.72rem] max-md:px-2.5";

export default function FilterBar({ sportType, onSportChange, dateFrom, onDateFromChange, dateTo, onDateToChange, sortBy, onSortChange, onSearch, onReset }: Props) {
  const activePreset = DATE_PRESETS.find(p => p.from === dateFrom && p.to === dateTo);

  return (
    <div className="flex flex-col gap-3">
      {/* Sport type pills - scrollable on mobile */}
      <div className="flex items-center rounded-[10px] border border-white/[0.07] bg-white/[0.03] p-[3px] backdrop-blur-sm overflow-x-auto max-md:w-full">
        {(Object.entries(SPORT_TYPE_LABELS) as [SportType, string][]).map(([k, v]) => (
          <button key={k} onClick={() => onSportChange(k)}
            className={`rounded-md px-3 py-1.5 text-[0.76rem] font-medium transition-colors tracking-[-0.01em] whitespace-nowrap max-md:px-2.5 max-md:text-[0.7rem] ${
              sportType === k ? 'bg-white/[0.10] text-[#fafafa]' : 'text-[#666] hover:text-[#999]'
            }`}>
            {v}
          </button>
        ))}
      </div>

      {/* Date presets - scrollable on mobile */}
      <div className="flex items-center rounded-[10px] border border-white/[0.07] bg-white/[0.03] p-[3px] backdrop-blur-sm overflow-x-auto max-md:w-full">
        {DATE_PRESETS.map(p => (
          <button key={p.label} onClick={() => { onDateFromChange(p.from); onDateToChange(p.to); }}
            className={`rounded-md px-3 py-1.5 text-[0.76rem] font-medium transition-colors tracking-[-0.01em] whitespace-nowrap max-md:px-2.5 max-md:text-[0.7rem] ${
              activePreset?.label === p.label ? 'bg-white/[0.10] text-[#fafafa]' : 'text-[#666] hover:text-[#999]'
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date range + sort + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 max-md:flex-1">
          <input type="date" value={dateFrom} onChange={e => onDateFromChange(e.target.value)}
            className={baseInputCls} style={{ width: '140px' }} />
          <span className="text-[#555] text-[0.7rem]">—</span>
          <input type="date" value={dateTo} onChange={e => onDateToChange(e.target.value)}
            className={baseInputCls} style={{ width: '140px' }} />
        </div>

        {sortBy && onSortChange && (
          <select value={sortBy} onChange={e => onSortChange(e.target.value)}
            className={`${baseInputCls} min-w-[110px] max-md:min-w-[95px] appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23666%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[right_8px_center] pr-7`}>
            <option value="date-desc" className="bg-[#1a1a1a]">时间降序</option>
            <option value="date-asc" className="bg-[#1a1a1a]">时间升序</option>
            <option value="distance-desc" className="bg-[#1a1a1a]">距离降序</option>
            <option value="duration-desc" className="bg-[#1a1a1a]">时长降序</option>
          </select>
        )}

        <button onClick={onSearch}
          className="h-9 rounded-lg bg-accent px-5 text-[0.76rem] font-semibold text-black transition hover:bg-accent-hover max-md:h-8 max-md:px-4 max-md:text-[0.7rem]">
          搜索
        </button>
        <button onClick={onReset}
          className="h-9 rounded-lg border border-white/[0.08] bg-transparent px-3.5 text-[0.76rem] text-[#777] transition hover:border-white/15 hover:text-[#aaa] max-md:h-8 max-md:px-3 max-md:text-[0.7rem]">
          重置
        </button>
      </div>
    </div>
  );
}
