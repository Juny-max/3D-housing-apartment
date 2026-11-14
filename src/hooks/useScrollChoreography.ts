import { RefObject, useEffect, useState } from 'react';

/**
 * Computes normalized 0..1 traversal progress for an element crossing the viewport:
 * 0 when its top enters the bottom of the viewport; 1 when its bottom leaves the top.
 */
export function computeScrollProgressRatio(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number,
): number {
  const span = viewportHeight + rectHeight;
  if (span <= 0) return 0;
  const raw = (viewportHeight - rectTop) / span;
  return Math.max(0, Math.min(1, raw));
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Adds/keeps `'is-visible'` once an element crosses into the viewport.
 * Falls back immediately to visible when reduced motion is enabled or IO is unavailable.
 */
export function useSectionReveal<T extends HTMLElement>(
  ref: RefObject<T | null>,
  threshold = 0.02,
): boolean {
  const [visible, setVisible] = useState<boolean>(() => prefersReducedMotion());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      setVisible(true);
      el.classList.add('is-visible');
    };

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      reveal();
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top <= (window.innerHeight || 900) + 60) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top <= (window.innerHeight || 900)) {
            reveal();
            observer.unobserve(el);
            break;
          }
        }
      },
      { threshold, rootMargin: '60px 0px 60px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return visible;
}

/**
 * Drives a lightweight GPU-composited `--scroll-p` (0..1) CSS variable directly on `ref`
 * without triggering React re-renders on scroll.
 */
export function useScrollScrub<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onUpdate?: (progress: number) => void,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.setProperty('--scroll-p', '0.55');
      onUpdate?.(0.55);
      return;
    }

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const p = computeScrollProgressRatio(rect.top, rect.height, window.innerHeight || 900);
      el.style.setProperty('--scroll-p', p.toFixed(4));
      onUpdate?.(p);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [ref, onUpdate]);
}
