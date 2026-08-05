import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { SearchBar } from './components/SearchBar';
import { WorkerCard } from './components/WorkerCard';
import { WorkerDetailModal } from './components/WorkerDetailModal';
import { WorkerRegisterForm } from './components/WorkerRegisterForm';
import { ReviewFormModal } from './components/ReviewFormModal';
import { BookingModal } from './components/BookingModal';
import { FerreteriaSponsorBanner } from './components/FerreteriaSponsorBanner';
import { AiAssistant } from './components/AiAssistant';
import { BookingHistoryList } from './components/BookingHistoryList';
import { PromotedBannerCarousel } from './components/PromotedBannerCarousel';
import { AdminPanelModal } from './components/AdminPanelModal';
import { INITIAL_WORKERS, BRUZZONE_PRODUCTS } from './data/mockData';
import { Worker, BookingRequest, Review, TradeCategory, PromotedBanner, TabVisibilityConfig, AppConfig, CustomTradeOption } from './types';
import {
  subscribeWorkers,
  subscribeBookings,
  saveWorkerToFirestore,
  deleteWorkerFromFirestore,
  saveReviewToFirestore,
  saveBookingToFirestore,
  subscribeBanners,
  subscribeAppConfig,
  saveBannerToFirestore,
  deleteBannerFromFirestore,
  saveAppConfigToFirestore,
  clearAllFirestoreData,
  resetFirestoreToDefaults,
  DEFAULT_TAB_CONFIG,
  INITIAL_BANNERS,
} from './lib/firebase';
import { Wrench, ShieldCheck, Sparkles, Building2, ExternalLink, Heart, Phone, MapPin, CheckCircle2, Settings, CloudCheck } from 'lucide-react';

