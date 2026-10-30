import { JobProfile } from '../types';

export const INITIAL_JOB_PROFILES: JobProfile[] = [
  {
    id: 'cv-1',
    fullName: 'Roberto Damián Gómez',
    trade: 'electricista',
    desiredTitle: 'Electricista Matriculado e Instalador Industrial',
    phone: '+54 9 358 433-2211',
    whatsapp: '5493584332211',
    email: 'roberto.gomez.electric@gmail.com',
    location: 'Alejandro Roca',
    zones: ['Alejandro Roca', 'Río Cuarto', 'La Carlota'],
    yearsOfExperience: 8,
    availability: 'jornada_completa',
    hasOwnVehicle: true,
    hasOwnTools: true,
    isMatriculado: true,
    matriculaNumber: 'MAT-ER-4482',
    salaryExpectation: 'A convenir según jornada / Por hora u obra',
    photoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400',
    summary: 'Técnico electricista con más de 8 años de trayectoria en montajes eléctricos de baja y media tensión, tableros trifásicos, cableados estructurados y automatismos para galpones e industrias. Destacado por su prolijidad, cumplimiento estricto de normativas de seguridad eléctrica y disponibilidad inmediata con camioneta y herramientas propias.',
    skills: [
      'Tableros Eléctricos Trifásicos y Monofásicos',
      'Cálculo de Cargas y Protección Térmica/Diferencial',
      'Instalación de Grupos Electrógenos y Transferencias',
      'Canalizaciones y Tendido Subterráneo',
      'Iluminación LED Industrial y Comercial',
      'Protocolos de Puesta a Tierra y Medición de Jabalinas'
    ],
    experience: [
      {
        id: 'exp-1',
        role: 'Oficial Electricista Principal',
        companyOrProject: 'ElectroConstrucciones del Centro',
        period: '2020 - 2024',
        description: 'Liderazgo de cuadrilla en cableados integrales de complejos de departamentos y naves logísticas. Montaje de tableros seccionales y principales.'
      },
      {
        id: 'exp-2',
        role: 'Instalador y Mantenimiento Eléctrico',
        companyOrProject: 'Servicios Agroindustriales del Sur',
        period: '2017 - 2020',
        description: 'Mantenimiento preventivo y correctivo de motores eléctricos, variadores de frecuencia y tableros de bombas de agua.'
      }
    ],
    education: [
      {
        id: 'edu-1',
        title: 'Técnico Electromecánico',
        institution: 'Escuela Técnica IPET N° 52',
        year: '2016'
      }
    ],
    certifications: [
      'Matrícula Habilitante ERSeP Cat. III',
      'Curso de Seguridad en Altura y Manejo de Plataformas',
      'Capacitación Schneider Electric en Automatismos'
    ],
    createdAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 'cv-2',
    fullName: 'Leandro Martín Benítez',
    trade: 'gasista',
    desiredTitle: 'Gasista Matriculado de 2da Categoría & Sanitarista',
    phone: '+54 9 358 411-9988',
    whatsapp: '5493584119988',
    email: 'leandro.benitez.gas@hotmail.com',
    location: 'Río Cuarto',
    zones: ['Río Cuarto', 'Alejandro Roca', 'Holmberg', 'Las Higueras'],
    yearsOfExperience: 6,
    availability: 'jornada_completa',
    hasOwnVehicle: true,
    hasOwnTools: true,
    isMatriculado: true,
    matriculaNumber: 'GAS-CUARTO-1922',
    salaryExpectation: 'Jornada completa o por contrato de obra',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    summary: 'Especialista en instalaciones de gas natural y envasado bajo norma ENARGAS NAG-200. Experiencia comprobable en tendido de cañerías por termofusión (Sigas), pruebas de hermeticidad con columna de agua, tramitaciones ante distribuidoras y colocación de artefactos de tiro balanceado.',
    skills: [
      'Fusión de Cañerías Sigas Thermofusión',
      'Pruebas Manométricas y Detección de Fugas',
      'Instalación de Calefones, Termotanques y Calderas Murales',
      'Cálculo de Ventilaciones y Rejillas Reglamentarias',
      'Armado de Baterías de Tubos de Gas Envasado 45kg',
      'Confección de Planos conforme a obra'
    ],
    experience: [
      {
        id: 'exp-b1',
        role: 'Gasista Matriculado Responsable',
        companyOrProject: 'Obras y Servicios Río Cuarto',
        period: '2021 - Presente',
        description: 'Ejecución y aprobación de más de 45 instalaciones domiciliarias y comerciales. Tramitación de medidores ante Ecogas.'
      },
      {
        id: 'exp-b2',
        role: 'Ayudante de Primera en Redes Sanitarias',
        companyOrProject: 'Instalaciones Benítez e Hijos',
        period: '2018 - 2021',
        description: 'Tendido de redes de agua fría y caliente por termofusión, desagües cloacales con junta elástica Awaduct y colocación de sanitarios.'
      }
    ],
    education: [
      {
        id: 'edu-b1',
        title: 'Curso de Instalador Gasista de 2da Categoría',
        institution: 'Centro de Formación Profesional N° 4',
        year: '2019'
      }
    ],
    certifications: [
      'Matrícula Oficial ENARGAS Vigente',
      'Certificado Oficial Sigas Thermofusión',
      'Capacitación en Calderas Ariston y Peisa'
    ],
    createdAt: '2026-09-18T14:30:00.000Z'
  },
  {
    id: 'cv-3',
    fullName: 'Esteban Javier Peralta',
    trade: 'plomero',
    desiredTitle: 'Oficial Plomero & Sanitarista Especialista en Termofusión',
    phone: '+54 9 358 488-7744',
    whatsapp: '5493584887744',
    email: 'esteban.peralta.plomeria@gmail.com',
    location: 'La Carlota',
    zones: ['La Carlota', 'Alejandro Roca', 'Los Cisnes'],
    yearsOfExperience: 10,
    availability: 'inmediata',
    hasOwnVehicle: true,
    hasOwnTools: true,
    isMatriculado: false,
    salaryExpectation: 'Por quincena o presupuesto por obra',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    summary: 'Sanitarista integral con una década de experiencia en obras nuevas, reformas de baños y cocinas, y resolución de urgencias de plomería. Especializado en bombeo elevador y presurizador, desagües pluviales y cloacales, y redes de polipropileno termofusionable.',
    skills: [
      'Termofusión Aqua System e IPS',
      'Instalación de Bombas Presurizadoras Rowa y Centrífugas',
      'Desagües Cloacales y Cámaras Sépticas',
      'Limpieza y Desobstrucción con Cinta Rotativa de Acero',
      'Colocación de Griferías Monocomando y Sanitarios Suspendidos',
      'Reparación de Válvulas de Descarga para Inodoros'
    ],
    experience: [
      {
        id: 'exp-p1',
        role: 'Encargado de Sanitaria',
        companyOrProject: 'Constructora del Sudeste',
        period: '2019 - 2024',
        description: 'Instalación completa de red de agua y cloacas en loteos de viviendas unifamiliares. Montaje de tanques de reserva y cisternas.'
      }
    ],
    education: [
      {
        id: 'edu-p1',
        title: 'Secundario Completo con Orientación Técnica',
        institution: 'Colegio Nacional La Carlota',
        year: '2013'
      }
    ],
    certifications: [
      'Certificación Instalador Sanitario Aqua System',
      'Carnet de Conductor Profesional B1'
    ],
    createdAt: '2026-09-20T09:15:00.000Z'
  },
  {
    id: 'cv-4',
    fullName: 'Cristian Daniel Morales',
    trade: 'pintor',
    desiredTitle: 'Pintor de Obra Profesional, Durlock & Revestimientos Plásticos',
    phone: '+54 9 358 455-6633',
    whatsapp: '5493584556633',
    email: 'morales.pintura.obra@gmail.com',
    location: 'Alejandro Roca',
    zones: ['Alejandro Roca', 'Río Cuarto', 'General Cabrera', 'La Carlota'],
    yearsOfExperience: 5,
    availability: 'medio_tiempo',
    hasOwnVehicle: true,
    hasOwnTools: true,
    isMatriculado: false,
    salaryExpectation: 'Jornal o por metro cuadrado',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
    summary: 'Pintor meticuloso con experiencia en terminaciones finas de interior y exterior, aplicación de revestimiento plástico tipo Tarquini/Revear con llana y soplete, enduido completo, impermeabilización de techos y terrazas, y armado de tabiques y cielorrasos de placas de yeso (Durlock).',
    skills: [
      'Revestimiento Plástico Texturado (Revear / Tarquini)',
      'Pintura Látex Interior y Exterior Premium',
      'Impermeabilización de Terrazas con Membrana Líquida',
      'Enduido Plástico Completo y Lijado con Aspiración',
      'Barnices y Esmaltes Sintéticos en Maderas y Metales',
      'Armado y Tomado de Juntas en Durlock'
    ],
    experience: [
      {
        id: 'exp-m1',
        role: 'Oficial Pintor',
        companyOrProject: 'Pinturas Morales & Asociados',
        period: '2021 - 2025',
        description: 'Pintura y revestimiento de fachadas de locales comerciales y residencias particulares con garantía de terminación.'
      }
    ],
    education: [
      {
        id: 'edu-m1',
        title: 'Curso de Técnicas de Pintura y Revestimientos',
        institution: 'Capacitación Alba / Bruzzone',
        year: '2021'
      }
    ],
    certifications: [
      'Aplicador Certificado Revear Texturados',
      'Manejo de Andamios Tubulares y Arneses de Seguridad'
    ],
    createdAt: '2026-09-22T16:00:00.000Z'
  },
  {
    id: 'cv-5',
    fullName: 'Mauricio Oscar Silveira',
    trade: 'albanil',
    desiredTitle: 'Oficial Albañil Mayor de Obra & Colocador de Porcelanato',
    phone: '+54 9 358 499-1122',
    whatsapp: '5493584991122',
    email: 'silveira.construcciones@gmail.com',
    location: 'Río Cuarto',
    zones: ['Río Cuarto', 'Alejandro Roca', 'Alpa Corral'],
    yearsOfExperience: 12,
    availability: 'por_proyecto',
    hasOwnVehicle: true,
    hasOwnTools: true,
    isMatriculado: false,
    salaryExpectation: 'Por contrato de obra / Presupuesto cerrado',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    summary: 'Constructor y albañil de amplia experiencia en obra tradicional y húmeda: cimientos, encadenados, mampostería de ladrillo común y hueco, revoques hidrófugos y finos, contrapisos nivelados y colocación milimétrica de porcelanatos de gran formato con niveladores.',
    skills: [
      'Replanteo de Obra y Nivelación Óptica/Láser',
      'Encofrados y Llenado de Hormigón Armado',
      'Colocación de Porcelanatos y Cerámicos de Gran Formato',
      'Revoques Gruesos, Finos e Hidrófugos con Cerecita',
      'Techos de Chapa con Aislación Térmica y Tejas',
      'Lectura e Interpretación de Planos de Arquitectura'
    ],
    experience: [
      {
        id: 'exp-s1',
        role: 'Capataz de Obra',
        companyOrProject: 'Constructora Silveira Hnos',
        period: '2016 - 2024',
        description: 'Construcción integral de viviendas llave en mano de 120m2 a 250m2. Coordinación de gremios y control de calidad.'
      }
    ],
    education: [
      {
        id: 'edu-s1',
        title: 'Maestro Mayor de Obras (Incompleto)',
        institution: 'Escuela Técnica Industrial',
        year: '2012'
      }
    ],
    certifications: [
      'Curso Klaukol en Colocación de Porcelanatos Grandes Formatos',
      'Capacitación en Seguridad e Higiene en la Construcción (UOCRA)'
    ],
    createdAt: '2026-09-25T11:20:00.000Z'
  },
  {
    id: 'cv-6',
    fullName: 'Gonzalo Andrés Rossi',
    trade: 'fletes',
    desiredTitle: 'Chofer Profesional de Utilitario & Fletes con Ayudante',
    phone: '+54 9 358 466-3399',
    whatsapp: '5493584663399',
    email: 'gonzalo.fletes.rossi@gmail.com',
    location: 'Alejandro Roca',
    zones: ['Alejandro Roca', 'Río Cuarto', 'La Carlota', 'Ucacha'],
    yearsOfExperience: 7,
    availability: 'medio_tiempo',
    hasOwnVehicle: true,
    hasOwnTools: true,
    isMatriculado: false,
    salaryExpectation: 'Por viaje, km o jornada pactada',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    summary: 'Chofer profesional con utilitario propio tipo furgón alto (capacidad 12m3 / 1.500 kg). Experiencia en mudanzas cuidadosas, distribución de mercadería comercial, retiro de materiales en corralones y ferreterías con servicio de carga y descarga responsable.',
    skills: [
      'Utilitario Propio Iveco Daily Furgón en Óptimo Estado',
      'Licencia Nacional Habilitante LINTI / Cargas Generales',
      'Embalaje Protector con Mantas y Film Stretch',
      'Amarre Seguro con Cintas Criquet Reglamentarias',
      'Conocimiento de Rutas Nacionales y Provinciales de Córdoba',
      'Puntualidad y Facturación Disponible'
    ],
    experience: [
      {
        id: 'exp-g1',
        role: 'Transportista Independiente',
        companyOrProject: 'Fletes y Envíos Rossi',
        period: '2019 - Presente',
        description: 'Servicio de logística de entregas para ferreterías, mueblerías y traslados particulares en toda la zona centro y sur de Córdoba.'
      }
    ],
    education: [
      {
        id: 'edu-g1',
        title: 'Secundario Completo',
        institution: 'Instituto Secundario Alejandro Roca',
        year: '2016'
      }
    ],
    certifications: [
      'Carnet Profesional Categoría C y E1',
      'Certificado LINTI Transporte de Cargas',
      'VTV al día y Seguro de Carga Activo'
    ],
    createdAt: '2026-09-28T08:45:00.000Z'
  }
];
