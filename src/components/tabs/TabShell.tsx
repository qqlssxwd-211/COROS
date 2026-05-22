import { useRef, useCallback, type ReactNode, type TouchEvent, type UIEvent } from 'react';

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
  const isAtTop = useRef(true);

  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    isAtTop.current = (e.target as HTMLDivElement).scrollTop <= 0;
  }, []);

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = e.touches[0].clientY;
    touchCurrent.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    touchCurrent.current = e.touches[0].clientY;
    const delta = touchCurrent.current - touchStart.current;
    if (delta > 0 && isAtTop.current && sheetRef.current) {
      e.preventDefault();
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    const delta = touchCurrent.current - touchStart.current;
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    if (delta > 60 && isAtTop.current) {
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
        onScroll={onScroll}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Close handle - large touch target */}
        <div className="sticky top-0 z-10 -mx-4 md:-mx-9 -mt-4 md:-mt-7 pt-3 pb-2 bg-[rgba(5,5,5,0.97)] backdrop-blur-2xl flex justify-center">
          <button
            onClick={onClose}
            className="h-7 w-24 flex items-center justify-center cursor-pointer touch-manipulation"
            aria-label="下拉关闭"
          >
            <span className="h-1.5 w-14 rounded-full bg-white/25" />
          </button>
        </div>

        {title && <h3 className="text-xl font-medium tracking-[-0.02em] text-[#fafafa] mt-1">{title}</h3>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
