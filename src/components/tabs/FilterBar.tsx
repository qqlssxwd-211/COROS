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
  onApply: () => void;
  onReset: () => void;
}

export default function FilterBar({ sportType, onSportChange, dateFrom, onDateFromChange, dateTo, onDateToChange, sortBy, onSortChange, onApply, onReset }: Props) {
  return (
    <div className="flex gap-2.5 items-end flex-wrap">
      <label className="flex flex-col gap-1">
        <span className="text-[0.64rem] uppercase tracking-[0.05em] text-[#666] font-medium">类型</span>
        <select value={sportType} onChange={e => onSportChange(e.target.value as SportType)}
          className="rounded-xl border border-white/8 bg-white/4 px-3.5 py-2 text-[0.78rem] text-[#fafafa] min-w-[120px] outline-none transition focus:border-accent">
          {(Object.entries(SPORT_TYPE_LABELS) as [SportType, string][]).map(([k, v]) => <option key={k} value={k} className="bg-black">{v}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[0.64rem] uppercase tracking-[0.05em] text-[#666] font-medium">从</span>
        <input type="date" value={dateFrom} onChange={e => onDateFromChange(e.target.value)}
          className="rounded-xl border border-white/8 bg-white/4 px-3.5 py-2 text-[0.78rem] text-[#fafafa] outline-none transition focus:border-accent" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[0.64rem] uppercase tracking-[0.05em] text-[#666] font-medium">到</span>
        <input type="date" value={dateTo} onChange={e => onDateToChange(e.target.value)}
          className="rounded-xl border border-white/8 bg-white/4 px-3.5 py-2 text-[0.78rem] text-[#fafafa] outline-none transition focus:border-accent" />
      </label>
      {sortBy && onSortChange && (
        <label className="flex flex-col gap-1">
          <span className="text-[0.64rem] uppercase tracking-[0.05em] text-[#666] font-medium">排序</span>
          <select value={sortBy} onChange={e => onSortChange(e.target.value)}
            className="rounded-xl border border-white/8 bg-white/4 px-3.5 py-2 text-[0.78rem] text-[#fafafa] outline-none transition focus:border-accent">
            <option value="date-desc" className="bg-black">时间降序</option>
            <option value="date-asc" className="bg-black">时间升序</option>
            <option value="distance-desc" className="bg-black">距离降序</option>
            <option value="duration-desc" className="bg-black">时长降序</option>
          </select>
        </label>
      )}
      <button onClick={onApply} className="rounded-[22px] bg-accent px-[18px] py-2 text-[0.78rem] font-semibold text-black transition hover:bg-accent-hover">应用</button>
      <button onClick={onReset} className="rounded-[22px] border border-white/10 bg-transparent px-[18px] py-2 text-[0.78rem] text-[#999] transition hover:border-white/20 hover:text-[#fafafa]">重置</button>
    </div>
  );
}
