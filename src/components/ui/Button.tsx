import type { ReactNode } from 'react';

interface Props { children: ReactNode; primary?: boolean; onClick?: () => void; className?: string; disabled?: boolean; }

export default function Button({ children, primary, onClick, className = '', disabled }: Props) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`rounded-[22px] px-[18px] py-2 text-[0.78rem] font-semibold transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-black ${
        primary ? 'bg-accent text-black hover:bg-accent-hover' : 'border border-white/10 bg-transparent text-[#999] hover:border-white/20 hover:text-[#fafafa]'
      } disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}
