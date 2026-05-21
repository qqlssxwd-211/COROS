interface Props {
  year: number;
  startMonth: string;
  endMonth: string;
  mobile?: boolean;
}

export default function Hero({ year, startMonth, endMonth, mobile }: Props) {
  if (mobile) {
    return (
      <div className="w-full">
        <div className="inline-flex items-center gap-2 text-[0.7rem] font-medium text-accent">
          {year}年摘要 · {startMonth}月 — {endMonth}月
        </div>
        <h1 className="mt-1 text-[1.4rem] font-normal leading-[1.1] tracking-[-0.035em] text-[#fafafa]">
          你的运动<span className="text-accent">全貌</span>
        </h1>
      </div>
    );
  }

  return (
    <div className="fixed left-7 bottom-8 z-20 max-w-[420px]">
      <div className="inline-flex items-center gap-2 text-[0.8rem] font-medium text-accent">
        {year}年摘要 · {startMonth}月 — {endMonth}月
      </div>
      <h1 className="mt-2.5 text-[2.5rem] font-normal leading-[0.95] tracking-[-0.035em] text-[#fafafa]">
        你的运动<span className="text-accent">全貌</span>
      </h1>
      <p className="mt-1.5 max-w-[340px] text-[0.83rem] leading-relaxed text-[#999] font-[family-name:var(--font-text)]">
        基于 COROS 训练数据追踪表现。点击 Tab 切换维度分析，点击活动查看深度详情。
      </p>
    </div>
  );
}
