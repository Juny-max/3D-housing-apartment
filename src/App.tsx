import { useEffect, useState } from 'react';
import { AdvisorySection } from './components/AdvisorySection';
import { Footer } from './components/Footer';
import { GallerySection } from './components/GallerySection';
import { HeroSection } from './components/HeroSection';
import { InteriorAnatomySection } from './components/InteriorAnatomySection';
import { LightboxModal } from './components/LightboxModal';
import { Navbar } from './components/Navbar';
import { PhilosophySection } from './components/PhilosophySection';
import { PreloaderOverlay } from './components/PreloaderOverlay';
import { PropertyModal } from './components/PropertyModal';
import { ResidencesSection } from './components/ResidencesSection';
import { ScrollManifestoSection } from './components/ScrollManifestoSection';
import { SpatialStudioSection } from './components/SpatialStudioSection';
import { StudioInviteSection } from './components/StudioInviteSection';
import { RESIDENCES, ResidenceId } from './data/residences';

type ActivePage = 'home' | 'studio';

function resolveInitialPage(): ActivePage {
  return window.location.hash.startsWith('#studio') ? 'studio' : 'home';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<ActivePage>(resolveInitialPage);
  const [preloaderDone, setPreloaderDone] = useState<boolean>(() => resolveInitialPage() === 'studio');
  const [activeResidence3D, setActiveResidence3D] = useState<ResidenceId>('veranda');
  const [dossierIndex, setDossierIndex] = useState<number | null>(null);
  const [lightboxState, setLightboxState] = useState<{ src: string; caption: string } | null>(
    null,
  );
  const [advisoryResidence, setAdvisoryResidence] = useState<string>('');

  // Sync browser back/forward with hash routes (#studio vs home sections)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#studio')) {
        setCurrentPage('studio');
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateToPage = (page: ActivePage, sectionId?: string) => {
    if (page === 'studio') {
      setCurrentPage('studio');
      if (window.location.hash !== '#studio') {
        window.location.hash = '#studio';
      }
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }

    const wasStudio = currentPage !== 'home';
    setCurrentPage('home');

    const scrollTarget = () => {
      if (!sectionId || sectionId === 'hero') {
        window.history.replaceState(null, '', '#');
        window.scrollTo({ top: 0, behavior: wasStudio ? ('instant' as ScrollBehavior) : 'smooth' });
        return;
      }
      window.history.replaceState(null, '', `#${sectionId}`);
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: wasStudio ? ('instant' as ScrollBehavior) : 'smooth' });
      }
    };

    if (wasStudio) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(scrollTarget);
      });
    } else {
      scrollTarget();
    }
  };

  const handleInspectIn3D = (id: ResidenceId) => {
    setActiveResidence3D(id);
    navigateToPage('studio');
  };

  const handleScheduleTour = (residenceOption: string) => {
    setAdvisoryResidence(residenceOption);
    navigateToPage('home', 'contact');
  };

  const activeDossier = dossierIndex !== null ? RESIDENCES[dossierIndex] ?? null : null;

  return (
    <div className="min-h-screen bg-paper text-obsidian flex flex-col">
      {!preloaderDone && (
        <PreloaderOverlay
          skipImmediately={currentPage === 'studio'}
          onComplete={() => setPreloaderDone(true)}
        />
      )}

      <Navbar currentPage={currentPage} onNavigatePage={navigateToPage} />

      <main className="flex-1">
        {currentPage === 'studio' ? (
          <SpatialStudioSection
            activeResidence={activeResidence3D}
            onSelectResidence={setActiveResidence3D}
            onOpenDossier={(idx) => setDossierIndex(idx)}
          />
        ) : (
          <>
            <HeroSection onInspectStudio={() => navigateToPage('studio')} />
            <ScrollManifestoSection onOpenStudio={() => navigateToPage('studio')} />
            <ResidencesSection onOpenDossier={(idx) => setDossierIndex(idx)} />
            <StudioInviteSection onOpenStudio={() => navigateToPage('studio')} />
            <InteriorAnatomySection
              onOpenLightbox={(src, caption) => setLightboxState({ src, caption })}
            />
            <PhilosophySection />
            <GallerySection
              onOpenLightbox={(src, caption) => setLightboxState({ src, caption })}
            />
            <AdvisorySection preselectedResidenceTitle={advisoryResidence} />
          </>
        )}
      </main>

      {currentPage === 'home' && <Footer onNavigatePage={navigateToPage} />}

      <PropertyModal
        residence={activeDossier}
        onClose={() => setDossierIndex(null)}
        onOpenLightbox={(src, caption) => setLightboxState({ src, caption })}
        onInspectIn3D={handleInspectIn3D}
        onScheduleTour={handleScheduleTour}
      />

      <LightboxModal
        imageSrc={lightboxState?.src ?? null}
        caption={lightboxState?.caption ?? ''}
        onClose={() => setLightboxState(null)}
      />
    </div>
  );
}
