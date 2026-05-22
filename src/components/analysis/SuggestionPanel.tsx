import { useMemo, useState, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import {
  aggregateDailyLoads, calcACWR, calcEfficiencyIndex, calcSportDistribution,
  generateWeeklySuggestion, getStatusSummary,
} from '../../lib/analysis';
import InfoTip from '../ui/InfoTip';

export default function SuggestionPanel() {
  const { activities } = useData();

  const [goalType, setGoalType] = useState<'monthlyDist' | 'race10k' | ''>('');
  const [goalValue, setGoalValue] = useState('');
  const [goalSet, setGoalSet] = useState(false);

  const dailyLoads = useMemo(() => aggregateDailyLoads(activities), [activities]);
  const acwrData = useMemo(() => calcACWR(dailyLoads), [dailyLoads]);
  const latestACWR = acwrData.length > 0 ? acwrData[acwrData.length - 1]?.ratio ?? 0 : 0;
  const efficiency = useMemo(() => calcEfficiencyIndex(activities), [activities]);

  const recentFreq = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const fourWeeksAgo = now - 28 * 86400;
    return Math.round(activities.filter(a => Number(a.startTime) >= fourWeeksAgo).length / 4);
  }, [activities]);

  const suggestion = useMemo(() => generateWeeklySuggestion(activities, latestACWR), [activities, latestACWR]);
  const status = useMemo(() => getStatusSummary(efficiency, latestACWR, recentFreq), [efficiency, latestACWR, recentFreq]);
  const sportDist = useMemo(() => calcSportDistribution(activities), [activities]);

  const dominantSport = Object.entries(sportDist).sort((a, b) => b[1].percent - a[1].percent)[0];

  const handleSetGoal = useCallback(() => {
    if (goalType && goalValue) setGoalSet(true);
  }, [goalType, goalValue]);

  const hasData = activities.length >= 5;

  return hasData ? (
    <div className="space-y-4">
      {/* 当前状态 */}
      <div className={`rounded-2xl border p-5 ${
        status.status === 'improving' ? 'border-green-500/20 bg-green-500/[0.03]' :
        status.status === 'declining' || status.status === 'insufficient' ? 'border-red-500/20 bg-red-500/[0.03]' :
        'border-white/5 bg-white/[0.02]'
      }`}>
        <div className="flex items-center gap-1">
          <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#999]">当前状态</div>
          <InfoTip term="综合训练状态">
            综合评估 ACWR 负荷比、配速-心率效率指数趋势和训练频率。
            效率上升 + 负荷合理 = 状态提升；效率下降 = 可能疲劳或训练不当；负荷过高 = 受伤风险增加。
          </InfoTip>
        </div>
        <div className="text-xl font-medium text-[#fafafa] mt-1">{status.label}</div>
        <div className="text-[0.72rem] text-[#aaa] mt-1.5 leading-relaxed">{status.detail}</div>
      </div>

      {/* 下周训练建议 */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="flex items-center gap-1 mb-3">
          <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#999]">下周训练建议</div>
          <InfoTip term="训练建议">
            基于近4周训练数据和当前 ACWR 自动生成。遵循 80/20 训练原则：80% 低强度有氧跑 +
            20% 中高强度训练，平衡训练效果与恢复，降低受伤风险。
          </InfoTip>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-[0.62rem] text-[#999]">目标距离</div>
            <div className="text-lg font-medium text-[#fafafa]">{suggestion.targetDistance}<span className="text-[0.7rem] text-[#999] ml-0.5">km</span></div>
          </div>
          <div>
            <div className="text-[0.62rem] text-[#999]">运动频次</div>
            <div className="text-lg font-medium text-[#fafafa]">{suggestion.targetFrequency}<span className="text-[0.7rem] text-[#999] ml-0.5">次/周</span></div>
          </div>
          <div>
            <div className="text-[0.62rem] text-[#999]">轻松跑</div>
            <div className="text-lg font-medium text-[#4ade80]">{suggestion.easyPercent}%</div>
          </div>
          <div>
            <div className="text-[0.62rem] text-[#999]">强度跑</div>
            <div className="text-lg font-medium text-[#facc15]">{suggestion.intensityPercent}%</div>
          </div>
        </div>

        {suggestion.note && (
          <div className="mt-3 text-center text-[0.7rem] text-accent/80 bg-accent/[0.06] rounded-xl py-2 px-3 font-medium">
            {suggestion.note}
          </div>
        )}
      </div>

      {/* 每周详细计划 */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#999] mb-3">周训练安排</div>
        <ul className="space-y-2">
          {suggestion.weeklyPlan.map((item, i) => (
            <li key={i} className="flex gap-2 text-[0.72rem] text-[#bbb] leading-relaxed">
              <span className="text-[0.65rem] text-[#aaa] mt-0.5 shrink-0">●</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* 注意事项 */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#999] mb-3">关键提醒</div>
        <ul className="space-y-2">
          {suggestion.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-[0.72rem] text-[#bbb] leading-relaxed">
              <span className="text-[0.65rem] text-[#facc15] mt-0.5 shrink-0">◆</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* 目标设定 */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="flex items-center gap-1 mb-3">
          <div className="text-[0.62rem] uppercase tracking-[0.05em] text-[#999]">目标设定</div>
          <InfoTip term="目标追踪">
            设定明确目标可以让训练更有方向。月跑量目标适合储备期，10K 成绩目标适合备赛期。
            数据累积后会自动显示进度条，帮你追踪完成情况。
          </InfoTip>
        </div>
        {!goalSet ? (
          <div className="space-y-3">
            <select value={goalType} onChange={e => setGoalType(e.target.value as typeof goalType)}
              className="w-full rounded-xl border border-white/10 bg-black/30 text-[#fafafa] text-sm px-3 py-2 focus:outline-none focus:border-accent/50">
              <option value="">选择目标类型</option>
              <option value="monthlyDist">月跑量目标</option>
              <option value="race10k">10K 成绩目标</option>
            </select>
            {goalType && (
              <input type="number" value={goalValue} onChange={e => setGoalValue(e.target.value)}
                placeholder={goalType === 'monthlyDist' ? '目标月跑量 (km)' : '目标完赛时间 (分钟)'}
                className="w-full rounded-xl border border-white/10 bg-black/30 text-[#fafafa] text-sm px-3 py-2 focus:outline-none focus:border-accent/50" />
            )}
            {goalType && goalValue && (
              <button onClick={handleSetGoal}
                className="w-full rounded-xl bg-accent text-black font-semibold text-sm py-2 hover:bg-accent-hover transition">
                设定目标
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-[0.72rem] text-[#aaa]">当前目标</div>
            <div className="text-lg font-medium text-[#fafafa] mt-1">
              {goalType === 'monthlyDist' ? `月跑量 ${goalValue}km` : `10K ${goalValue}分钟`}
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: '0%' }} />
            </div>
            <div className="text-[0.65rem] text-[#aaa] mt-1">开始追踪中，数据积累后显示进度</div>
            <button onClick={() => setGoalSet(false)}
              className="mt-3 text-[0.7rem] text-[#999] hover:text-[#999]">重置目标</button>
          </div>
        )}
      </div>

      {/* 交叉训练建议 */}
      {dominantSport && dominantSport[1].percent > 90 && (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.03] p-5 text-center">
          <div className="text-[0.72rem] text-[#facc15]">
            你的 {dominantSport[1].name === 'running' ? '跑步' :
                    dominantSport[1].name === 'hiking' ? '登山' :
                    dominantSport[1].name === 'cycling' ? '骑行' :
                    dominantSport[1].name === 'swimming' ? '游泳' : '力量训练'} 占比超过 90%
          </div>
          <div className="text-[0.68rem] text-[#aaa] mt-1">
            建议加入{dominantSport[1].name === 'running' ? '力量训练和骑行' :
                             dominantSport[1].name === 'cycling' ? '跑步和力量训练' :
                             dominantSport[1].name === 'hiking' ? '跑步和力量训练' : '跑步和骑行'}，多样化训练更有利于全面发展
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
      <div className="text-[#999] text-sm">数据不足，至少需要 5 条活动才能提供建议</div>
    </div>
  );
}
