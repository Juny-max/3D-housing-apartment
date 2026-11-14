import { Bookmark } from 'lucide-react';
import { useRef, useState } from 'react';
import { RESIDENCES, ResidenceProfile } from '../data/residences';
import { useSectionReveal } from '../hooks/useScrollChoreography';
import { ResilientImage } from './ResilientImage';

interface ResidencesSectionProps {
  onOpenDossier: (index: number) => void;
}

const CARD_TONE_SCRIMS = [
  'bg-gradient-to-t from-[#123640] via-[#123640]/82 via-42% to-black/10',
  'bg-gradient-to-t from-[#1b293b] via-[#1b293b]/82 via-42% to-black/10',
  'bg-gradient-to-t from-[#241b16] via-[#241b16]/82 via-42% to-black/10',
];

function ResidenceShowcaseCard({
  res,
  idx,
  isSaved,
  onToggleSave,
  onOpenDossier,
}: {
  res: ResidenceProfile;
  idx: number;
  isSaved: boolean;
  onToggleSave: (id: ResidenceProfile['id']) => void;
  onOpenDossier: (index: number) => void;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  useSectionReveal(cardRef, 0.08);

  const toneScrim = CARD_TONE_SCRIMS[idx % CARD_TONE_SCRIMS.length];

  return (
    <article
      ref={cardRef}
      style={{ transitionDelay: `${idx * 90}ms` }}
      className="anim-lift group relative rounded-[30px] overflow-hidden min-h-[480px] sm:min-h-[510px] flex flex-col justify-between p-5 sm:p-6 bg-obsidian shadow-[0_18px_42px_-16px_rgba(13,13,12,0.28)]"
    >
      {/* Full-bleed backdrop photo */}
      <ResilientImage
        src={res.heroImage}
        alt={`${res.title} architectural exterior`}
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover img-settle transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Directional color-harmonized atmospheric dark scrim */}
      <div className={`absolute inset-0 pointer-events-none ${toneScrim}`} />

      {/* Full-card accessible trigger behind interactive controls */}
      <button
        type="button"
        onClick={() => onOpenDossier(res.index)}
        aria-label={`Open dossier for ${res.title}`}
        className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-[30px]"
      />

      {/* Top-right floating circular bookmark control */}
      <div className="relative z-20 flex justify-end pointer-events-none">
        <button
          type="button"
          onClick={() => onToggleSave(res.id)}
          aria-label={isSaved ? `Remove ${res.title} from saved` : `Save ${res.title}`}
          aria-pressed={isSaved}
          className={`pointer-events-auto w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isSaved
              ? 'bg-white text-obsidian border-white shadow-sm'
              : 'bg-white/22 text-white border-white/30 hover:bg-white/35'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-obsidian' : ''}`} />
        </button>
      </div>

      {/* Lower card content overlay */}
      <div className="relative z-20 mt-auto pt-24 flex flex-col gap-3 pointer-events-none">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display font-bold text-lg sm:text-[21px] tracking-tight text-white truncate">
            {res.title}
          </h3>
          <span className="bg-white/18 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-medium tabular-nums px-3 py-1 rounded-full whitespace-nowrap shrink-0">
            {res.price}
          </span>
        </div>

        <p className="text-xs sm:text-[13px] font-light leading-relaxed text-white/85 line-clamp-2">
          {res.summary}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="bg-white/16 backdrop-blur-md border border-white/15 text-white/95 text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap">
            {res.beds} Bedrooms
          </span>
          <span className="bg-white/16 backdrop-blur-md border border-white/15 text-white/95 text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap">
            {res.baths} Baths
          </span>
          <span className="bg-white/16 backdrop-blur-md border border-white/15 text-white/95 text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap tabular-nums">
            {res.areaSqFt.toLocaleString()} Sq Ft
          </span>
        </div>

        <div className="pt-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => onOpenDossier(res.index)}
            className="w-full rounded-full bg-white text-obsidian hover:bg-alabaster font-semibold text-xs sm:text-[13px] py-3.5 px-5 transition-colors duration-200 cursor-pointer shadow-sm whitespace-nowrap"
          >
            View Residence
          </button>
        </div>
      </div>
    </article>
  );
}

export function ResidencesSection({ onOpenDossier }: ResidencesSectionProps) {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  useSectionReveal(headerRef, 0.08);

  const toggleSave = (id: ResidenceProfile['id']) => {
    setSavedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="residences" className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div
          ref={headerRef}
          className="anim-unmask-up flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 sm:mb-16"
        >
          <div>
            <h2 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-obsidian [text-wrap:balance]">
              Modern Apartments
            </h2>
          </div>
          <p className="max-w-sm text-sm font-light text-stone leading-relaxed">
            Three flagship residential developments featuring floor-to-ceiling glazing, bespoke
            culinary islands, and private spa baths.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-8">
          {RESIDENCES.map((res, idx) => (
            <ResidenceShowcaseCard
              key={res.id}
              res={res}
              idx={idx}
              isSaved={Boolean(savedIds[res.id])}
              onToggleSave={toggleSave}
              onOpenDossier={onOpenDossier}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
