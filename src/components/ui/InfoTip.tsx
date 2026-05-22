import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  term: string;
  children: React.ReactNode;
}

export default function InfoTip({ term, children }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);

  const updatePos = useCallback(() => {
    if (!iconRef.current || !tipRef.current) return;
    const iconRect = iconRef.current.getBoundingClientRect();
    const tipW = 240;
    const tipH = tipRef.current.offsetHeight || 120;
    let top = iconRect.top - tipH - 8;
    let left = iconRect.left + iconRect.width / 2 - tipW / 2;
    if (top < 12) top = iconRect.bottom + 8;
    if (left < 12) left = 12;
    if (left + tipW > window.innerWidth - 12) left = window.innerWidth - tipW - 12;
    setPos({ top, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    const close = (e: MouseEvent) => {
      if (iconRef.current && !iconRef.current.contains(e.target as Node) &&
          tipRef.current && !tipRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', close);
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      document.removeEventListener('click', close);
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open, updatePos]);

  return (
    <>
      <span ref={iconRef} className="inline-flex items-center">
        <i
          className="fa fa-info-circle text-[0.58rem] text-[#777] hover:text-[#bbb] cursor-pointer ml-1"
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        />
      </span>
      {open && createPortal(
        <span
          ref={tipRef}
          className="fixed w-60 p-3 rounded-xl border border-white/10 bg-[#1e1e1e] shadow-2xl z-[9999]"
          style={{ top: pos.top, left: pos.left }}
        >
          <span className="text-[0.7rem] font-medium text-[#fafafa] block mb-1">{term}</span>
          <span className="text-[0.68rem] text-[#aaa] leading-relaxed">{children}</span>
        </span>,
        document.body
      )}
    </>
  );
}
