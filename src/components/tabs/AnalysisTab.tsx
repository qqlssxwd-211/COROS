import TabShell from './TabShell';
import AbilityPanel from '../analysis/AbilityPanel';
import LoadPanel from '../analysis/LoadPanel';
import SuggestionPanel from '../analysis/SuggestionPanel';

interface Props { active: boolean; onClose: () => void; }

export default function AnalysisTab({ active, onClose }: Props) {
  return (
    <TabShell active={active} onClose={onClose} title="运动分析">
      <div className="space-y-6">
        <section>
          <h4 className="text-[0.68rem] uppercase tracking-[0.08em] text-[#555] font-medium mb-3">能力评估</h4>
          <AbilityPanel />
        </section>

        <section>
          <h4 className="text-[0.68rem] uppercase tracking-[0.08em] text-[#555] font-medium mb-3">训练负荷</h4>
          <LoadPanel />
        </section>

        <section>
          <h4 className="text-[0.68rem] uppercase tracking-[0.08em] text-[#555] font-medium mb-3">建议与规划</h4>
          <SuggestionPanel />
        </section>
      </div>
    </TabShell>
  );
}
