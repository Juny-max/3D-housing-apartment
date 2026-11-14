import { ArrowUpRight, Box } from 'lucide-react';
import { useRef } from 'react';
import { GENERATED_IMAGES } from '../data/residences';
import { useScrollScrub } from '../hooks/useScrollChoreography';
import { ResilientImage } from './ResilientImage';

interface ScrollManifestoSectionProps {
  onOpenStudio: () => void;
}

const STATEMENT_WORDS =
  'Atelier Kova shapes tranquil architectural residences built around raw concrete, European white oak, and calibrated natural daylight.'.split(
    ' ',
  );

export function ScrollManifestoSection({ onOpenStudio }: ScrollManifestoSectionProps) {
  const statementRef = useRef<HTMLDivElement | null>(null);
  const wordsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const panoramaRef = useRef<HTMLDivElement | null>(null);

  useScrollScrub(statementRef, (p) => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const total = wordsRef.current.length;
    for (let i = 0; i < total; i++) {
      const span = wordsRef.current[i];
      if (!span) continue;
      if (reduced) {
        span.style.opacity = '1';
        continue;
      }
      const start = 0.14 + (i / total) * 0.46;
      const local = Math.max(0, Math.min(1, (p - start) / 0.12));
      span.style.opacity = (0.2 + local * 0.8).toFixed(3);
    }
  });

  useScrollScrub(panoramaRef);

  return (
    <section className="bg-white border-t border-hairline overflow-x-clip">
      {/* Scroll-Illuminated Architectural Manifesto */}
      <div ref={statementRef} className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
        <div className="max-w-5xl">
          <p className="text-xs font-medium tracking-wide text-stone mb-6">Studio Manifesto</p>
          <p className="font-display font-bold text-[clamp(1.65rem,3.6vw,3.15rem)] leading-[1.15] tracking-tight text-obsidian [text-wrap:balance]">
            {STATEMENT_WORDS.map((word, idx) => (
              <span
                key={`${word}-${idx}`}
                ref={(el) => {
                  wordsRef.current[idx] = el;
                }}
                style={{ opacity: 0.25 }}
                className="inline-block mr-[0.26em] transition-opacity duration-75 will-change-[opacity]"
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* Rounded Scroll-Scrubbed Architectural Panorama & Horizontal Marquee */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-6">
        <div
          ref={panoramaRef}
          className="relative h-[46vh] min-h-[340px] max-h-[520px] rounded-[28px] bg-obsidian overflow-hidden border border-hairline flex flex-col justify-end"
        >
          <div className="absolute inset-0 overflow-hidden">
            <ResilientImage
              src={GENERATED_IMAGES.verandaExterior}
              alt="Cantilevered concrete and glass residence facade"
              loading="eager"
              className="panorama-scrub-img w-full h-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-obsidian/45 via-obsidian/30 to-obsidian/85" />
          </div>

          {/* Continuous Scroll-Linked Giant Kinetic Type Track */}
          <div className="relative z-10 overflow-hidden py-8 sm:py-12 select-none pointer-events-none my-auto">
            <div className="marquee-scrub-track flex items-center gap-12 whitespace-nowrap font-display font-extrabold text-[clamp(2.5rem,6vw,5.25rem)] tracking-[-0.03em] text-white/90">
              <span>Atelier Kova Studio</span>
              <span className="text-white/35">·</span>
              <span>Interactive 3D Living</span>
              <span className="text-white/35">·</span>
              <span>Light &amp; Proportion</span>
              <span className="text-white/35">·</span>
              <span>Atelier Kova Studio</span>
            </div>
          </div>

          <div className="relative z-10 w-full px-6 sm:px-10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/15 pt-4">
            <p className="text-xs sm:text-sm font-light text-white/85">
              Explore ground-floor architecture, first-floor suites, and real-time daylight simulation.
            </p>
            <button
              type="button"
              onClick={onOpenStudio}
              className="inline-flex items-center gap-2 rounded-full bg-white text-obsidian text-xs font-medium px-5 py-2.5 hover:bg-alabaster transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Open 3D Studio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
