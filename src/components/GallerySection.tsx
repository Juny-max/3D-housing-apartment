import { useState } from 'react';
import { GALLERY_ITEMS, GalleryCategory, filterGalleryItems } from '../data/residences';
import { ResilientImage, resolveBundledImageSrc } from './ResilientImage';

interface GallerySectionProps {
  onOpenLightbox: (src: string, caption: string) => void;
}

const FILTER_OPTIONS: Array<{ id: GalleryCategory; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'apartment', label: 'Apartments' },
  { id: 'living', label: 'Living Rooms' },
  { id: 'kitchen', label: 'Kitchens' },
  { id: 'bedroom', label: 'Bedrooms' },
  { id: 'shower', label: 'Showers' },
];

export function GallerySection({ onOpenLightbox }: GallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all');
  const visibleItems = filterGalleryItems(GALLERY_ITEMS, activeCategory);

  return (
    <section id="gallery" className="py-24 sm:py-32 bg-alabaster border-t border-hairline">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div>
            <h2 className="font-display font-bold text-3xl sm:text-5xl tracking-tight">
              Explore by Room
            </h2>
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter gallery by room category"
          >
            {FILTER_OPTIONS.map((opt) => {
              const isActive = activeCategory === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActiveCategory(opt.id)}
                  aria-pressed={isActive}
                  className={`px-4 py-2 text-xs font-medium rounded-full border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'border-obsidian bg-obsidian text-white'
                      : 'border-hairline bg-white text-stone hover:border-obsidian hover:text-obsidian'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          data-testid="gallery-grid"
        >
          {visibleItems.map((item) => (
            <button
              key={`${activeCategory}-${item.id}`}
              type="button"
              onClick={() => onOpenLightbox(resolveBundledImageSrc(item.image), item.caption)}
              className="bg-white p-3.5 rounded-[26px] border border-hairline cursor-pointer group text-left block w-full hover:border-obsidian/40 transition-colors"
            >
              <div className="aspect-[4/3] rounded-[14px] overflow-hidden bg-alabaster mb-4 image-hover-zoom">
                <ResilientImage
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="font-display font-bold text-sm text-obsidian truncate">
                  {item.title}
                </span>
                <span className="text-xs text-stone whitespace-nowrap shrink-0">
                  {item.categoryLabel}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
