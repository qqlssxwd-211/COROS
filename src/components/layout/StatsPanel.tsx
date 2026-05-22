interface StatItem { label: string; value: string; unit: string; action?: string; }

interface Props { stats: StatItem[]; mobile?: boolean; onStatClick?: (action: string) => void; }

export default function StatsPanel({ stats, mobile, onStatClick }: Props) {
  const Card = ({ s }: { s: StatItem }) => {
    const content = (
      <div className={`rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.92)] backdrop-blur-xl transition hover:border-white/12 ${s.action ? 'cursor-pointer hover:bg-[rgba(15,15,15,0.96)]' : ''} ${mobile ? 'min-w-[120px] flex-shrink-0 p-3' : 'w-[165px] p-4'}`}>
        <div className={`uppercase tracking-[0.06em] text-[#666] font-[family-name:var(--font-text)] font-medium ${mobile ? 'text-[0.58rem]' : 'text-[0.64rem]'}`}>{s.label}</div>
        <div className={`font-normal tracking-[-0.03em] text-[#fafafa] ${mobile ? 'text-lg mt-0.5' : 'text-2xl mt-1.5'}`}>
          {s.value}<span className={`text-[#666] ml-0.5 ${mobile ? 'text-[0.62rem]' : 'text-[0.7rem]'}`}>{s.unit}</span>
        </div>
      </div>
    );
    if (s.action && onStatClick) {
      return <button key={s.label} onClick={() => onStatClick(s.action!)} className="text-left">{content}</button>;
    }
    return <div key={s.label}>{content}</div>;
  };

  if (mobile) {
    return <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2">{stats.map(s => <Card key={s.label} s={s} />)}</div>;
  }

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
      {stats.map(s => <Card key={s.label} s={s} />)}
    </div>
  );
}
