import { ArrowRight, Box } from 'lucide-react';
import { useRef } from 'react';
import { REFERENCE_ASSETS } from '../data/residences';
import { useSectionReveal } from '../hooks/useScrollChoreography';
import { ResilientImage } from './ResilientImage';

interface StudioInviteSectionProps {
  onOpenStudio: () => void;
}

export function StudioInviteSection({ onOpenStudio }: StudioInviteSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const blueprintRef = useRef<HTMLButtonElement | null>(null);

  useSectionReveal(sectionRef);
  useSectionReveal(blueprintRef);

  return (
    <section
      ref={sectionRef}
      className="py-20 sm:py-24 bg-white border-t border-hairline overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-5 anim-split-left is-visible">
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.06] text-obsidian mb-5 [text-wrap:balance]">
              Walk Every Room in Dedicated 3D.
            </h2>
            <p className="text-sm sm:text-base font-light text-stone leading-relaxed mb-8">
              Open our interactive 3D studio to inspect the exterior elevation, ground-floor
              blueprint cutaway, and room-by-room architectural finishes in full viewport scale.
            </p>
            <button
              type="button"
              onClick={onOpenStudio}
              className="inline-flex items-center gap-2.5 rounded-full bg-obsidian text-white text-xs font-medium px-7 py-4 hover:bg-stone transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Box className="w-4 h-4" />
              <span>Launch 3D Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-7">
            <button
              ref={blueprintRef}
              type="button"
              onClick={onOpenStudio}
              aria-label="Open 3D Blueprint Cutaway"
              className="w-full aspect-[16/10] rounded-[28px] overflow-hidden border border-hairline bg-alabaster image-hover-zoom cursor-pointer text-left block anim-curtain-right"
            >
              <ResilientImage
                src={REFERENCE_ASSETS.blueprint}
                alt="Architectural ground floor blueprint plan"
                loading="eager"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
