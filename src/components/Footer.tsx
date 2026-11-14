interface FooterProps {
  onNavigatePage: (page: 'home' | 'studio', sectionId?: string) => void;
}

export function Footer({ onNavigatePage }: FooterProps) {
  return (
    <footer className="bg-alabaster text-obsidian border-t border-hairline py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 pb-12 border-b border-hairline">
          <div>
            <button
              type="button"
              onClick={() => onNavigatePage('home', 'hero')}
              className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-obsidian block mb-2.5 text-left cursor-pointer hover:text-stone transition-colors"
            >
              ATELIER KOVA
            </button>
            <p className="text-xs tracking-wide text-stone">
              Architectural Residences · 420 Mercer Square, Suite 9B · advisory@atelierkova.com
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap gap-6 sm:gap-8 text-xs font-medium text-stone">
            <button
              type="button"
              onClick={() => onNavigatePage('studio')}
              className="hover:text-obsidian transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              3D Studio
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('home', 'residences')}
              className="hover:text-obsidian transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Residences
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('home', 'interiors')}
              className="hover:text-obsidian transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Spaces
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('home', 'philosophy')}
              className="hover:text-obsidian transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Ethos
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('home', 'gallery')}
              className="hover:text-obsidian transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Gallery
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('home', 'contact')}
              className="hover:text-obsidian transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Private Viewing
            </button>
          </nav>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone">
          <span>© 2026 Atelier Kova Realty. All rights reserved.</span>
          <span>Architecture · Light · Proportion</span>
        </div>
      </div>
    </footer>
  );
}
