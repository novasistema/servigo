import React, { useState, useEffect, useMemo } from 'react';
import { safeSetItem } from './utils/safeStorage';
import { useAuth } from './context/AuthContext';
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
import { RegistrationPdfGuideModal } from './components/RegistrationPdfGuideModal';
import { ShopsSection } from './components/ShopsSection';
import { JobBoardSection } from './components/jobs/JobBoardSection';
import { RemisesSection } from './components/RemisesSection';
import { DeliveryModule } from './components/delivery/DeliveryModule';
import { WelcomeHubModal } from './components/WelcomeHubModal';
import { WelcomeHubScreen } from './components/WelcomeHubScreen';
import { BottomTabBar, BottomTab } from './components/BottomTabBar';
import { WorkerCouponModal } from './components/WorkerCouponModal';
import { ShopDashboardModal } from './components/delivery/ShopDashboardModal';
import { CadetesSection } from './components/cadetes/CadetesSection';
import { RentalsModule } from './components/rentals/RentalsModule';
import { ErrorBoundary } from './components/ErrorBoundary';
import { INITIAL_WORKERS, BRUZZONE_PRODUCTS, INITIAL_SHOPS, INITIAL_REMISES } from './data/mockData';
import { INITIAL_JOB_PROFILES } from './data/mockJobProfiles';
import { INITIAL_RENTAL_ITEMS } from './data/mockRentals';
import { Worker, BookingRequest, Review, TradeCategory, PromotedBanner, TabVisibilityConfig, AppConfig, CustomTradeOption, Shop, RemisDriver, RideRequest, SystemCoupon, IssuedVoucher, JobProfile, RentalItem, RentalBooking, RentalOwner, RentalPayoutRequest, DamageReport , isPubliclyApproved } from './types';
import {
  subscribeWorkers,
  subscribeBookings,
  subscribeShops,
  subscribeJobProfiles,
  subscribeRemises,
  subscribeRideRequests,
  subscribeCoupons,
  subscribeIssuedVouchers,
  subscribeRentalItems,
  subscribeRentalBookings,
  subscribeRentalOwners,
  saveRentalOwnerToFirestore,
  subscribeRentalPayouts,
  saveRentalPayoutToFirestore,
  updateRentalPayoutStatus,
  updateRentalBookingStatus,
  saveRentalItemToFirestore,
  deleteRentalItemFromFirestore,
  saveRentalBookingToFirestore,
  saveJobProfileToFirestore,
  deleteJobProfileFromFirestore,
  saveRemisToFirestore,
  updateRemisStatus,
  deleteRemisFromFirestore,
  saveRideRequestToFirestore,
  saveShopToFirestore,
  deleteShopFromFirestore,
  saveWorkerToFirestore,
  deleteWorkerFromFirestore,
  saveReviewToFirestore,
  saveBookingToFirestore,
  subscribeBanners,
  subscribeAppConfig,
  saveBannerToFirestore,
  deleteBannerFromFirestore,
  saveAppConfigToFirestore,
  saveCouponToFirestore,
  deleteCouponFromFirestore,
  saveIssuedVoucherToFirestore,
  clearAllFirestoreData,
  resetFirestoreToDefaults,
  DEFAULT_TAB_CONFIG,
  INITIAL_BANNERS,
  INITIAL_COUPONS,
} from './lib/firebase';
import { extractUniqueZones, normalizeZoneKey, formatZoneName } from './lib/zoneUtils';
import { Wrench, ShieldCheck, Sparkles, Building2, ExternalLink, Heart, Phone, MapPin, CheckCircle2, Settings, CloudCheck, FileText } from 'lucide-react';


// Títulos de las sub-secciones de Servicios (se muestran en el encabezado común)
const SERVICIOS_SUBTABS: Record<string, { title: string; text: string }> = {
  register: { title: 'Sumate como trabajador', text: 'Creá tu perfil gratis y que los vecinos te encuentren y te escriban por WhatsApp.' },
  jobs: { title: 'Bolsa de trabajo', text: 'Cargá tu CV o encontrá personal de la zona para tu obra o negocio.' },
  shops: { title: 'Comercios', text: 'Comercios y talleres de Alejandro Roca y la zona.' },
  remises: { title: 'Remises', text: 'Pedí un viaje o sumate como conductor.' },
  ai: { title: 'Contanos el problema', text: 'Describí lo que te pasa y te decimos qué profesional necesitás.' },
  bruzzone: { title: 'Ferretería Bruzzone', text: 'El auspiciante de ServiGo: materiales, herramientas y descuentos para la comunidad.' },
  bookings: { title: 'Mis solicitudes', text: 'Los turnos y presupuestos que pediste a los profesionales.' },
};
const CADETES_META = { title: 'Cadetes', text: 'Mandados, retiros y traslados con cadetes de la zona.' };

