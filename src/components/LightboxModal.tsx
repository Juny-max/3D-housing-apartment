import { X } from 'lucide-react';
import { useEffect } from 'react';
import { ResilientImage } from './ResilientImage';

interface LightboxModalProps {
  imageSrc: string | null;
  caption: string;
  onClose: () => void;
}

export function LightboxModal({ imageSrc, caption, onClose }: LightboxModalProps) {
  useEffect(() => {
    if (!imageSrc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [imageSrc, onClose]);

  if (!imageSrc) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={caption || 'Architectural image preview'}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-obsidian/92 flex items-center justify-center p-4 sm:p-10"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-5xl w-full"
      >
        <div className="flex justify-between items-center gap-4 text-white mb-4">
          <span className="text-xs font-medium tracking-wide text-white/85 truncate">
            {caption}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close image lightbox"
            className="inline-flex items-center gap-1.5 text-white/85 hover:text-white text-xs font-medium px-3 py-2 min-h-[40px]"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-obsidian rounded-2xl overflow-hidden">
          <ResilientImage
            src={imageSrc}
            alt={caption}
            className="w-full max-h-[80vh] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