export default function App() {
  // Persistence State synced with Cloud Firestore
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('servigo_workers_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_WORKERS;
  });

  const [bookings, setBookings] = useState<BookingRequest[]>(() => {
    const saved = localStorage.getItem('servigo_bookings_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [banners, setBanners] = useState<PromotedBanner[]>(INITIAL_BANNERS);
  const [tabConfig, setTabConfig] = useState<TabVisibilityConfig>(DEFAULT_TAB_CONFIG);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Subscribe to Cloud Firestore in Realtime
  useEffect(() => {
    const unsubscribeWorkers = subscribeWorkers((firestoreWorkers) => {
      setWorkers(firestoreWorkers);
      localStorage.setItem('servigo_workers_v1', JSON.stringify(firestoreWorkers));
      setIsCloudSynced(true);
    });

    const unsubscribeBookings = subscribeBookings((firestoreBookings) => {
      setBookings(firestoreBookings);
      localStorage.setItem('servigo_bookings_v1', JSON.stringify(firestoreBookings));
      setIsCloudSynced(true);
    });

    const unsubscribeBanners = subscribeBanners((firestoreBanners) => {
      setBanners(firestoreBanners);
    });

    const unsubscribeConfig = subscribeAppConfig((firestoreConfig) => {
      if (firestoreConfig) {
        setAppConfig(firestoreConfig);
        if (firestoreConfig.tabs) {
          setTabConfig(firestoreConfig.tabs);
        }
      }
    });

    return () => {
      unsubscribeWorkers();
      unsubscribeBookings();
      unsubscribeBanners();
      unsubscribeConfig();
    };
  }, []);

  // Save to LocalStorage fallback cache
  useEffect(() => {
    localStorage.setItem('servigo_workers_v1', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('servigo_bookings_v1', JSON.stringify(bookings));
  }, [bookings]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<
    'search' | 'register' | 'ai' | 'bruzzone' | 'bookings'
  >('search');

  // Fallback active tab if current tab gets disabled by admin
  useEffect(() => {
    if (activeTab === 'search' && !tabConfig.search) {
      if (tabConfig.register) setActiveTab('register');
      else if (tabConfig.sponsor) setActiveTab('bruzzone');
      else if (tabConfig.ai) setActiveTab('ai');
      else if (tabConfig.bookings) setActiveTab('bookings');
    }
  }, [tabConfig, activeTab]);

  // Modals state
  const [selectedWorkerForModal, setSelectedWorkerForModal] = useState<Worker | null>(null);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<Worker | null>(null);
  const [selectedWorkerForReview, setSelectedWorkerForReview] = useState<Worker | null>(null);

  // Success toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };


  // Search Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<TradeCategory | 'all'>('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [onlyMatriculados, setOnlyMatriculados] = useState(false);
  const [only24h, setOnly24h] = useState(false);
  const [onlyBruzzonePartner, setOnlyBruzzonePartner] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'jobs' | 'price'>('rating');

  // Compute list of unique coverage zones across all workers
  const availableZones = useMemo(() => {
    const zonesSet = new Set<string>();
    workers.forEach((w) => {
      zonesSet.add(w.location);
      w.zones.forEach((z) => zonesSet.add(z));
    });
    return Array.from(zonesSet).sort();
  }, [workers]);

  // Filter and Sort Workers
  const filteredWorkers = useMemo(() => {
    return workers
      .filter((w) => {
        // Trade filter
        if (selectedTrade !== 'all' && w.trade !== selectedTrade) {
          return false;
        }

        // Zone filter
        if (selectedZone !== 'all') {
          const matchesLoc = w.location.toLowerCase().includes(selectedZone.toLowerCase());
          const matchesZones = w.zones.some((z) =>
            z.toLowerCase().includes(selectedZone.toLowerCase())
          );
          if (!matchesLoc && !matchesZones) return false;
        }

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = w.name.toLowerCase().includes(q);
          const matchesTitle = w.tradeTitle.toLowerCase().includes(q);
          const matchesBio = w.bio.toLowerCase().includes(q);
          const matchesServices = w.services.some((s) => s.toLowerCase().includes(q));
          const matchesLoc = w.location.toLowerCase().includes(q);

          if (!matchesName && !matchesTitle && !matchesBio && !matchesServices && !matchesLoc) {
            return false;
          }
        }

        // Matriculados only
        if (onlyMatriculados && !w.matricula) {
          return false;
        }

        // 24h Emergency only
        if (only24h && !w.availability.urgencies24h) {
          return false;
        }

        // Bruzzone Partner only
        if (onlyBruzzonePartner && !w.ferreteroPartner) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'jobs') return b.completedJobs - a.completedJobs;
        if (sortBy === 'price') return a.hourlyRate - b.hourlyRate;
        return 0;
      });
  }, [
    workers,
    selectedTrade,
    selectedZone,
    searchQuery,
    onlyMatriculados,
    only24h,
    onlyBruzzonePartner,
    sortBy,
  ]);

  // Handlers
  const handleRegisterNewWorker = async (newWorker: Worker) => {
    // Optimistic UI update
    setWorkers((prev) => [newWorker, ...prev]);
    setActiveTab('search');
    showToast(`¡Perfil publicado con éxito en la nube! Bienvenido ${newWorker.name} a ServiGo.`);

    try {
      await saveWorkerToFirestore(newWorker);
    } catch (err) {
      console.error('Failed to sync worker to Firestore:', err);
    }
  };

  const handleSubmitReview = async (workerId: string, newReview: Review) => {
    const targetWorker = workers.find((w) => w.id === workerId);

    // Optimistic UI update
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const updatedReviews = [newReview, ...w.reviews];
          const totalRatingSum = updatedReviews.reduce((acc, curr) => acc + curr.rating, 0);
          const newAvg = totalRatingSum / updatedReviews.length;

          return {
            ...w,
            reviews: updatedReviews,
            reviewCount: updatedReviews.length,
            rating: Number(newAvg.toFixed(1)),
          };
        }
        return w;
      })
    );

    // Keep detail modal updated if open
    if (selectedWorkerForModal && selectedWorkerForModal.id === workerId) {
      setSelectedWorkerForModal((prev) =>
        prev
          ? {
              ...prev,
              reviews: [newReview, ...prev.reviews],
              reviewCount: prev.reviewCount + 1,
            }
          : null
      );
    }

    showToast('¡Muchas gracias! Tu opinión ha sido guardada en la nube correctamente.');

    if (targetWorker) {
      try {
        await saveReviewToFirestore(workerId, newReview, targetWorker);
      } catch (err) {
        console.error('Failed to sync review to Firestore:', err);
      }
    }
  };

  const handleSubmitBooking = async (newBooking: BookingRequest) => {
    // Optimistic UI update
    setBookings((prev) => [newBooking, ...prev]);
    showToast('Solicitud guardada en la nube. Se ha abierto WhatsApp para coordinar los detalles.');

    try {
      await saveBookingToFirestore(newBooking);
    } catch (err) {
      console.error('Failed to sync booking to Firestore:', err);
    }
  };

  const handleAiSelectTrade = (trade: TradeCategory) => {
    setSelectedTrade(trade);
    setActiveTab('search');
  };

  const handleAddNewTrade = async (newTrade: CustomTradeOption) => {
    const currentCustomTrades = appConfig?.customTrades || [];
    if (currentCustomTrades.some((t) => t.id === newTrade.id)) return;

    const updatedCustomTrades = [...currentCustomTrades, newTrade];
    const updatedConfig: AppConfig = {
      id: 'settings',
      tabs: tabConfig,
      customLogoUrl: appConfig?.customLogoUrl,
      tagline: appConfig?.tagline,
      customTrades: updatedCustomTrades,
      updatedAt: new Date().toISOString(),
    };

    setAppConfig(updatedConfig);
    try {
      await saveAppConfigToFirestore(updatedConfig);
      showToast(`¡Nuevo rubro "${newTrade.label}" creado e integrado!`);
    } catch (err) {
      console.error('Failed to save custom trade to Firestore:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white font-bold text-xs sm:text-sm py-3.5 px-5 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Bar & Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingCount={bookings.length}
        tabConfig={tabConfig}
        customLogoUrl={appConfig?.customLogoUrl}
        customTagline={appConfig?.tagline}
        onOpenAdminPanel={() => setIsAdminModalOpen(true)}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      {/* App Body Content */}
      <main className="flex-1 pb-16">
        {/* TAB 1: WORKERS SEARCH & DISCOVERY CATALOG */}
        {activeTab === 'search' && (
          <div>
            {/* Promoted Creator Banners Carousel */}
            <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
              <PromotedBannerCarousel
                banners={banners}
                isAdmin={isAdminAuthenticated}
                onOpenAdminPanel={() => setIsAdminModalOpen(true)}
              />
            </div>

            {/* Search Filters Bar */}
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedTrade={selectedTrade}
              setSelectedTrade={setSelectedTrade}
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
              onlyMatriculados={onlyMatriculados}
              setOnlyMatriculados={setOnlyMatriculados}
              only24h={only24h}
              setOnly24h={setOnly24h}
              onlyBruzzonePartner={onlyBruzzonePartner}
              setOnlyBruzzonePartner={setOnlyBruzzonePartner}
              sortBy={sortBy}
              setSortBy={setSortBy}
              availableZones={availableZones}
              customTrades={appConfig?.customTrades}
            />

            {/* Catalog Grid */}
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
              {/* Results count header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-bold">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>
                    Mostrando <strong className="text-slate-900 font-black">{filteredWorkers.length}</strong>{' '}
                    profesionales de {workers.length} registrados
                  </span>
                  {isCloudSynced && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold">
                      <CloudCheck className="w-3 h-3 text-emerald-600" />
                      Nube Firestore Activa
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('ai')}
                  className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>¿No sabes a quién llamar? Diagnóstico IA</span>
                </button>
              </div>

              {/* Grid of cards */}
              {filteredWorkers.length === 0 ? (
                <div className="bg-white border-2 border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-sm">
                  <Wrench className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">
                    No encontramos profesionales para este filtro
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Intenta cambiar la localidad o el rubro seleccionado para ver más trabajadores en tu área.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedTrade('all');
                      setSelectedZone('all');
                      setSearchQuery('');
                      setOnlyMatriculados(false);
                      setOnly24h(false);
                      setOnlyBruzzonePartner(false);
                    }}
                    className="mt-2 py-2.5 px-5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWorkers.map((worker) => (
                    <WorkerCard
                      key={worker.id}
                      worker={worker}
                      onSelectWorker={setSelectedWorkerForModal}
                      onOpenBooking={setSelectedWorkerForBooking}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER WORKER PORTAL */}
        {activeTab === 'register' && (
          <div className="px-4 py-6">
            <WorkerRegisterForm
              onRegisterSuccess={handleRegisterNewWorker}
              customTrades={appConfig?.customTrades}
              onAddNewTrade={handleAddNewTrade}
            />
          </div>
        )}

        {/* TAB 3: GEMINI AI DIAGNOSTIC TOOL */}
        {activeTab === 'ai' && (
          <div className="px-4 py-6">
            <AiAssistant onSelectTrade={handleAiSelectTrade} />
          </div>
        )}

        {/* TAB 4: FERRETERIA BRUZZONE SPONSOR HUB */}
        {activeTab === 'bruzzone' && (
          <div className="px-4 py-6">
            <FerreteriaSponsorBanner
              products={BRUZZONE_PRODUCTS}
              onSelectTradeFilter={handleAiSelectTrade}
            />
          </div>
        )}

        {/* TAB 5: BOOKING HISTORY ("MIS SOLICITUDES") */}
        {activeTab === 'bookings' && (
          <div className="px-4 py-6">
            <BookingHistoryList
              bookings={bookings}
              workers={workers}
              onOpenReviewModal={setSelectedWorkerForReview}
              onNavigateToSearch={() => setActiveTab('search')}
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      {selectedWorkerForModal && (
        <WorkerDetailModal
          worker={selectedWorkerForModal}
          onClose={() => setSelectedWorkerForModal(null)}
          onOpenBooking={(w) => {
            setSelectedWorkerForModal(null);
            setSelectedWorkerForBooking(w);
          }}
          onOpenReviewModal={(w) => {
            setSelectedWorkerForModal(null);
            setSelectedWorkerForReview(w);
          }}
          bruzzoneProducts={BRUZZONE_PRODUCTS}
        />
      )}

      {selectedWorkerForBooking && (
        <BookingModal
          worker={selectedWorkerForBooking}
          onClose={() => setSelectedWorkerForBooking(null)}
          onSubmitBooking={handleSubmitBooking}
        />
      )}

      {selectedWorkerForReview && (
        <ReviewFormModal
          worker={selectedWorkerForReview}
          onClose={() => setSelectedWorkerForReview(null)}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* Admin Panel Modal (Creator Controls) */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdminAuthenticated={isAdminAuthenticated}
        setIsAdminAuthenticated={setIsAdminAuthenticated}
        tabConfig={tabConfig}
        appConfig={appConfig}
        onSaveAppConfig={async (updatedConfig) => {
          await saveAppConfigToFirestore(updatedConfig);
          setAppConfig(updatedConfig);
          if (updatedConfig.tabs) {
            setTabConfig(updatedConfig.tabs);
          }
        }}
        onSaveTabConfig={async (newTabs) => {
          const newConfig: AppConfig = {
            id: 'settings',
            tabs: newTabs,
            customLogoUrl: appConfig?.customLogoUrl,
            tagline: appConfig?.tagline,
            updatedAt: new Date().toISOString(),
          };
          await saveAppConfigToFirestore(newConfig);
          setTabConfig(newTabs);
        }}
        banners={banners}
        onSaveBanner={async (banner) => {
          await saveBannerToFirestore(banner);
        }}
        onDeleteBanner={async (bannerId) => {
          await deleteBannerFromFirestore(bannerId);
        }}
        workers={workers}
        onDeleteWorker={async (workerId) => {
          await deleteWorkerFromFirestore(workerId);
        }}
        onClearAllData={async () => {
          await clearAllFirestoreData();
          localStorage.removeItem('servigo_workers_v1');
          localStorage.removeItem('servigo_bookings_v1');
          setWorkers([]);
          setBookings([]);
          setBanners([]);
          setTabConfig(DEFAULT_TAB_CONFIG);
          showToast('💥 ¡Todos los datos han sido borrados por completo! Sistema iniciado en blanco.');
        }}
        onResetToDefaults={async () => {
          await resetFirestoreToDefaults();
          localStorage.removeItem('servigo_workers_v1');
          localStorage.removeItem('servigo_bookings_v1');
          showToast('🔄 Base de datos restablecida a los valores iniciales de demostración.');
        }}
        showToast={showToast}
      />

      {/* Global Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-black text-lg">
              <span>Servi<span className="text-orange-500">Go</span></span>
              <span className="text-xs font-normal text-slate-500">• Red de Servicios Domésticos</span>
            </div>
            <p className="text-slate-400 text-xs">
              Plataforma móvil de búsqueda rápida y contratación segura de gasistas, electricistas, plomeros y especialistas del hogar.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider block">
                AUSPICIADOR PRINCIPAL
              </span>
              <span className="font-bold text-white text-xs block">
                Ferretería Bruzzone
              </span>
              <span className="text-[11px] text-slate-300">
                Líder en herramientas e insumos aprobados
              </span>
            </div>
            <a
              href="https://ferreteriabruzzone.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-3 rounded-xl bg-orange-600 text-white font-bold text-xs whitespace-nowrap hover:bg-orange-500 transition-colors shadow-xs"
            >
              Visitar Web
            </a>
          </div>

          <div className="text-left md:text-right space-y-2 text-slate-400">
            <p>© {new Date().getFullYear()} ServiGo App • Todos los derechos reservados.</p>
            <div className="flex items-center justify-start md:justify-end gap-2">
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-xs"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Administrador del Creador</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
