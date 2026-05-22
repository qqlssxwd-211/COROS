import { useState, useRef, useEffect } from 'react';

interface Props {
  term: string;
  children: React.ReactNode;
}

export default function InfoTip({ term, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <i
        className="fa fa-info-circle text-[0.55rem] text-[#555] hover:text-[#999] cursor-pointer ml-1"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      />
      <span className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-60 p-3 rounded-xl border border-white/10 bg-[#1e1e1e] shadow-2xl z-50 transition-all duration-150 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <span className="text-[0.7rem] font-medium text-[#fafafa] block mb-1">{term}</span>
        <span className="text-[0.68rem] text-[#aaa] leading-relaxed">{children}</span>
      </span>
    </span>
  );
}
