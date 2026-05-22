import { useRef, useCallback, type ReactNode, type TouchEvent } from 'react';

interface Props {
  active: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function TabShell({ active, onClose, title, children }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number>(0);
  const touchCurrent = useRef<number>(0);

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = e.touches[0].clientY;
    touchCurrent.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    touchCurrent.current = e.touches[0].clientY;
    const delta = touchCurrent.current - touchStart.current;
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    const delta = touchCurrent.current - touchStart.current;
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    if (delta > 100) {
      onClose();
    }
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-40 ${active ? 'pointer-events-auto' : 'pointer-events-none'}`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`} />

      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 z-10 w-full max-h-[88vh] md:max-h-[82vh] overflow-y-auto rounded-t-3xl border-t border-white/6 bg-[rgba(5,5,5,0.97)] px-4 md:px-9 py-4 md:py-7 pb-8 md:pb-10 backdrop-blur-2xl transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${active ? 'translate-y-0' : 'translate-y-full'}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Close handle - large touch target */}
        <div className="sticky top-0 z-10 -mx-4 md:-mx-9 -mt-4 md:-mt-7 pt-3 pb-2 bg-[rgba(5,5,5,0.97)] backdrop-blur-2xl">
          <div className="flex items-center justify-between px-4 md:px-9">
            {/* Drag handle */}
            <div className="flex-1 flex justify-center">
              <button
                onClick={onClose}
                className="h-6 w-20 flex items-center justify-center cursor-pointer touch-manipulation -my-1"
                aria-label="关闭"
              >
                <span className="h-1.5 w-12 rounded-full bg-white/25" />
              </button>
            </div>
            {/* Close button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white flex-shrink-0 touch-manipulation transition"
              aria-label="关闭"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {title && <h3 className="text-xl font-medium tracking-[-0.02em] text-[#fafafa] mt-1">{title}</h3>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
