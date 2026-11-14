import { useEffect, useState } from 'react';

interface PreloaderOverlayProps {
  skipImmediately?: boolean;
  onComplete?: () => void;
}

const WORD_ONE = 'ATELIER'.split('');
const WORD_TWO = 'KOVA'.split('');

export function PreloaderOverlay({
  skipImmediately = false,
  onComplete,
}: PreloaderOverlayProps) {
  const [phase, setPhase] = useState<'entering' | 'exiting' | 'done'>(() => {
    if (skipImmediately) return 'done';
    if (
      typeof window !== 'undefined' &&
      (window.location.search.includes('autostart=1') ||
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
    ) {
      return 'done';
    }
    return 'entering';
  });

  useEffect(() => {
    if (phase === 'done') {
      onComplete?.();
      return;
    }

    let cancelled = false;
    const minHoldMs = 1320;
    const exitAnimMs = 540;
    const startedAt = performance.now();

    let exitTimer = 0;
    let doneTimer = 0;

    const scheduleExit = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startedAt;
      const waitMs = Math.max(0, minHoldMs - elapsed);
      exitTimer = window.setTimeout(() => {
        if (cancelled) return;
        setPhase('exiting');
        doneTimer = window.setTimeout(() => {
          if (cancelled) return;
          setPhase('done');
          onComplete?.();
        }, exitAnimMs);
      }, waitMs);
    };

    const fontsPromise = document.fonts?.ready ?? Promise.resolve();
    Promise.race([
      fontsPromise,
      new Promise<void>((resolve) => window.setTimeout(resolve, 420)),
    ]).then(scheduleExit);

    return () => {
      cancelled = true;
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [phase, onComplete]);

  if (phase === 'done') {
    return null;
  }

  const isExiting = phase === 'exiting';

  return (
    <div
      data-testid="home-preloader"
      data-preloader-phase={phase}
      aria-label="Loading Atelier Kova"
      className={`fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center px-6 select-none transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isExiting ? '-translate-y-full opacity-95 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
    >
      <div
        className={`flex flex-col items-center transition-all duration-400 ease-out ${
          isExiting ? '-translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <div
          aria-label="ATELIER KOVA"
          className="font-display font-extrabold text-[clamp(1.75rem,4.8vw,3.45rem)] tracking-[0.16em] text-obsidian flex items-center gap-[0.42em] leading-none py-2"
        >
          <span className="inline-flex">
            {WORD_ONE.map((char, idx) => (
              <span key={`w1-${idx}`} className="overflow-hidden inline-block">
                <span
                  className="preloader-letter"
                  style={{ animationDelay: `${idx * 34}ms` }}
                >
                  {char}
                </span>
              </span>
            ))}
          </span>

          <span className="inline-flex">
            {WORD_TWO.map((char, idx) => (
              <span key={`w2-${idx}`} className="overflow-hidden inline-block">
                <span
                  className="preloader-letter"
                  style={{ animationDelay: `${(WORD_ONE.length + idx) * 34 + 50}ms` }}
                >
                  {char}
                </span>
              </span>
            ))}
          </span>
        </div>

        <div className="preloader-rule w-12 h-px bg-obsidian/20 my-5 rounded-full" />

        <div className="w-44 sm:w-56 h-[2px] rounded-full bg-hairline overflow-hidden">
          <div className="preloader-progress-fill w-full h-full rounded-full bg-obsidian" />
        </div>
      </div>
    </div>
  );
}
