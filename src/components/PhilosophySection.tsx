import { useRef } from 'react';
import { useSectionReveal } from '../hooks/useScrollChoreography';

interface MetricCardProps {
  valueText: string;
  label: string;
  delayMs: number;
}

function MetricCard({ valueText, label, delayMs }: MetricCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  useSectionReveal(cardRef, 0.1);

  return (
    <div
      ref={cardRef}
      style={{ transitionDelay: `${delayMs}ms` }}
      className="text-center anim-unfold"
    >
      <div className="font-display font-extrabold text-5xl sm:text-6xl tracking-tight mb-3 font-mono tabular-nums text-obsidian">
        {valueText}
      </div>
      <p className="text-xs font-medium tracking-wide text-stone">{label}</p>
    </div>
  );
}

export function PhilosophySection() {
  const headerRef = useRef<HTMLDivElement | null>(null);
  useSectionReveal(headerRef, 0.1);

  return (
    <section id="philosophy" className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div ref={headerRef} className="max-w-4xl mx-auto text-center anim-focus-zoom">
          <h2 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.98] mb-8 text-obsidian [text-wrap:balance]">
            Less Noise. More Breathing Room.
          </h2>
          <p className="text-base sm:text-lg font-light text-stone max-w-2xl mx-auto leading-relaxed">
            We represent residences where proportion, natural daylight, and honest materials do
            the talking—eliminating visual clutter so daily life feels grounded.
          </p>
        </div>

        <div className="perspective-wrap grid grid-cols-1 sm:grid-cols-3 gap-12 mt-20 pt-16 border-t border-hairline">
          <MetricCard valueText="48+" label="Architectural Developments" delayMs={0} />
          <MetricCard valueText="98%" label="Daylight Optimization" delayMs={90} />
          <MetricCard valueText="$420M" label="Curated Portfolio Value" delayMs={180} />
        </div>
      </div>
    </section>
  );
}
