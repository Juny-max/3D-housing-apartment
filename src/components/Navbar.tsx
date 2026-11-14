import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NavbarProps {
  currentPage: 'home' | 'studio';
  onNavigatePage: (page: 'home' | 'studio', sectionId?: string) => void;
}

export function Navbar({ currentPage, onNavigatePage }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (page: 'home' | 'studio', sectionId?: string) => {
    setMobileOpen(false);
    onNavigatePage(page, sectionId);
  };

  const isFloatingGlass = scrolled || currentPage === 'studio';

  return (
    <header
      id="navbar"
      className="fixed top-0 inset-x-0 z-50 flex flex-col items-center pointer-events-none"
    >
      <div
        data-floating={isFloatingGlass ? 'true' : 'false'}
        className={`liquid-glass-nav pointer-events-auto ${
          isFloatingGlass ? 'text-obsidian' : 'text-white'
        }`}
      >
        <div
          className={`relative z-10 mx-auto flex items-center justify-between gap-6 sm:gap-8 transition-[height,padding] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isFloatingGlass ? 'h-14 px-5 sm:px-7' : 'max-w-7xl h-18 px-6 sm:px-10'
          }`}
        >
          <button
            type="button"
            onClick={() => handleNav('home', 'hero')}
            className={`font-display font-extrabold tracking-tight whitespace-nowrap shrink-0 cursor-pointer transition-all duration-500 ${
              isFloatingGlass ? 'text-base sm:text-lg text-obsidian' : 'text-lg sm:text-xl text-white'
            }`}
          >
            ATELIER KOVA
          </button>

          <nav
            aria-label="Primary"
            className={`hidden md:flex items-center gap-6 lg:gap-7 text-xs font-medium transition-colors duration-300 ${
              isFloatingGlass ? 'text-obsidian/75' : 'text-white/80'
            }`}
          >
            <button
              type="button"
              onClick={() => handleNav('studio')}
              aria-current={currentPage === 'studio' ? 'page' : undefined}
              className={`transition-all duration-200 whitespace-nowrap shrink-0 px-2.5 py-1.5 rounded-full cursor-pointer ${
                currentPage === 'studio'
                  ? 'bg-obsidian/10 text-obsidian'
                  : isFloatingGlass
                    ? 'hover:text-obsidian hover:bg-obsidian/[0.06]'
                    : 'hover:text-white hover:bg-white/10'
              }`}
            >
              3D Studio
            </button>
            <button
              type="button"
              onClick={() => handleNav('home', 'residences')}
              className={`transition-all duration-200 whitespace-nowrap shrink-0 px-2.5 py-1.5 rounded-full cursor-pointer ${
                isFloatingGlass
                  ? 'hover:text-obsidian hover:bg-obsidian/[0.06]'
                  : 'hover:text-white hover:bg-white/10'
              }`}
            >
              Residences
            </button>
            <button
              type="button"
              onClick={() => handleNav('home', 'interiors')}
              className={`transition-all duration-200 whitespace-nowrap shrink-0 px-2.5 py-1.5 rounded-full cursor-pointer ${
                isFloatingGlass
                  ? 'hover:text-obsidian hover:bg-obsidian/[0.06]'
                  : 'hover:text-white hover:bg-white/10'
              }`}
            >
              Spaces
            </button>
            <button
              type="button"
              onClick={() => handleNav('home', 'philosophy')}
              className={`transition-all duration-200 whitespace-nowrap shrink-0 px-2.5 py-1.5 rounded-full cursor-pointer ${
                isFloatingGlass
                  ? 'hover:text-obsidian hover:bg-obsidian/[0.06]'
                  : 'hover:text-white hover:bg-white/10'
              }`}
            >
              Ethos
            </button>
            <button
              type="button"
              onClick={() => handleNav('home', 'gallery')}
              className={`transition-all duration-200 whitespace-nowrap shrink-0 px-2.5 py-1.5 rounded-full cursor-pointer ${
                isFloatingGlass
                  ? 'hover:text-obsidian hover:bg-obsidian/[0.06]'
                  : 'hover:text-white hover:bg-white/10'
              }`}
            >
              Gallery
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleNav('home', 'contact')}
              className={`hidden sm:inline-flex items-center justify-center text-xs font-medium rounded-full transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                isFloatingGlass
                  ? 'bg-obsidian text-white hover:bg-obsidian/85 px-4 py-2 shadow-sm'
                  : 'border border-white/65 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-obsidian px-5 py-2.5'
              }`}
            >
              Private Viewing
            </button>

            <button
              type="button"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
              className={`md:hidden p-2 min-w-[42px] min-h-[42px] rounded-full flex items-center justify-center transition-colors ${
                isFloatingGlass ? 'text-obsidian hover:bg-obsidian/10' : 'text-white hover:bg-white/10'
              }`}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden pointer-events-auto w-[calc(100vw-24px)] max-w-md mt-2 rounded-3xl bg-white/85 backdrop-blur-2xl text-obsidian border border-white/75 shadow-2xl px-6 py-5 flex flex-col gap-3"
        >
          <button
            type="button"
            onClick={() => handleNav('studio')}
            className="text-left text-sm font-medium text-obsidian py-2 border-b border-hairline"
          >
            3D Studio
          </button>
          <button
            type="button"
            onClick={() => handleNav('home', 'residences')}
            className="text-left text-sm font-medium text-obsidian py-2 border-b border-hairline"
          >
            Residences
          </button>
          <button
            type="button"
            onClick={() => handleNav('home', 'interiors')}
            className="text-left text-sm font-medium text-obsidian py-2 border-b border-hairline"
          >
            Spaces
          </button>
          <button
            type="button"
            onClick={() => handleNav('home', 'philosophy')}
            className="text-left text-sm font-medium text-obsidian py-2 border-b border-hairline"
          >
            Ethos
          </button>
          <button
            type="button"
            onClick={() => handleNav('home', 'gallery')}
            className="text-left text-sm font-medium text-obsidian py-2 border-b border-hairline"
          >
            Gallery
          </button>
          <button
            type="button"
            onClick={() => handleNav('home', 'contact')}
            className="inline-flex items-center justify-center text-xs font-medium bg-obsidian text-white rounded-full px-5 py-3 mt-1"
          >
            Private Viewing
          </button>
        </nav>
      )}
    </header>
  );
}
