interface Props {
  year: number;
  startMonth: string;
  endMonth: string;
}

export default function Hero({ year, startMonth, endMonth }: Props) {
  return (
    <div className="fixed left-7 bottom-8 z-20 max-w-[420px] max-md:left-4 max-md:top-16 max-md:right-4 max-md:bottom-auto max-md:max-w-none">
      <div className="inline-flex items-center gap-2 text-[0.8rem] font-medium text-accent max-md:text-[0.7rem]">
        {year}年摘要 · {startMonth}月 — {endMonth}月
      </div>
      <h1 className="mt-2.5 text-[2.5rem] font-normal leading-[0.95] tracking-[-0.035em] text-[#fafafa] max-md:text-[1.5rem] max-md:mt-1">
        你的运动<span className="text-accent">全貌</span>
      </h1>
      <p className="mt-1.5 max-w-[340px] text-[0.83rem] leading-relaxed text-[#999] font-[family-name:var(--font-text)] max-md:text-[0.72rem] max-md:max-w-none max-md:mt-1 max-md:hidden">
        基于 COROS 训练数据追踪表现。点击 Tab 切换维度分析，点击活动查看深度详情。
      </p>
    </div>
  );
}
