import { ArrowRight, Box } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HERO_SCENES } from '../data/residences';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onInspectStudio: () => void;
}

export function HeroSection({ onInspectStudio }: HeroSectionProps) {
  const [activeScene, setActiveScene] = useState(0);
  const heroRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveScene((prev) => (prev + 1) % HERO_SCENES.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--hero-p', '0');
      return;
    }

    let rafId = 0;
    const updateHeroScroll = () => {
      rafId = 0;
      const vh = window.innerHeight || 900;
      const p = Math.max(0, Math.min(1, window.scrollY / vh));
      el.style.setProperty('--hero-p', p.toFixed(4));
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateHeroScroll);
    };

    updateHeroScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!gridRef.current) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 14;
    const y = (e.clientY / window.innerHeight - 0.5) * 14;
    gridRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[100svh] flex flex-col justify-between pt-28 sm:pt-32 pb-0 overflow-hidden bg-obsidian text-white"
    >
      {/* Full-bleed Architectural Photography with Scroll-Driven Depth */}
      <div className="hero-parallax-layer absolute inset-0 z-0 overflow-hidden">
        {HERO_SCENES.map((scene, idx) => (
          <div
            key={scene.id}
            className={`hero-slide ${activeScene === idx ? 'active' : ''}`}
            aria-hidden={activeScene !== idx}
          >
            <ResilientImage src={scene.image} alt={scene.alt} loading="eager" />
          </div>
        ))}

        {/* Directional chiaroscuro scrims for crisp display typography */}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/88 via-obsidian/50 to-obsidian/18" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/92 via-obsidian/22 to-obsidian/48" />
        <div className="hero-light-sweep" />

        <svg
          ref={gridRef}
          className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none transition-transform duration-700 ease-out"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="arch-grid" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#FFFFFF" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#arch-grid)" />
        </svg>
      </div>

      {/* Primary Hero Architectural Composition */}
      <div className="hero-foreground-drift relative z-10 flex-1 flex items-center max-w-7xl mx-auto px-6 sm:px-10 w-full py-10 sm:py-14">
        <div className="max-w-4xl">
          <h1 className="font-display font-extrabold text-[clamp(3.2rem,8.4vw,7.25rem)] leading-[0.95] tracking-[-0.04em] text-white mb-7 [text-wrap:balance]">
            <span className="hero-reveal-line py-0.5">
              <span className="hero-reveal-inner" style={{ animationDelay: '0.06s' }}>
                Atelier
              </span>
            </span>
            <span className="hero-reveal-line py-0.5">
              <span className="hero-reveal-inner" style={{ animationDelay: '0.18s' }}>
                Kova
                <sup className="text-[0.3em] font-semibold align-super ml-1 text-white/80">®</sup>
              </span>
            </span>
          </h1>

          <p className="hero-reveal-line max-w-xl">
            <span
              className="hero-reveal-inner text-sm sm:text-lg font-light leading-relaxed text-white/85"
              style={{ animationDelay: '0.3s' }}
            >
              Architecture and residential curation shaping calm, daylight-calibrated concrete,
              white oak, and travertine spaces built for quiet clarity.
            </span>
          </p>
        </div>
      </div>

      {/* Anchored Frosted Glass Bottom Architectural Strip */}
      <div className="relative z-10 border-t border-white/15 bg-obsidian/55 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Minimalist Thumbnail Scene Switcher (image-only, rounded frames) */}
          <div
            className="flex items-center gap-2.5"
            role="group"
            aria-label="Hero scene selector"
          >
            {HERO_SCENES.map((scene, idx) => {
              const isActive = activeScene === idx;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setActiveScene(idx)}
                  aria-label={`Show backdrop scene ${idx + 1}`}
                  aria-pressed={isActive}
                  className={`p-1 rounded-2xl border transition-all duration-300 cursor-pointer shrink-0 ${
                    isActive
                      ? 'border-white/80 bg-white/18 scale-[1.03]'
                      : 'border-white/20 bg-white/5 opacity-75 hover:opacity-100 hover:border-white/45'
                  }`}
                >
                  <span className="w-12 h-8 rounded-xl overflow-hidden bg-obsidian block">
                    <ResilientImage
                      src={scene.image}
                      alt=""
                      loading="eager"
                      className="w-full h-full object-cover"
                    />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onInspectStudio}
              className="inline-flex items-center gap-2.5 rounded-full bg-white text-obsidian text-xs font-medium px-6 py-3.5 hover:bg-alabaster transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Box className="w-4 h-4" />
              <span>Inspect 3D Pavilion</span>
            </button>

            <a
              href="#residences"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/45 text-white text-xs font-medium px-6 py-3.5 hover:bg-white/10 transition-colors duration-200 whitespace-nowrap shrink-0"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
