interface StatItem { label: string; value: string; unit: string; }

export default function StatsPanel({ stats }: { stats: StatItem[] }) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 max-md:left-4 max-md:right-4 max-md:top-auto max-md:bottom-28 max-md:translate-y-0 max-md:flex-row max-md:gap-1.5 max-md:overflow-x-auto max-md:pb-1">
      {stats.map(s => (
        <div key={s.label}
          className="w-[165px] rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] p-4 backdrop-blur-xl transition hover:border-white/12 max-md:min-w-[130px] max-md:flex-shrink-0 max-md:w-auto max-md:p-3">
          <div className="text-[0.64rem] uppercase tracking-[0.06em] text-[#666] font-[family-name:var(--font-text)] font-medium max-md:text-[0.6rem]">{s.label}</div>
          <div className="mt-1.5 text-2xl font-normal tracking-[-0.03em] text-[#fafafa] max-md:text-lg max-md:mt-0.5">
            {s.value}<span className="text-[0.7rem] text-[#666] ml-0.5 max-md:text-[0.62rem]">{s.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
