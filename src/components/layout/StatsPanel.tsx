interface StatItem { label: string; value: string; unit: string; }

export default function StatsPanel({ stats }: { stats: StatItem[] }) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
      {stats.map(s => (
        <div key={s.label}
          className="w-[165px] rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] p-4 backdrop-blur-xl transition hover:border-white/12">
          <div className="text-[0.64rem] uppercase tracking-[0.06em] text-[#666] font-[family-name:var(--font-text)] font-medium">{s.label}</div>
          <div className="mt-1.5 text-2xl font-normal tracking-[-0.03em] text-[#fafafa]">
            {s.value}<span className="text-[0.7rem] text-[#666] ml-0.5">{s.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
