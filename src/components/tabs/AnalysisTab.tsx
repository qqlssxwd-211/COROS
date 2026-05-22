import TabShell from './TabShell';

interface Props { active: boolean; onClose: () => void; }

export default function AnalysisTab({ active, onClose }: Props) {
  return (
    <TabShell active={active} onClose={onClose} title="运动分析">
      <div className="space-y-6">
        <section>
          <h4 className="text-[0.68rem] uppercase tracking-[0.08em] text-[#555] font-medium mb-3">能力评估</h4>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <div className="text-[#666] text-sm">加载中...</div>
          </div>
        </section>
        <section>
          <h4 className="text-[0.68rem] uppercase tracking-[0.08em] text-[#555] font-medium mb-3">训练负荷</h4>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <div className="text-[#666] text-sm">加载中...</div>
          </div>
        </section>
        <section>
          <h4 className="text-[0.68rem] uppercase tracking-[0.08em] text-[#555] font-medium mb-3">建议与规划</h4>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <div className="text-[#666] text-sm">加载中...</div>
          </div>
        </section>
      </div>
    </TabShell>
  );
}
