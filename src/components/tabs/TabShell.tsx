import type { ReactNode } from 'react';

interface Props {
  active: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function TabShell({ active, onClose, title, children }: Props) {
  return (
    <div
      className={`fixed inset-0 z-40 ${active ? 'pointer-events-auto' : 'pointer-events-none'}`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-0 left-0 right-0 z-10 w-full max-h-[85vh] md:max-h-[82vh] overflow-y-auto rounded-t-3xl border-t border-white/6 bg-[rgba(5,5,5,0.97)] px-4 md:px-9 py-5 md:py-7 pb-8 md:pb-10 backdrop-blur-2xl transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${active ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="mx-auto mb-5 h-1 w-10 cursor-pointer rounded-full bg-white/15" onClick={onClose} />
        <h3 className="text-xl font-medium tracking-[-0.02em] text-[#fafafa]">{title}</h3>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
