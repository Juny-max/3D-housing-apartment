import { Box, X } from 'lucide-react';
import { useEffect } from 'react';
import { ResidenceId, ResidenceProfile } from '../data/residences';
import { ResilientImage, resolveBundledImageSrc } from './ResilientImage';

interface PropertyModalProps {
  residence: ResidenceProfile | null;
  onClose: () => void;
  onOpenLightbox: (src: string, caption: string) => void;
  onInspectIn3D: (id: ResidenceId) => void;
  onScheduleTour: (residenceOption: string) => void;
}

export function PropertyModal({
  residence,
  onClose,
  onOpenLightbox,
  onInspectIn3D,
  onScheduleTour,
}: PropertyModalProps) {
  useEffect(() => {
    if (!residence) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [residence, onClose]);

  if (!residence) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-obsidian/70 flex items-center justify-center p-4 sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[28px] max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-hairline shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-hairline sticky top-0 bg-white z-10">
          <div>
            <span className="text-[11px] font-medium text-stone block">Residence Dossier</span>
            <h3
              id="property-modal-title"
              className="font-display font-bold text-xl sm:text-2xl tracking-tight text-obsidian"
            >
              {residence.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close residence dossier"
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-alabaster transition-colors text-obsidian"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-10 space-y-8">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-alabaster">
            <ResilientImage
              src={residence.heroImage}
              alt={`${residence.title} architectural showcase`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <p className="text-sm sm:text-base font-light text-stone leading-relaxed">
                {residence.summary}
              </p>
            </div>
            <dl className="bg-alabaster rounded-2xl p-5 border border-hairline space-y-3 text-xs">
              <div className="flex justify-between items-baseline gap-3">
                <dt className="text-stone whitespace-nowrap">Price</dt>
                <dd className="font-mono font-semibold tabular-nums text-obsidian whitespace-nowrap">
                  {residence.price}
                </dd>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <dt className="text-stone whitespace-nowrap">Configuration</dt>
                <dd className="font-medium text-obsidian whitespace-nowrap">
                  {residence.beds} Bed · {residence.baths} Bath
                </dd>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <dt className="text-stone whitespace-nowrap">Area</dt>
                <dd className="font-mono font-medium tabular-nums text-obsidian whitespace-nowrap">
                  {residence.areaSqFt.toLocaleString()} Sq Ft
                </dd>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <dt className="text-stone whitespace-nowrap">Clear Span</dt>
                <dd className="font-mono font-medium tabular-nums text-obsidian whitespace-nowrap">
                  {residence.ceilingHeight}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <span className="text-xs font-medium text-stone block mb-4">
              Included Interior Rooms (Living · Kitchen · Bedroom · Shower)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {residence.rooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() =>
                    onOpenLightbox(
                      resolveBundledImageSrc(room.image),
                      `${residence.title} — ${room.label}`,
                    )
                  }
                  className="group text-left cursor-pointer"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-alabaster mb-2">
                    <ResilientImage
                      src={room.image}
                      alt={`${residence.title} ${room.label}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="text-xs font-medium text-obsidian block">{room.label}</span>
                  <span className="text-[11px] text-stone block truncate">{room.dimensions}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-5 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                onInspectIn3D(residence.id);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-obsidian text-obsidian text-xs font-medium px-6 py-3.5 hover:bg-alabaster transition-colors cursor-pointer"
            >
              <Box className="w-4 h-4" />
              <span>Inspect in 3D Studio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onScheduleTour(`${residence.shortTitle} — ${residence.price}`);
              }}
              className="rounded-full bg-obsidian text-white text-xs font-medium px-7 py-3.5 hover:bg-stone transition-colors cursor-pointer"
            >
              Schedule Private Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
