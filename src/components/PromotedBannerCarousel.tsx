import React, { useState, useEffect } from 'react';
import { PromotedBanner } from '../types';
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles, Megaphone, Settings, CheckCircle2 } from 'lucide-react';

interface PromotedBannerCarouselProps {
  banners: PromotedBanner[];
  isAdmin: boolean;
  onOpenAdminPanel?: () => void;
}

export const PromotedBannerCarousel: React.FC<PromotedBannerCarouselProps> = ({
  banners,
  isAdmin,
  onOpenAdminPanel,
}) => {
  const activeBanners = banners.filter((b) => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate every 6 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) {
    if (!isAdmin) return null;
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center text-slate-300 space-y-3 shadow-lg">
        <Megaphone className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
        <h3 className="text-base font-black text-white">Espacio Publicitario de Banners Creador</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          No hay banners activos en este momento. Como administrador, puedes crear banners destacados para trabajadores suscriptos.
        </p>
        {onOpenAdminPanel && (
          <button
            onClick={onOpenAdminPanel}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md inline-flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            <span>Agregar Banners de Publicidad</span>
          </button>
        )}
      </div>
    );
  }

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const badgeColorClasses = {
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    rose: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  const badgeClass = badgeColorClasses[currentBanner.badgeColor || 'amber'] || badgeColorClasses.amber;

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-xl text-white">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="w-full h-full object-cover opacity-25 scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />
      </div>

      {/* Admin Quick Settings Indicator */}
      {isAdmin && onOpenAdminPanel && (
        <button
          onClick={onOpenAdminPanel}
          className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/40 text-[11px] font-black flex items-center gap-1.5 shadow-md backdrop-blur-md transition-all"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Gestionar Banners</span>
        </button>
      )}

      {/* Main Content */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between min-h-[220px] sm:min-h-[240px]">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md ${badgeClass}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {currentBanner.badgeText || 'DESTACADO'}
            </span>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-800">
              Suscripción Creador
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm">
            {currentBanner.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed line-clamp-2">
            {currentBanner.subtitle}
          </p>
        </div>

        {/* Footer Bar: Action Button + Carousel Navigation Controls */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800/80 mt-4">
          <a
            href={currentBanner.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 self-start sm:self-auto"
          >
            <span>{currentBanner.buttonText || 'Contactar Ahora'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Carousel Controls */}
          {activeBanners.length > 1 && (
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-1.5">
                {activeBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