export default function App() {
  const { currentUser, requireAuth, openAuthModal, getIdToken } = useAuth();

  // Persistence State synced with Cloud Firestore
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('servigo_workers_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
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
  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem('servigo_shops_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [remises, setRemises] = useState<RemisDriver[]>(() => {
    const saved = localStorage.getItem('servigo_remises_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);

  // System Coupons (created by administrator)
  const [coupons, setCoupons] = useState<SystemCoupon[]>(() => {
    const saved = localStorage.getItem('servigo_coupons_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COUPONS;
  });

  // Vouchers issued by workers to clients
  const [issuedVouchers, setIssuedVouchers] = useState<IssuedVoucher[]>(() => {
    const saved = localStorage.getItem('servigo_vouchers_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Job Profiles (Bolsa de Trabajo & RRHH)
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>(() => {
    const saved = localStorage.getItem('servigo_job_profiles_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Rental Items (ServiGo Alquiler de Productos)
  const [rentalItems, setRentalItems] = useState<RentalItem[]>(() => {
    const saved = localStorage.getItem('servigo_rentals_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>(() => {
    const saved = localStorage.getItem('servigo_rental_bookings_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [rentalOwners, setRentalOwners] = useState<RentalOwner[]>(() => {
    const saved = localStorage.getItem('servigo_rental_owners_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [rentalPayouts, setRentalPayouts] = useState<RentalPayoutRequest[]>(() => {
    const saved = localStorage.getItem('servigo_rental_payouts_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [selectedWorkerForCoupon, setSelectedWorkerForCoupon] = useState<Worker | null>(null);

  const [tabConfig, setTabConfig] = useState<TabVisibilityConfig>(DEFAULT_TAB_CONFIG);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isPdfGuideOpen, setIsPdfGuideOpen] = useState<boolean>(false);
  const [isShopDashboardModalOpen, setIsShopDashboardModalOpen] = useState<boolean>(false);

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Subscribe to Cloud Firestore in Realtime
  useEffect(() => {
    // Los datos de demostración que pudieron quedar sembrados nunca se muestran
    const demoIds = new Set<string>([
      ...INITIAL_WORKERS.map((w) => w.id),
      ...INITIAL_SHOPS.map((x) => x.id),
      ...INITIAL_REMISES.map((r) => r.id),
      ...INITIAL_JOB_PROFILES.map((j) => j.id),
    ]);
    const real = <T extends { id: string }>(list: T[] | null | undefined): T[] => (list || []).filter((x) => !demoIds.has(x.id));

    const unsubscribeWorkers = subscribeWorkers((firestoreWorkers) => {
      setWorkers(real(firestoreWorkers));
      safeSetItem('servigo_workers_v2', JSON.stringify(real(firestoreWorkers)));
      setIsCloudSynced(true);
    });

    const unsubscribeBookings = subscribeBookings((firestoreBookings) => {
      setBookings(firestoreBookings);
      safeSetItem('servigo_bookings_v1', JSON.stringify(firestoreBookings));
      setIsCloudSynced(true);
    });

    const unsubscribeShops = subscribeShops((firestoreShops) => {
      setShops(real(firestoreShops));
      safeSetItem('servigo_shops_v2', JSON.stringify(real(firestoreShops)));
      setIsCloudSynced(true);
    });

    const unsubscribeJobProfiles = subscribeJobProfiles((firestoreJobProfiles) => {
      setJobProfiles(real(firestoreJobProfiles));
      safeSetItem('servigo_job_profiles_v2', JSON.stringify(real(firestoreJobProfiles)));
      setIsCloudSynced(true);
    });

    const unsubscribeRemises = subscribeRemises((firestoreRemises) => {
      setRemises(real(firestoreRemises));
      safeSetItem('servigo_remises_v2', JSON.stringify(real(firestoreRemises)));
      setIsCloudSynced(true);
    });

    const unsubscribeRideRequests = subscribeRideRequests((firestoreRequests) => {
      setRideRequests(firestoreRequests);
    });

    const unsubscribeCoupons = subscribeCoupons((firestoreCoupons) => {
      setCoupons(firestoreCoupons || []);
      safeSetItem('servigo_coupons_v1', JSON.stringify(firestoreCoupons || []));
    });

    const unsubscribeVouchers = subscribeIssuedVouchers((firestoreVouchers) => {
      setIssuedVouchers(firestoreVouchers);
      safeSetItem('servigo_vouchers_v1', JSON.stringify(firestoreVouchers));
    });

    const unsubscribeRentals = subscribeRentalItems((firestoreRentals) => {
      // Siempre se reemplaza (aunque venga vacía), así lo borrado desaparece
      setRentalItems(firestoreRentals || []);
      safeSetItem('servigo_rentals_v3', JSON.stringify(firestoreRentals || []));
    });

    const unsubscribeRentalBookings = subscribeRentalBookings((firestoreBookings) => {
      setRentalBookings(firestoreBookings);
      safeSetItem('servigo_rental_bookings_v1', JSON.stringify(firestoreBookings));
    });

    const unsubscribeRentalOwners = subscribeRentalOwners((firestoreOwners) => {
      setRentalOwners(firestoreOwners || []);
      safeSetItem('servigo_rental_owners_v1', JSON.stringify(firestoreOwners || []));
    });

    const unsubscribeRentalPayouts = subscribeRentalPayouts((firestorePayouts) => {
      setRentalPayouts(firestorePayouts);
      safeSetItem('servigo_rental_payouts_v1', JSON.stringify(firestorePayouts));
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
      unsubscribeShops();
      unsubscribeJobProfiles();
      unsubscribeRemises();
      unsubscribeRideRequests();
      unsubscribeCoupons();
      unsubscribeVouchers();
      unsubscribeRentals();
      unsubscribeRentalBookings();
      unsubscribeRentalOwners();
      unsubscribeRentalPayouts();
      unsubscribeBanners();
      unsubscribeConfig();
    };
  }, []);

  // Handle Mercado Pago return parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'rentals' || tabParam === 'alquiler') {
      setActiveTab('alquiler');
    }
    if (params.get('mp_connected') === 'true') {
      showToast('🎉 ¡Cuenta de Mercado Pago vinculada exitosamente!');
      window.history.replaceState({}, document.title, window.location.pathname + '?tab=alquiler');
    }
    if (params.get('booking_status') === 'confirmado') {
      showToast('✅ ¡Pago aprobado en Mercado Pago! Tu reserva ha sido confirmada.');
      window.history.replaceState({}, document.title, window.location.pathname + '?tab=alquiler');
    }
  }, []);


  // Save to LocalStorage fallback cache
  useEffect(() => {
    safeSetItem('servigo_workers_v2', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    safeSetItem('servigo_bookings_v1', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    safeSetItem('servigo_shops_v2', JSON.stringify(shops));
  }, [shops]);

  useEffect(() => {
    safeSetItem('servigo_job_profiles_v2', JSON.stringify(jobProfiles));
  }, [jobProfiles]);

  useEffect(() => {
    safeSetItem('servigo_remises_v2', JSON.stringify(remises));
  }, [remises]);

  useEffect(() => {
    safeSetItem('servigo_rentals_v3', JSON.stringify(rentalItems));
  }, [rentalItems]);

  useEffect(() => {
    safeSetItem('servigo_rental_bookings_v1', JSON.stringify(rentalBookings));
  }, [rentalBookings]);

  // Navigation state (ServiGo Servicios includes jobs, shops, search, cadetes, remises, register, ai, bruzzone, bookings, alquiler)
  const [activeTab, setActiveTab] = useState<
    'search' | 'shops' | 'jobs' | 'delivery' | 'cadetes' | 'remises' | 'register' | 'ai' | 'bruzzone' | 'bookings' | 'alquiler'
  >('search');

  // Welcome Portal / Hub selection state (ServiGo Servicios vs ServiGo Delivery)
  const [isWelcomeHubOpen, setIsWelcomeHubOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('servigo_hub_entered');
    }
    return true;
  });

  // Fallback active tab if current tab gets disabled by admin
  useEffect(() => {
    if (activeTab === 'search' && !tabConfig.search) {
      if (tabConfig.jobs) setActiveTab('jobs');
      else if (tabConfig.shops) setActiveTab('shops');
      else if (tabConfig.register) setActiveTab('register');
      else if (tabConfig.sponsor) setActiveTab('bruzzone');
      else if (tabConfig.ai) setActiveTab('ai');
      else if (tabConfig.bookings) setActiveTab('bookings');
    } else {
      const off: Record<string, boolean> = {
        jobs: tabConfig.jobs === false,
        shops: tabConfig.shops === false,
        delivery: tabConfig.delivery === false,
        cadetes: tabConfig.cadetes === false,
        remises: tabConfig.remises === false,
        register: tabConfig.register === false,
        bruzzone: tabConfig.sponsor === false,
        ai: tabConfig.ai === false,
        bookings: tabConfig.bookings === false,
        alquiler: tabConfig.alquiler === false,
      };
      if (off[activeTab]) setActiveTab('search');
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

  // Compute list of unique coverage zones across all workers, deduplicated case-insensitively
  const availableZones = useMemo(() => {
    const rawZonesList: string[] = [];
    workers.forEach((w) => {
      if (w.location) rawZonesList.push(w.location);
      if (w.zones && Array.isArray(w.zones)) {
        w.zones.forEach((z) => rawZonesList.push(z));
      }
    });
    return extractUniqueZones(rawZonesList);
  }, [workers]);

  // Filter and Sort Workers
  const filteredWorkers = useMemo(() => {
    return workers
      .filter(isPubliclyApproved)
      .filter((w) => {
        // Trade filter
        if (selectedTrade !== 'all' && w.trade !== selectedTrade) {
          return false;
        }

        // Zone filter (case and accent insensitive matching)
        if (selectedZone !== 'all') {
          const selectedNorm = normalizeZoneKey(selectedZone);
          const locNorm = normalizeZoneKey(w.location);
          const matchesLoc = locNorm.includes(selectedNorm) || selectedNorm.includes(locNorm);
          const matchesZones = (w.zones || []).some((z) => {
            const zNorm = normalizeZoneKey(z);
            return zNorm.includes(selectedNorm) || selectedNorm.includes(zNorm);
          });
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

  // Altas nuevas: quedan a nombre de la cuenta y pendientes hasta que el creador las apruebe
  const PENDING_MSG = 'Lo revisamos y en breve aparece publicado.';
  const stampNewListing = <T extends object>(x: T): T =>
    ({
      ...x,
      ownerUid: (x as any).ownerUid || currentUser?.uid,
      createdBy: (x as any).createdBy || currentUser?.uid,
      approvalStatus: isAdminAuthenticated ? 'approved' : 'pending',
    } as T);
  const ensureSignedIn = (msg: string) => {
    if (currentUser) return true;
    openAuthModal(msg);
    return false;
  };

  // Handlers
  const handleSaveShop = async (shop: Shop) => {
    const isNew = !shops.some((s) => s.id === shop.id);
    if (isNew) {
      if (!ensureSignedIn('Ingresá con tu cuenta para sumar tu comercio.')) return;
      shop = stampNewListing(shop);
    }
    // Optimistic UI update
    setShops((prev) => {
      const exists = prev.some((s) => s.id === shop.id);
      if (exists) {
        return prev.map((s) => (s.id === shop.id ? shop : s));
      }
      return [shop, ...prev];
    });
    try {
      await saveShopToFirestore(shop);
      showToast(isNew && !isAdminAuthenticated ? `Recibimos "${shop.name}". ${PENDING_MSG}` : `Comercio "${shop.name}" guardado.`);
    } catch (err) {
      console.error('Failed to save shop to Firestore:', err);
      showToast('No se pudo guardar el comercio. Probá de nuevo.');
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    setShops((prev) => prev.filter((s) => s.id !== shopId));
    try {
      await deleteShopFromFirestore(shopId);
    } catch (err) {
      console.error('Failed to delete shop from Firestore:', err);
    }
  };

  const handleSaveJobProfile = async (profile: JobProfile) => {
    const isNew = !jobProfiles.some((p) => p.id === profile.id);
    if (isNew) {
      if (!ensureSignedIn('Ingresá con tu cuenta para publicar tu CV.')) return;
      profile = stampNewListing(profile);
    }
    setJobProfiles((prev) => {
      const exists = prev.some((p) => p.id === profile.id);
      const updated = exists ? prev.map((p) => (p.id === profile.id ? profile : p)) : [profile, ...prev];
      safeSetItem('servigo_job_profiles_v2', JSON.stringify(updated));
      return updated;
    });
    try {
      await saveJobProfileToFirestore(profile);
      showToast(isNew && !isAdminAuthenticated ? `Recibimos tu CV. ${PENDING_MSG}` : 'CV guardado.');
    } catch (err) {
      console.error('Failed to save job profile to Firestore:', err);
      showToast('No se pudo guardar el CV. Probá de nuevo.');
    }
  };

  const handleDeleteJobProfile = async (profileId: string) => {
    setJobProfiles((prev) => {
      const updated = prev.filter((p) => p.id !== profileId);
      safeSetItem('servigo_job_profiles_v2', JSON.stringify(updated));
      return updated;
    });
    showToast('Perfil de currículum eliminado.');
    try {
      await deleteJobProfileFromFirestore(profileId);
    } catch (err) {
      console.error('Failed to delete job profile from Firestore:', err);
    }
  };

  const handleAddRemis = async (newRemis: RemisDriver) => {
    if (!ensureSignedIn('Ingresá con tu cuenta para sumarte como conductor.')) return;
    newRemis = stampNewListing(newRemis);
    setRemises((prev) => [newRemis, ...prev]);
    try {
      await saveRemisToFirestore(newRemis);
      showToast(isAdminAuthenticated ? `Conductor ${newRemis.name} guardado.` : `Recibimos tus datos, ${newRemis.name}. ${PENDING_MSG}`);
    } catch (err) {
      console.error('Failed to save remis to Firestore:', err);
      showToast('No se pudo guardar. Probá de nuevo.');
    }
  };

  const handleSaveRemis = async (remis: RemisDriver) => {
    setRemises((prev) => {
      const exists = prev.some((r) => r.id === remis.id);
      if (exists) {
        return prev.map((r) => (r.id === remis.id ? remis : r));
      }
      return [remis, ...prev];
    });
    try {
      await saveRemisToFirestore(remis);
    } catch (err) {
      console.error('Failed to save remis to Firestore:', err);
    }
  };

  const handleDeleteRemis = async (remisId: string) => {
    setRemises((prev) => prev.filter((r) => r.id !== remisId));
    try {
      await deleteRemisFromFirestore(remisId);
    } catch (err) {
      console.error('Failed to delete remis from Firestore:', err);
    }
  };

  const handleUpdateRemisStatus = async (
    remisId: string,
    status: 'disponible' | 'en_viaje' | 'fuera_de_servicio'
  ) => {
    setRemises((prev) =>
      prev.map((r) => (r.id === remisId ? { ...r, status } : r))
    );
    try {
      await updateRemisStatus(remisId, status);
    } catch (err) {
      console.error('Failed to update remis status:', err);
    }
  };

  const handleRequestRide = async (request: RideRequest) => {
    setRideRequests((prev) => [request, ...prev]);
    try {
      await saveRideRequestToFirestore(request);
    } catch (err) {
      console.error('Failed to save ride request to Firestore:', err);
    }
  };

  const handleRegisterNewWorker = async (newWorker: Worker) => {
    if (!ensureSignedIn('Ingresá con tu cuenta para publicar tu perfil de trabajador.')) return;
    newWorker = stampNewListing(newWorker);
    setWorkers((prev) => [newWorker, ...prev]);
    try {
      await saveWorkerToFirestore(newWorker);
      setActiveTab('search');
      showToast(isAdminAuthenticated ? `Perfil de ${newWorker.name} publicado.` : `¡Gracias ${newWorker.name}! Recibimos tu perfil. ${PENDING_MSG}`);
    } catch (err) {
      console.error('Failed to sync worker to Firestore:', err);
      showToast('No se pudo guardar tu perfil. Probá de nuevo.');
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

  const handleSaveCoupon = async (coupon: SystemCoupon) => {
    try {
      await saveCouponToFirestore(coupon);
      setCoupons((prev) => {
        const exists = prev.some((c) => c.id === coupon.id);
        const updated = exists ? prev.map((c) => (c.id === coupon.id ? coupon : c)) : [coupon, ...prev];
        safeSetItem('servigo_coupons_v1', JSON.stringify(updated));
        return updated;
      });
      showToast(`¡Cupón "${coupon.title}" guardado correctamente!`);
    } catch (err) {
      console.error('Error saving coupon to Firestore:', err);
      showToast('❌ Error al guardar cupón en la nube.');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      await deleteCouponFromFirestore(couponId);
      setCoupons((prev) => {
        const updated = prev.filter((c) => c.id !== couponId);
        safeSetItem('servigo_coupons_v1', JSON.stringify(updated));
        return updated;
      });
      showToast('Cupón de beneficio eliminado.');
    } catch (err) {
      console.error('Error deleting coupon from Firestore:', err);
      showToast('❌ Error al eliminar cupón.');
    }
  };

  const handleIssueVoucher = async (voucher: IssuedVoucher) => {
    try {
      await saveIssuedVoucherToFirestore(voucher);
      setIssuedVouchers((prev) => {
        const updated = [voucher, ...prev];
        safeSetItem('servigo_vouchers_v1', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error('Error saving issued voucher to Firestore:', err);
      throw err;
    }
  };

  const handleSaveRentalItem = async (item: RentalItem, owner?: RentalOwner) => {
    try {
      const isNewItem = !rentalItems.some((i) => i.id === item.id);
      const secureItem: RentalItem = {
        ...item,
        ...(isNewItem ? { approvalStatus: isAdminAuthenticated ? 'approved' : 'pending' } : {}),
        ownerId: currentUser?.uid || item.ownerId || 'locador-demo',
        ownerUid: currentUser?.uid || item.ownerUid || 'locador-demo',
        createdBy: currentUser?.uid || item.createdBy || 'locador-demo',
      };

      await saveRentalItemToFirestore(secureItem);
      setRentalItems((prev) => {
        const exists = prev.some((i) => i.id === secureItem.id);
        const updated = exists ? prev.map((i) => (i.id === secureItem.id ? secureItem : i)) : [secureItem, ...prev];
        safeSetItem('servigo_rentals_v3', JSON.stringify(updated));
        return updated;
      });

      if (owner) {
        const secureOwner: RentalOwner = {
          ...owner,
          id: currentUser?.uid || owner.id,
          ownerUid: currentUser?.uid || owner.ownerUid,
          createdBy: currentUser?.uid || owner.createdBy,
        };
        await saveRentalOwnerToFirestore(secureOwner);
        setRentalOwners((prev) => {
          const exists = prev.some((o) => o.id === secureOwner.id);
          const updated = exists ? prev.map((o) => (o.id === secureOwner.id ? secureOwner : o)) : [secureOwner, ...prev];
          safeSetItem('servigo_rental_owners_v1', JSON.stringify(updated));
          return updated;
        });
      }

      showToast(
        isNewItem && !isAdminAuthenticated
          ? `Recibimos "${item.title}". ${PENDING_MSG}`
          : `"${item.title}" guardado en ServiGo Alquiler.`
      );
    } catch (err: any) {
      console.error(err);
      showToast('Error al guardar artículo de alquiler.');
      throw err;
    }
  };

  const handleDeleteRentalItem = async (itemId: string) => {
    try {
      await deleteRentalItemFromFirestore(itemId);
      setRentalItems((prev) => {
        const updated = prev.filter((i) => i.id !== itemId);
        safeSetItem('servigo_rentals_v3', JSON.stringify(updated));
        return updated;
      });
      showToast('Artículo eliminado de ServiGo Alquiler.');
    } catch (err) {
      console.error(err);
      showToast('Error al eliminar artículo.');
    }
  };

  const handleBookRental = async (booking: RentalBooking) => {
    try {
      const secureBooking: RentalBooking = {
        ...booking,
        clientUid: currentUser?.uid || booking.clientUid || 'cliente-demo',
        ownerUid: booking.ownerUid || booking.ownerId || 'locador-demo',
        createdBy: currentUser?.uid || booking.createdBy || 'cliente-demo',
      };

      await saveRentalBookingToFirestore(secureBooking);
      setRentalBookings((prev) => {
        const updated = [secureBooking, ...prev];
        safeSetItem('servigo_rental_bookings_v1', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleRequestPayout = async (payout: RentalPayoutRequest) => {
    try {
      const token = await getIdToken();
      if (token) {
        const res = await fetch('/api/rentals/request-payout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payout),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error al solicitar retiro en servidor');
        }
        if (data.payoutId) {
          payout.id = data.payoutId;
        }
      } else {
        await saveRentalPayoutToFirestore(payout);
      }

      setRentalPayouts((prev) => {
        const updated = [payout, ...prev];
        safeSetItem('servigo_rental_payouts_v1', JSON.stringify(updated));
        return updated;
      });
      showToast('¡Solicitud de retiro enviada! La administración transferirá a tu CBU/Alias.');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error al solicitar retiro.');
      throw err;
    }
  };

  const handleConfirmItemReturned = async (bookingId: string) => {
    try {
      const token = await getIdToken();
      if (token) {
        const res = await fetch('/api/rentals/confirm-return', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error al liquidar devolución en servidor');
        }
      } else {
        await updateRentalBookingStatus(bookingId, {
          status: 'devuelto',
          paymentStatus: 'liquidado_a_dueno',
          depositStatus: 'devuelto_a_cliente',
        });
      }

      setRentalBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: 'devuelto',
                paymentStatus: 'liquidado_a_dueno',
                depositStatus: 'devuelto_a_cliente',
              }
            : b
        )
      );
      showToast('🎉 ¡Devolución confirmada! Caución reintegrada y saldo acreditado al dueño.');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error al actualizar estado del alquiler.');
      throw err;
    }
  };

  const handleReportDamage = async (
    bookingId: string,
    damageReport: DamageReport
  ) => {
    try {
      const token = await getIdToken();
      if (token) {
        const res = await fetch('/api/rentals/report-damage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId, damageReport }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error al procesar retención por daño');
        }
      } else {
        await updateRentalBookingStatus(bookingId, {
          status: 'devuelto',
          paymentStatus: 'liquidado_a_dueno',
          depositStatus: 'retenido_por_dano',
          damageReport,
        });
      }

      setRentalBookings((prev) => {
        const updated = prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: 'devuelto' as const,
                paymentStatus: 'liquidado_a_dueno' as const,
                depositStatus: 'retenido_por_dano' as const,
                damageReport,
              }
            : b
        );
        safeSetItem('servigo_rental_bookings_v1', JSON.stringify(updated));
        return updated;
      });
      showToast('⚠️ Daño registrado: la caución de garantía ha sido retenida a favor del locador según contrato.');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error al registrar informe de daño.');
      throw err;
    }
  };

  const handleUpdatePayoutStatus = async (
    payoutId: string,
    status: 'procesando' | 'transferido' | 'rechazado'
  ) => {
    try {
      const token = await getIdToken();
      if (token) {
        const res = await fetch('/api/rentals/process-payout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ payoutId, status }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error al procesar el retiro en servidor');
        }
      } else {
        await updateRentalPayoutStatus(payoutId, status);
      }

      setRentalPayouts((prev) =>
        prev.map((p) =>
          p.id === payoutId
            ? { ...p, status, processedAt: new Date().toISOString() }
            : p
        )
      );
      showToast(`Estado de la transferencia actualizado a "${status}".`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error al actualizar transferencia.');
    }
  };

  const enterHub = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('servigo_hub_entered');
      window.scrollTo(0, 0);
    }
    setIsWelcomeHubOpen(true);
  };

  const goToBottomTab = (tab: BottomTab) => {
    if (tab === 'inicio') {
      enterHub();
      return;
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('servigo_hub_entered', 'true');
      window.scrollTo(0, 0);
    }
    setActiveTab(tab === 'servicios' ? 'search' : tab);
    setIsWelcomeHubOpen(false);
  };

  const hiddenBottomTabs: BottomTab[] = [
    ...(tabConfig.delivery === false ? (['delivery'] as BottomTab[]) : []),
    ...(tabConfig.alquiler === false ? (['alquiler'] as BottomTab[]) : []),
  ];
  const hiddenHubModules = [
    ...(tabConfig.delivery === false ? (['delivery'] as const) : []),
    ...(tabConfig.alquiler === false ? (['alquiler'] as const) : []),
    ...(tabConfig.cadetes === false ? (['cadetes'] as const) : []),
  ];

  const activeBottomTab: BottomTab = isWelcomeHubOpen
    ? 'inicio'
    : activeTab === 'alquiler'
    ? 'alquiler'
    : activeTab === 'delivery' || activeTab === 'cadetes'
    ? 'delivery'
    : 'servicios';

  if (isWelcomeHubOpen) {
    return (
      <div className="min-h-screen bg-sg-navy text-white font-sans selection:bg-orange-600 selection:text-white">
        <WelcomeHubScreen
          onSearch={(q) => {
            setSearchQuery(q);
            goToBottomTab('servicios');
          }}
          onSelectModule={(module) => {
            if (module === 'delivery') {
              setActiveTab('delivery');
            } else if (module === 'alquiler') {
              setActiveTab('alquiler');
            } else if (module === 'cadetes') {
              setActiveTab('cadetes');
            } else {
              setActiveTab('search');
            }
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('servigo_hub_entered', 'true');
            }
            setIsWelcomeHubOpen(false);
          }}
          onOpenPdfGuide={() => setIsPdfGuideOpen(true)}
          onOpenAdminPanel={() => setIsAdminModalOpen(true)}
          isAdminAuthenticated={isAdminAuthenticated}
          hiddenModules={[...hiddenHubModules]}
        />

        <BottomTabBar active={activeBottomTab} onSelect={goToBottomTab} hidden={hiddenBottomTabs} />

        {/* Allow opening PDF Guide and Admin from Welcome Hub */}
        <RegistrationPdfGuideModal
          isOpen={isPdfGuideOpen}
          onClose={() => setIsPdfGuideOpen(false)}
        />

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
          onAddNewTrade={handleAddNewTrade}
          onSaveWorker={async (updatedWorker) => {
            const formattedWorker: Worker = {
              ...updatedWorker,
              location: formatZoneName(updatedWorker.location),
              zones: extractUniqueZones(updatedWorker.zones || []),
            };
            setWorkers((prev) => {
              const exists = prev.some((w) => w.id === formattedWorker.id);
              return exists
                ? prev.map((w) => (w.id === formattedWorker.id ? formattedWorker : w))
                : [formattedWorker, ...prev];
            });
            try {
              await saveWorkerToFirestore(formattedWorker);
              showToast(`¡Perfil de ${formattedWorker.name} guardado correctamente!`);
            } catch (err) {
              console.error('Failed to update worker in Firestore:', err);
              showToast('❌ Error al actualizar trabajador.');
            }
          }}
          onDeleteWorker={async (workerId) => {
            await deleteWorkerFromFirestore(workerId);
          }}
          shops={shops}
          onSaveShop={handleSaveShop}
          onDeleteShop={handleDeleteShop}
          remises={remises}
          onSaveRemis={handleSaveRemis}
          onDeleteRemis={handleDeleteRemis}
          coupons={coupons}
          onSaveCoupon={handleSaveCoupon}
          onDeleteCoupon={handleDeleteCoupon}
          issuedVouchers={issuedVouchers}
          onSaveIssuedVoucher={async (updatedVoucher) => {
            try {
              await saveIssuedVoucherToFirestore(updatedVoucher);
              setIssuedVouchers((prev) =>
                prev.map((v) => (v.id === updatedVoucher.id ? updatedVoucher : v))
              );
            } catch (err) {
              console.error('Error updating voucher status:', err);
              showToast('Error al actualizar estado del voucher');
            }
          }}
          onClearAllData={async () => {
            await clearAllFirestoreData();
            localStorage.removeItem('servigo_workers_v2');
            localStorage.removeItem('servigo_bookings_v1');
            localStorage.removeItem('servigo_shops_v2');
            localStorage.removeItem('servigo_remises_v2');
            setWorkers([]);
            setBookings([]);
            setShops([]);
            setRemises([]);
            setBanners([]);
            setTabConfig(DEFAULT_TAB_CONFIG);
            showToast('💥 ¡Todos los datos han sido borrados por completo! Sistema iniciado en blanco.');
          }}
          onResetToDefaults={async () => {
            await resetFirestoreToDefaults();
            localStorage.removeItem('servigo_workers_v2');
            localStorage.removeItem('servigo_bookings_v1');
            localStorage.removeItem('servigo_shops_v2');
            localStorage.removeItem('servigo_remises_v2');
            showToast('🔄 Base de datos restablecida a los valores iniciales de demostración.');
          }}
          showToast={showToast}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-5 right-5 left-5 sm:left-auto z-[100] bg-slate-900 text-white font-bold text-xs sm:text-sm py-3.5 px-5 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Bar & Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingCount={bookings.length}
        rentalItemsCount={rentalItems.length}
        tabConfig={tabConfig}
        customLogoUrl={appConfig?.customLogoUrl}
        customTagline={appConfig?.tagline}
        onOpenAdminPanel={() => setIsAdminModalOpen(true)}
        onOpenPdfGuide={() => setIsPdfGuideOpen(true)}
        onOpenShopDashboard={() => setIsShopDashboardModalOpen(true)}
        onOpenPublishRental={() => setActiveTab('alquiler')}
        onOpenWelcomeHub={enterHub}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      {/* App Body Content */}
      <main
        className={`flex-1 pb-10 sm:pb-16 ${activeTab === 'alquiler' || activeTab === 'search' ? 'bg-sg-navy' : ''} ${
          SERVICIOS_SUBTABS[activeTab] ? 'theme-servicios' : ''
        }`}
      >
        {/* Encabezado común para las sub-secciones */}
        {(SERVICIOS_SUBTABS[activeTab] || activeTab === 'cadetes') && (
          <div className="bg-sg-navy text-white font-sans">
            <div className="max-w-7xl mx-auto px-5 pt-5 pb-6 space-y-1.5">
              <h1 className="m-0 text-[28px] sm:text-4xl font-black tracking-[-0.03em] leading-tight">
                {(SERVICIOS_SUBTABS[activeTab] || CADETES_META).title}
              </h1>
              <p className="m-0 text-[15px] leading-snug text-[#c3cfea] max-w-2xl">
                {(SERVICIOS_SUBTABS[activeTab] || CADETES_META).text}
              </p>
            </div>
          </div>
        )}
        {/* TAB 1: WORKERS SEARCH & DISCOVERY CATALOG */}
        {activeTab === 'search' && (
          <div>
            {/* Encabezado de Servicios */}
            <div className="max-w-7xl mx-auto px-5 pt-6 pb-4 text-white font-sans space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-sg-blue flex items-center justify-center shrink-0">
                  <Wrench className="w-6 h-6 text-white" strokeWidth={2.4} aria-hidden="true" />
                </span>
                <h1 className="m-0 text-[32px] sm:text-4xl font-black tracking-[-0.03em] leading-none">Servicios</h1>
              </div>
              <p className="m-0 text-[15px] leading-snug text-[#c3cfea] max-w-2xl">
                Profesionales de Alejandro Roca y la zona. Escribiles por WhatsApp o pediles un turno.
              </p>
            </div>

            {/* Promoted Creator Banners Carousel */}
            <div className="max-w-7xl mx-auto px-5 pb-4">
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
            <div className="max-w-7xl mx-auto px-5 py-5 space-y-4 text-white font-sans">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-[#c3cfea]">
                  <b className="text-white">{filteredWorkers.length}</b> profesionales
                </span>
                {tabConfig.ai && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai')}
                    className="font-extrabold text-[#6aa8ff] hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    ¿No sabés a quién llamar? Contanos el problema
                  </button>
                )}
              </div>

              {filteredWorkers.length === 0 ? (
                <div className="rounded-3xl bg-sg-navy-2 p-7 text-center space-y-3">
                  <h3 className="m-0 text-xl font-black">
                    {workers.length === 0 ? 'Estamos sumando profesionales' : 'No encontramos profesionales con esos filtros'}
                  </h3>
                  <p className="m-0 text-sm text-[#c3cfea] max-w-md mx-auto">
                    {workers.length === 0
                      ? '¿Sos gasista, electricista, plomero o hacés algún oficio? Sumate gratis y que te encuentren los vecinos.'
                      : 'Probá con otro rubro o con todas las localidades.'}
                  </p>
                  {workers.length === 0 ? (
                    tabConfig.register && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('register')}
                        className="h-11 px-5 rounded-xl bg-sg-blue text-white font-extrabold text-sm cursor-pointer"
                      >
                        Sumarme como trabajador
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTrade('all');
                        setSelectedZone('all');
                        setSearchQuery('');
                        setOnlyMatriculados(false);
                        setOnly24h(false);
                        setOnlyBruzzonePartner(false);
                      }}
                      className="h-11 px-5 rounded-xl bg-sg-blue text-white font-extrabold text-sm cursor-pointer"
                    >
                      Ver todos
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {filteredWorkers.map((worker) => (
                    <WorkerCard
                      key={worker.id}
                      worker={worker}
                      onSelectWorker={setSelectedWorkerForModal}
                      onOpenBooking={setSelectedWorkerForBooking}
                      onOpenReviewModal={setSelectedWorkerForReview}
                      onOpenCouponModal={setSelectedWorkerForCoupon}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: COMERCIOS & NEGOCIOS LOCALES */}
        {activeTab === 'shops' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <ShopsSection
              shops={shops}
              selectedZone={selectedZone}
              onZoneSelect={setSelectedZone}
              onSaveShop={handleSaveShop}
            />
          </div>
        )}

        {/* TAB 2.1: BOLSA DE TRABAJO (RRHH Y CURRÍCULUMS VITAE CON IA) - EXCLUSIVO SERVIGO SERVICIOS */}
        {activeTab === 'jobs' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <JobBoardSection
              jobProfiles={jobProfiles}
              onSaveJobProfile={handleSaveJobProfile}
              showToast={showToast}
              availableZones={availableZones}
            />
          </div>
        )}

        {/* TAB 2.2: SERVIGO DELIVERY - COMERCIOS DE COMIDA */}
        {activeTab === 'delivery' && (
          <DeliveryModule
            showToast={showToast}
            onNavigateToHome={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('servigo_hub_entered');
              }
              setIsWelcomeHubOpen(true);
            }}
            onSwitchToServicios={() => setActiveTab('search')}
            onSwitchToCadetes={() => setActiveTab('cadetes')}
          />
        )}

        {/* TAB 2.3: CADETES & MANDADOS URBANOS */}
        {activeTab === 'cadetes' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <ErrorBoundary fallbackTitle="Error al cargar el módulo de cadetes">
              <CadetesSection showToast={showToast} />
            </ErrorBoundary>
          </div>
        )}

        {/* TAB 2.5: REMISES & VIAJES */}
        {activeTab === 'remises' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <RemisesSection
              remises={remises}
              onAddRemis={handleAddRemis}
              onUpdateRemisStatus={handleUpdateRemisStatus}
              onRequestRide={handleRequestRide}
              showToast={showToast}
            />
          </div>
        )}

        {/* TAB 3: REGISTER WORKER PORTAL */}
        {activeTab === 'register' && (
          <div className="px-4 py-6">
            <WorkerRegisterForm
              onRegisterSuccess={handleRegisterNewWorker}
              customTrades={appConfig?.customTrades}
              onAddNewTrade={handleAddNewTrade}
              onOpenPdfGuide={() => setIsPdfGuideOpen(true)}
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

        {/* TAB 6: SERVIGO ALQUILER DE PRODUCTOS (ESTILO GIVY) */}
        {activeTab === 'alquiler' && (
          <RentalsModule
            items={rentalItems}
            bookings={rentalBookings}
            owners={rentalOwners}
            onSaveRentalItem={handleSaveRentalItem}
            onDeleteRentalItem={handleDeleteRentalItem}
            onBookRental={handleBookRental}
            onRequestPayout={handleRequestPayout}
            onConfirmItemReturned={handleConfirmItemReturned}
            onReportDamage={handleReportDamage}
            showToast={showToast}
            onOpenCadetesModule={() => setActiveTab('cadetes')}
            onOpenDeliveryModule={() => setActiveTab('delivery')}
            onOpenServiciosModule={() => setActiveTab('search')}
          />
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
          onOpenCouponModal={(w) => {
            setSelectedWorkerForCoupon(w);
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

      {/* Worker Deliver Coupon to Client Modal */}
      {selectedWorkerForCoupon && (
        <WorkerCouponModal
          isOpen={!!selectedWorkerForCoupon}
          onClose={() => setSelectedWorkerForCoupon(null)}
          worker={selectedWorkerForCoupon}
          coupons={coupons}
          onIssueVoucher={handleIssueVoucher}
          showToast={showToast}
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
        onAddNewTrade={handleAddNewTrade}
        onSaveWorker={async (updatedWorker) => {
          const formattedWorker: Worker = {
            ...updatedWorker,
            location: formatZoneName(updatedWorker.location),
            zones: extractUniqueZones(updatedWorker.zones || []),
          };
          setWorkers((prev) => {
            const exists = prev.some((w) => w.id === formattedWorker.id);
            return exists
              ? prev.map((w) => (w.id === formattedWorker.id ? formattedWorker : w))
              : [formattedWorker, ...prev];
          });
          try {
            await saveWorkerToFirestore(formattedWorker);
            showToast(`¡Perfil de ${formattedWorker.name} guardado correctamente!`);
          } catch (err) {
            console.error('Failed to update worker in Firestore:', err);
            showToast('❌ Error al actualizar trabajador.');
          }
        }}
        onDeleteWorker={async (workerId) => {
          await deleteWorkerFromFirestore(workerId);
        }}
        shops={shops}
        onSaveShop={handleSaveShop}
        onDeleteShop={handleDeleteShop}
        remises={remises}
        onSaveRemis={handleSaveRemis}
        onDeleteRemis={handleDeleteRemis}
        coupons={coupons}
        onSaveCoupon={handleSaveCoupon}
        onDeleteCoupon={handleDeleteCoupon}
        issuedVouchers={issuedVouchers}
        onSaveIssuedVoucher={async (updatedVoucher) => {
          try {
            await saveIssuedVoucherToFirestore(updatedVoucher);
            setIssuedVouchers((prev) =>
              prev.map((v) => (v.id === updatedVoucher.id ? updatedVoucher : v))
            );
          } catch (err) {
            console.error('Error updating voucher status:', err);
            showToast('Error al actualizar estado del voucher');
          }
        }}
        onClearAllData={async () => {
          await clearAllFirestoreData();
          localStorage.removeItem('servigo_workers_v2');
          localStorage.removeItem('servigo_bookings_v1');
          localStorage.removeItem('servigo_shops_v2');
          localStorage.removeItem('servigo_remises_v2');
          setWorkers([]);
          setBookings([]);
          setShops([]);
          setRemises([]);
          setBanners([]);
          setTabConfig(DEFAULT_TAB_CONFIG);
          showToast('💥 ¡Todos los datos han sido borrados por completo! Sistema iniciado en blanco.');
        }}
        onResetToDefaults={async () => {
          await resetFirestoreToDefaults();
          localStorage.removeItem('servigo_workers_v2');
          localStorage.removeItem('servigo_bookings_v1');
          localStorage.removeItem('servigo_shops_v2');
          localStorage.removeItem('servigo_remises_v2');
          showToast('🔄 Base de datos restablecida a los valores iniciales de demostración.');
        }}
        rentalBookings={rentalBookings}
        rentalPayouts={rentalPayouts}
        rentalItems={rentalItems}
        rentalOwners={rentalOwners}
        onUpdatePayoutStatus={handleUpdatePayoutStatus}
        onConfirmRentalReturn={handleConfirmItemReturned}
        showToast={showToast}
      />

      {/* Pie de página */}
      <footer className="bg-sg-navy-3 border-t border-white/10 text-sg-muted text-sm font-sans pt-6 pb-28 sm:pb-6 px-5 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="m-0">
            <b className="text-white">ServiGo</b> · Alejandro Roca y zona · Auspicia{' '}
            <a href="https://ferreteriabruzzone.com.ar" target="_blank" rel="noopener noreferrer" className="font-bold text-white underline-offset-2 hover:underline">
              Ferretería Bruzzone
            </a>
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <button type="button" onClick={() => setIsPdfGuideOpen(true)} className="font-semibold hover:text-white cursor-pointer">
              Guía para sumarte
            </button>
            <button type="button" onClick={() => setIsAdminModalOpen(true)} className="font-semibold hover:text-white cursor-pointer">
              Acceso creador
            </button>
          </div>
        </div>
      </footer>

      {/* Registration PDF Guide Modal */}
      <RegistrationPdfGuideModal
        isOpen={isPdfGuideOpen}
        onClose={() => setIsPdfGuideOpen(false)}
      />

      {/* ShopDashboardModal for Store Owners */}
      <ErrorBoundary fallbackTitle="Error en el panel de control del comercio">
        <ShopDashboardModal
          isOpen={isShopDashboardModalOpen}
          onClose={() => setIsShopDashboardModalOpen(false)}
          showToast={showToast}
        />
      </ErrorBoundary>

      <BottomTabBar active={activeBottomTab} onSelect={goToBottomTab} hidden={hiddenBottomTabs} />

      {/* Welcome Portal / Module Redirection Modal */}
      <WelcomeHubModal
        isOpen={isWelcomeHubOpen}
        onClose={() => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('servigo_hub_entered', 'true');
          }
          setIsWelcomeHubOpen(false);
        }}
        onSelectHub={(hub) => {
          if (hub === 'delivery') {
            setActiveTab('delivery');
          } else if (hub === 'cadetes') {
            setActiveTab('cadetes');
          } else {
            setActiveTab('search');
          }
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('servigo_hub_entered', 'true');
          }
          setIsWelcomeHubOpen(false);
        }}
        canDismiss={true}
      />
    </div>
  );
}
