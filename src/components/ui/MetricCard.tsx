import type { ReactNode } from 'react';

export default function MetricCard({ title, chart }: { title: string; chart: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <h4 className="text-[0.72rem] uppercase tracking-[0.05em] text-[#666] font-medium mb-3.5">{title}</h4>
      {chart}
    </div>
  );
}
