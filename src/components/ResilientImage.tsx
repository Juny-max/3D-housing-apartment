import { useState } from 'react';
import culinaryKitchenImg from '../assets/images/culinary_kitchen_island_1794514073818.jpg';
import horizonLivingImg from '../assets/images/horizon_living_room_1794514074010.jpg';
import masterBedroomImg from '../assets/images/master_bedroom_sanctuary_1794514074978.jpg';
import solisExteriorImg from '../assets/images/solis_pavilion_exterior_1794514073738.jpg';
import spaShowerImg from '../assets/images/spa_walkin_shower_1794514075185.jpg';
import verandaExteriorImg from '../assets/images/veranda_exterior_1794514073283.jpg';

const BUNDLED_IMAGE_MAP: Record<string, string> = {
  '/src/assets/images/veranda_exterior_1794514073283.jpg': verandaExteriorImg,
  '/src/assets/images/solis_pavilion_exterior_1794514073738.jpg': solisExteriorImg,
  '/src/assets/images/horizon_living_room_1794514074010.jpg': horizonLivingImg,
  '/src/assets/images/culinary_kitchen_island_1794514073818.jpg': culinaryKitchenImg,
  '/src/assets/images/master_bedroom_sanctuary_1794514074978.jpg': masterBedroomImg,
  '/src/assets/images/spa_walkin_shower_1794514075185.jpg': spaShowerImg,
};

export function resolveBundledImageSrc(src: string): string {
  return BUNDLED_IMAGE_MAP[src] ?? src;
}

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function ResilientImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  loading = 'eager',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = resolveBundledImageSrc(src);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full bg-alabaster border border-hairline flex flex-col items-center justify-center p-6 text-center"
      >
        <svg
          className="w-8 h-8 text-stone/50 mb-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
          />
        </svg>
        <span className="text-xs font-medium text-stone max-w-[20ch] leading-snug">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
