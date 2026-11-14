import { useRef } from 'react';
import { INTERIOR_ANATOMY, InteriorAnatomyItem } from '../data/residences';
import { useSectionReveal } from '../hooks/useScrollChoreography';
import { ResilientImage, resolveBundledImageSrc } from './ResilientImage';

interface InteriorAnatomySectionProps {
  onOpenLightbox: (src: string, caption: string) => void;
}

function AnatomyRow({
  room,
  onOpenLightbox,
}: {
  room: InteriorAnatomyItem;
  onOpenLightbox: (src: string, caption: string) => void;
}) {
  const isImageLeft = room.layoutDirection === 'image-left';
  const imgRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  useSectionReveal(imgRef, 0.1);
  useSectionReveal(textRef, 0.1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
      <div
        ref={imgRef}
        className={`lg:col-span-7 rounded-[28px] overflow-hidden bg-white border border-hairline ${
          isImageLeft ? 'anim-curtain-left' : 'order-1 lg:order-2 anim-curtain-right'
        }`}
      >
        <button
          type="button"
          onClick={() => onOpenLightbox(resolveBundledImageSrc(room.image), room.caption)}
          aria-label={`Enlarge ${room.caption}`}
          className="block w-full aspect-[16/10] overflow-hidden image-hover-zoom cursor-pointer text-left"
        >
          <ResilientImage
            src={room.image}
            alt={room.alt}
            loading="eager"
            className="w-full h-full object-cover"
          />
        </button>
      </div>

      <div
        ref={textRef}
        className={`lg:col-span-5 anim-slide-counter ${
          isImageLeft ? '' : 'order-2 lg:order-1 from-left'
        }`}
      >
        <span className="text-xs font-medium text-sand block mb-3">
          {room.number}. {room.categoryLabel}
        </span>
        <h3 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-5 text-obsidian">
          {room.title}
        </h3>
        <p className="text-sm sm:text-base font-light text-stone leading-relaxed mb-8">
          {room.description}
        </p>
        <dl className="space-y-3 text-xs text-stone border-t border-hairline pt-6">
          {room.metrics.map((m) => (
            <div key={m.label} className="flex justify-between gap-4">
              <dt>{m.label}</dt>
              <dd className="font-medium text-obsidian font-mono tabular-nums">{m.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function InteriorAnatomySection({ onOpenLightbox }: InteriorAnatomySectionProps) {
  const headerRef = useRef<HTMLDivElement | null>(null);
  useSectionReveal(headerRef, 0.1);

  return (
    <section
      id="interiors"
      className="py-24 sm:py-32 bg-alabaster border-y border-hairline overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-20 sm:space-y-28">
        <div ref={headerRef} className="max-w-2xl anim-unmask-up">
          <h2 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.04] text-obsidian [text-wrap:balance]">
            Every Room Designed for Quiet Clarity.
          </h2>
        </div>

        {INTERIOR_ANATOMY.map((room) => (
          <AnatomyRow key={room.number} room={room} onOpenLightbox={onOpenLightbox} />
        ))}
      </div>
    </section>
  );
}
