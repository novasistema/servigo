import express from 'express';
import crypto from 'crypto';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { GoogleGenAI, Type } from '@google/genai';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { firebaseConfig } from './firebaseConfig.js';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Firebase Admin SDK
// En Vercel se usa la cuenta de servicio de la variable FIREBASE_SERVICE_ACCOUNT
// (el JSON completo, o el mismo JSON codificado en base64).
// En Google Cloud Run (AI Studio) se usan las credenciales por defecto.
function loadServiceAccount(): any | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8');
    const sa = JSON.parse(text);
    if (typeof sa.private_key === 'string') sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    return sa;
  } catch (e) {
    console.error('FIREBASE_SERVICE_ACCOUNT no es un JSON válido.');
    return null;
  }
}

const serviceAccount = loadServiceAccount();
const adminApp = getApps().length > 0
  ? getApp()
  : initializeApp(
      serviceAccount
        ? { credential: cert(serviceAccount), projectId: firebaseConfig.projectId }
        : { projectId: firebaseConfig.projectId }
    );

const adminDb = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(adminApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(adminApp);

const adminAuth = getAuth(adminApp);

export function createApp() {
  const app = express();
  app.set('trust proxy', true);

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client lazily or safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Route: AI Problem Diagnosis & Recommended Hardware from Ferretería Bruzzone
  app.post('/api/gemini/diagnose', async (req, res) => {
    try {
      const { problemDescription } = req.body;
      if (!problemDescription) {
        return res.status(400).json({ error: 'Falta la descripción del problema' });
      }

      const ai = getGeminiClient();

      const prompt = `Eres el Asistente Técnico Inteligente de ServiGo, la red de servicios del hogar auspiciada por Ferretería Bruzzone (ferreteriabruzzone.com.ar).
El usuario describe la siguiente falla o problema en su hogar:
"${problemDescription}"

Tu objetivo es analizar la situación y responder estrictamente en formato JSON con la siguiente estructura:
1. tradeCategory: Uno de ['gasista', 'electricista', 'plomero', 'pintor', 'cerrajero', 'albanil', 'aire_acondicionado', 'jardineria', 'carpinteria', 'fletes']
2. diagnosisTitle: Título claro y conciso del problema (ej. "Pérdida en Flexible de Agua de Termotanque")
3. explanation: Explicación amigable en 2-3 oraciones del origen posible de la falla y qué recomendaciones de seguridad seguir mientras espera al profesional.
4. urgency: 'normal' | 'alta' | 'urgencia_24h'
5. recommendedMaterials: Lista de 2 a 4 materiales o insumos clave que puede adquirir en Ferretería Bruzzone para la reparación (ej. "Teflón de alta densidad 3/4", "Flexible mallado de acero inoxidable 40cm").
6. bruzzoneAdvise: Un consejo experto de Ferretería Bruzzone para prevenir que este problema vuelva a suceder.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tradeCategory: {
                type: Type.STRING,
                description: 'Categoría de oficio recomendada',
              },
              diagnosisTitle: {
                type: Type.STRING,
                description: 'Título breve del diagnóstico',
              },
              explanation: {
                type: Type.STRING,
                description: 'Explicación del problema y medidas de seguridad inmediatas',
              },
              urgency: {
                type: Type.STRING,
                description: 'Nivel de urgencia: normal, alta o urgencia_24h',
              },
              recommendedMaterials: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Insumos o repuestos a comprar en Ferretería Bruzzone',
              },
              bruzzoneAdvise: {
                type: Type.STRING,
                description: 'Consejo técnico preventivo de Ferretería Bruzzone',
              },
            },
            required: [
              'tradeCategory',
              'diagnosisTitle',
              'explanation',
              'urgency',
              'recommendedMaterials',
              'bruzzoneAdvise',
            ],
          },
        },
      });

      const jsonText = response.text || '{}';
      const parsedData = JSON.parse(jsonText);
      return res.json({ success: true, diagnosis: parsedData });
    } catch (error: any) {
      console.warn('Gemini API call failed, generating contextual diagnosis:', error.message);
      const desc = String(req.body?.problemDescription || '').toLowerCase();
      let tradeCategory = 'plomero';
      let title = 'Revisión y Reparación de Instalación';
      let explanation = 'Se detecta un problema que requiere intervención técnica calificada para evitar daños mayores en las instalaciones.';
      let materials = ['Teflón de alta densidad', 'Sellador para roscas', 'Abrazaderas de acero inoxidable'];
      let advise = 'Realice mantenimiento preventivo periódico y utilice repuestos normalizados de Ferretería Bruzzone.';

      if (desc.includes('luz') || desc.includes('electr') || desc.includes('cable') || desc.includes('termica') || desc.includes('disyuntor') || desc.includes('enchufe')) {
        tradeCategory = 'electricista';
        title = 'Falla en Circuito Eléctrico o Protección Térmica';
        explanation = 'Posible sobrecarga o cortocircuito en el tendido. Se recomienda desconectar artefactos de alto consumo hasta la llegada del electricista.';
        materials = ['Disyuntor diferencial 2x25A 30mA', 'Termomagnética bipolar 16A', 'Cinta aisladora PVC'];
        advise = 'No sobrecargue zapatillas eléctricas y adquiera protectores de tensión en Ferretería Bruzzone.';
      } else if (desc.includes('gas') || desc.includes('estufa') || desc.includes('calefon') || desc.includes('termotanque') || desc.includes('olor')) {
        tradeCategory = 'gasista';
        title = 'Inspección de Artefacto o Línea de Gas';
        explanation = 'Cierre la llave de paso de gas inmediatamente y ventile los ambientes por precaución mientras espera al profesional matriculado.';
        materials = ['Flexible de acero inoxidable aprobado para gas', 'Sellador anaeróbico para gas', 'Cupla epoxi'];
        advise = 'Exija siempre la verificación de rejillas reglamentarias de ventilación con insumos certificados.';
      } else if (desc.includes('pint') || desc.includes('humed') || desc.includes('pared') || desc.includes('techo') || desc.includes('gotera')) {
        tradeCategory = 'pintor';
        title = 'Tratamiento de Humedad y Terminación de Superficie';
        explanation = 'La humedad deteriora revoques y capas de pintura. Conviene rasquetear y aplicar fijador antes del recubrimiento final.';
        materials = ['Fijador al aguarrás', 'Pintura Látex para frentes o interior', 'Lija al agua grano 120'];
        advise = 'Consulte en Ferretería Bruzzone por impermeabilizantes con poliuretano de alta durabilidad.';
      }

      return res.json({
        success: true,
        diagnosis: {
          tradeCategory,
          diagnosisTitle: title,
          explanation,
          urgency: 'alta',
          recommendedMaterials: materials,
          bruzzoneAdvise: advise,
        },
      });
    }
  });

  // API Route: AI CV & Resume Professional Assistant for Bolsa de Trabajo
  app.post('/api/gemini/generate-cv', async (req, res) => {
    const {
      fullName = 'Candidato Profesional',
      trade = 'electricista',
      rawExperience = '',
      yearsOfExperience = 3,
      skills = [],
      location = 'Alejandro Roca',
      isMatriculado = false,
      matriculaNumber = '',
    } = req.body || {};

    try {
      const ai = getGeminiClient();

      const prompt = `Actúa como un Especialista Senior de Recursos Humanos y Redactor Profesional de Currículum Vitae (CV) técnico para la Bolsa de Trabajo de la plataforma ServiGo.
El candidato busca empleo o ser contratado por empresas constructoras, comercios, talleres o clientes particulares que revisan CVs clasificados por oficio.

Datos ingresados por el candidato:
- Nombre Completo: ${fullName}
- Oficio / Rubro: ${trade}
- Años de Experiencia: ${yearsOfExperience} año(s)
- Localidad / Zona: ${location}
- ¿Es Matriculado?: ${isMatriculado ? `Sí, Matrícula N°: ${matriculaNumber || 'Vigente'}` : 'No'}
- Habilidades preliminares: ${Array.isArray(skills) && skills.length > 0 ? skills.join(', ') : 'No especificadas aún'}
- Experiencia y notas en sus propias palabras:
"${rawExperience || 'Cuento con experiencia en el rubro realizando diversas obras, mantenimiento, instalaciones y reparaciones particulares.'}"

Genera una respuesta profesional de alto impacto en formato JSON estrictamente estructurado así:
1. desiredTitle: Título o cargo profesional formal (ej. "Técnico Electricista Matriculado & Especialista en Montajes").
2. summary: Resumen profesional de 3 a 5 oraciones persuasivas, formales y prolijas destacando compromiso, idoneidad técnica y puntualidad.
3. keySkills: Lista de 6 a 8 habilidades técnicas concretas de este oficio (ej. "Termofusión de cañerías", "Soldadura TIG/MIG", "Armado de tableros").
4. experienceHighlights: Array de 2 a 3 experiencias laborales bien redactadas con role, companyOrProject, period y description.
5. recommendedCertifications: Array de 2 a 3 certificaciones o cursos recomendados para este rubro.
6. interviewTip: Un consejo breve y motivador para cuando lo llamen a una entrevista o prueba práctica.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              desiredTitle: {
                type: Type.STRING,
                description: 'Título laboral profesional de alto nivel',
              },
              summary: {
                type: Type.STRING,
                description: 'Resumen profesional persuasivo y formal',
              },
              keySkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Habilidades técnicas destacadas',
              },
              experienceHighlights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    role: { type: Type.STRING },
                    companyOrProject: { type: Type.STRING },
                    period: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ['role', 'companyOrProject', 'period', 'description'],
                },
                description: 'Experiencias laborales destacadas',
              },
              recommendedCertifications: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Certificaciones o cursos recomendados',
              },
              interviewTip: {
                type: Type.STRING,
                description: 'Consejo para la entrevista',
              },
            },
            required: [
              'desiredTitle',
              'summary',
              'keySkills',
              'experienceHighlights',
              'recommendedCertifications',
              'interviewTip',
            ],
          },
        },
      });

      const jsonText = response.text || '{}';
      const parsedData = JSON.parse(jsonText);
      return res.json({ success: true, cvData: parsedData });
    } catch (error: any) {
      console.warn('Gemini API call failed, generating high-quality contextual CV:', error.message);

      // Contextual skills catalog per trade
      const tradeMap: Record<string, { title: string; skills: string[]; certs: string[] }> = {
        electricista: {
          title: isMatriculado ? 'Técnico Electricista Matriculado & Especialista en Montajes' : 'Oficial Electricista & Mantenimiento Eléctrico',
          skills: [
            'Armado y Conexión de Tableros Trifásicos y Monofásicos',
            'Tendido de Cañerías y Cableado Estructurado',
            'Medición de Puesta a Tierra y Protocolo de Jabalinas',
            'Instalación de Disyuntores y Llaves Termomagnéticas',
            'Montaje de Iluminación LED Industrial y Comercial',
            'Detección Rápida de Fallas y Cortocircuitos',
          ],
          certs: ['Matrícula Habilitante de Electricista', 'Normas de Seguridad e Higiene Eléctrica'],
        },
        gasista: {
          title: isMatriculado ? 'Gasista Matriculado & Especialista en Instalaciones Sanitarias' : 'Oficial Gasista & Redes Termofusión',
          skills: [
            'Fusión de Cañerías Sigas Thermofusión',
            'Pruebas Manométricas y Detección de Fugas con Columna de Agua',
            'Instalación y Calibración de Calefones, Termotanques y Calderas',
            'Armado de Baterías de Tubos de Gas Envasado 45kg',
            'Ventilaciones Reglamentarias y Rejillas Normalizadas NAG-200',
            'Confección de Planos Conforme a Obra',
          ],
          certs: ['Matrícula ENARGAS de 2da/3ra Categoría', 'Curso de Termofusión Sigas'],
        },
        plomero: {
          title: 'Plomero Profesional & Sanitarista de Precisión',
          skills: [
            'Termofusión de Agua Fría y Caliente (Acqua System / Tigre)',
            'Tendido de Desagües Cloacales y Pluviales Awaduct',
            'Montaje de Bombas Presurizadoras y Elevadoras',
            'Reparación y Cambio de Válvulas y Griferías de Embutir',
            'Limpieza y Desinfección de Tanques de Reserva',
            'Cálculo de Caudales y Pendientes Hidráulicas',
          ],
          certs: ['Certificación en Termofusión Hidráulica', 'Normas de Seguridad Sanitaria'],
        },
        pintor: {
          title: 'Pintor Profesional de Obras & Terminaciones Finas',
          skills: [
            'Preparación, Lijado y Enduido Completo de Muros',
            'Aplicación de Látex Lavable, Esmaltes y Satinados',
            'Impermeabilización de Terrazas, Techos y Medianeras',
            'Tratamiento de Maderas, Cetol y Barnices Poliuretánicos',
            'Pintura en Altura con Andamios y Líneas de Vida',
            'Cálculo Preciso de Rendimiento de Materiales',
          ],
          certs: ['Curso de Trabajo Seguro en Altura', 'Capacitación en Revestimientos Texturados'],
        },
        albanil: {
          title: 'Oficial Albañil de Primera & Construcción Tradicional',
          skills: [
            'Revoques Gruesos, Finos Fratasados y Yeso',
            'Colocación de Cerámicos, Porcelanatos y Zócalos',
            'Armado de Encofrados, Vigas y Columnas de Hormigón',
            'Levantamiento de Mampostería con Ladrillo Hueco y Común',
            'Contrapisos, Carpetas Niveladoras y Pendientes',
            'Lectura e Interpretación de Planos de Arquitectura',
          ],
          certs: ['Seguridad en la Construcción UOCRA', 'Operador de Maquinaria Liviana'],
        },
        cerrajero: {
          title: 'Cerrajero Profesional de Urgencias & Seguridad',
          skills: [
            'Aperturas Limpias sin Daños en Puertas Blindadas y Clásicas',
            'Cambio de Combinaciones, Cilindros Europerfil y Copias',
            'Instalación de Cerraduras Multipunto y Cerrojos Auxiliares',
            'Mantenimiento de Cierrapuertas y Barrales Antipánico',
            'Cerrajería Automotor y Duplicados con Chip',
          ],
          certs: ['Certificación Técnica en Sistemas de Cerrajería', 'Capacitación en Cerraduras Digitales'],
        },
        aire_acondicionado: {
          title: 'Técnico Especialista en Climatización & Refrigeración',
          skills: [
            'Instalación de Equipos Split, Multi-Split e Inverter',
            'Presurización con Nitrógeno y Vacío con Bomba Doble Efecto',
            'Carga y Recuperación de Gases R410A, R32 y R22',
            'Mantenimiento Preventivo, Limpieza de Evaporadoras y Turbinas',
            'Diagnóstico Eléctrico de Motores, Capacitores y Sensores',
          ],
          certs: ['Matrícula CACAAV de Refrigeración', 'Manipulación Segura de Gases Refrigerantes'],
        },
      };

      const matched = tradeMap[trade.toLowerCase()] || {
        title: `Oficial Especialista en ${trade.charAt(0).toUpperCase() + trade.slice(1)}`,
        skills: [
          'Dominio de Herramientas Específicas del Rubro',
          'Diagnóstico Preciso y Presupuestos Detallados',
          'Puntualidad, Compromiso y Atención al Cliente',
          'Mantenimiento Preventivo y Correctivo',
          'Cumplimiento Estricto de Normas de Seguridad',
        ],
        certs: ['Certificado de Idoneidad Técnica', 'Normas de Seguridad Laboral'],
      };

      const finalSkills = Array.isArray(skills) && skills.length > 0
        ? Array.from(new Set([...skills, ...matched.skills])).slice(0, 8)
        : matched.skills;

      const dynamicSummary = `Profesional con más de ${yearsOfExperience} años de experiencia comprobada en el rubro de ${trade}, especializado en obras residenciales, comerciales e industriales en ${location} y zonas de influencia. Caracterizado por su idoneidad técnica, prolijidad en las terminaciones, estricto cumplimiento de plazos y atención personalizada para garantizar la máxima durabilidad y satisfacción del cliente.`;

      const startYear = Math.max(2015, new Date().getFullYear() - Number(yearsOfExperience));
      const midYear = Math.min(new Date().getFullYear(), startYear + Math.floor(Number(yearsOfExperience) / 2));

      const fallbackCv = {
        desiredTitle: matched.title,
        summary: dynamicSummary,
        keySkills: finalSkills,
        experienceHighlights: [
          {
            role: `Oficial Responsable en ${trade.charAt(0).toUpperCase() + trade.slice(1)}`,
            companyOrProject: 'Obras Civiles, Mantenimiento y Clientes Particulares',
            period: `${midYear} - Presente`,
            description: rawExperience.trim()
              ? `Ejecución de trabajos especializados: ${rawExperience.trim().slice(0, 180)}. Coordinación integral y entrega conforme a especificaciones.`
              : `Ejecución integral de obras, reparaciones de urgencia y mantenimiento con herramientas de precisión y materiales normalizados.`,
          },
          {
            role: 'Oficial de Montaje y Reparaciones',
            companyOrProject: 'Contratistas y Servicios de la Zona',
            period: `${startYear} - ${midYear}`,
            description: 'Participación en cuadrillas de obra, tendidos, montajes de estructuras y asistencia técnica directa con supervisión de calidad.',
          },
        ],
        recommendedCertifications: matched.certs,
        interviewTip: 'Llega 10 minutos antes, lleva fotos de tus mejores trabajos anteriores en el celular y destaca tu compromiso con la seguridad y la puntualidad.',
      };

      return res.json({ success: true, cvData: fallbackCv });
    }
  });

  // =========================================================================
  // SECURE TRANSACTIONS & ESCROW ENDPOINTS (Firebase Admin SDK)
  // =========================================================================
  const ADMIN_EMAILS = ['ajnovasistemas@gmail.com'];

  const authenticateFirebaseUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado: Token de autenticación ausente.' });
    }

    const token = authHeader.split('Bearer ')[1].trim();
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      (req as any).user = decoded;
      next();
    } catch (err: any) {
      console.error('Error de verificación de ID Token:', err.message);
      return res.status(401).json({ error: 'Token de autenticación inválido o expirado.' });
    }
  };

  const isUserAdmin = (user: any): boolean => {
    return Boolean(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
  };

  // =========================================================================
  // MERCADO PAGO MARKETPLACE INTEGRATION
  // =========================================================================
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
  const MP_CLIENT_ID = process.env.MP_CLIENT_ID || '';
  const MP_CLIENT_SECRET = process.env.MP_CLIENT_SECRET || '';
  const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || '';
  const APP_URL = process.env.APP_URL || '';

  const isMpConfigured = Boolean(MP_ACCESS_TOKEN);

  // El "state" de OAuth va firmado para que nadie pueda vincular su cuenta de MP
  // al perfil de otro dueño (y quedarse con sus cobros).
  const STATE_KEY = MP_CLIENT_SECRET || MP_ACCESS_TOKEN || 'servigo';
  const signState = (uid: string) => {
    const ts = Date.now().toString();
    const sig = crypto.createHmac('sha256', STATE_KEY).update(`${uid}.${ts}`).digest('hex');
    return `${uid}.${ts}.${sig}`;
  };
  const verifyState = (state: string): string | null => {
    const parts = String(state || '').split('.');
    if (parts.length !== 3) return null;
    const [uid, ts, sig] = parts;
    const expected = crypto.createHmac('sha256', STATE_KEY).update(`${uid}.${ts}`).digest('hex');
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    if (Date.now() - Number(ts) > 30 * 60 * 1000) return null; // 30 minutos
    return uid;
  };
  const mpPlatformClient = isMpConfigured ? new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN }) : null;

  // Endpoint: Consultar estado de configuración de pagos y tasa de comisión
  app.get('/api/rentals/mp-status', async (_req, res) => {
    let platformFeeRate = 0.05;
    try {
      const configSnap = await adminDb.collection('app_config').doc('rentals').get();
      if (configSnap.exists && typeof configSnap.data()?.platformFeeRate === 'number') {
        platformFeeRate = configSnap.data()?.platformFeeRate;
      }
    } catch (e) {
      // Fallback
    }

    return res.json({
      mpConfigured: isMpConfigured,
      hasClientId: Boolean(MP_CLIENT_ID),
      platformFeeRate,
    });
  });

  // a) OAuth: Iniciar vinculación de cuenta de Mercado Pago para locadores
  app.get('/api/mp/connect', authenticateFirebaseUser, (req, res) => {
    const user = (req as any).user;
    if (!MP_CLIENT_ID) {
      return res.status(400).json({ error: 'Mercado Pago Client ID no está configurado.' });
    }

    const baseUrl = APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${baseUrl}/api/mp/oauth/callback`;
    const authUrl = `https://auth.mercadopago.com/authorization?client_id=${MP_CLIENT_ID}&response_type=code&platform_id=mp&state=${encodeURIComponent(signState(user.uid))}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return res.json({ success: true, url: authUrl });
  });

  // a) OAuth Callback: Recibe código y guarda access_token SOLO en rental_owner_secrets
  app.get('/api/mp/oauth/callback', async (req, res) => {
    try {
      const code = req.query.code as string;
      const ownerUid = verifyState(req.query.state as string);

      if (!code || !ownerUid) {
        return res.status(400).send('Parámetros de autorización faltantes (código o estado).');
      }

      if (!MP_CLIENT_SECRET || !MP_CLIENT_ID) {
        return res.status(500).send('Credenciales de Mercado Pago incompletas en el servidor.');
      }

      const baseUrl = APP_URL || `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${baseUrl}/api/mp/oauth/callback`;

      const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_secret: MP_CLIENT_SECRET,
          client_id: MP_CLIENT_ID,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        console.error('Error al intercambiar código OAuth de MP:', errText);
        return res.status(502).send(`Error al vincular cuenta con Mercado Pago: ${errText}`);
      }

      const tokenData = (await tokenResponse.json()) as any;

      // Guardar access token de forma estrictamente privada en rental_owner_secrets
      await adminDb.collection('rental_owner_secrets').doc(ownerUid).set({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        publicKey: tokenData.public_key,
        mpUserId: tokenData.user_id,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Marcar al locador como conectado
      await adminDb.collection('rental_owners').doc(ownerUid).set({
        mpConnected: true,
        mpUserId: tokenData.user_id,
        mpLinkedAt: new Date().toISOString(),
      }, { merge: true });

      return res.redirect(`${baseUrl}/?tab=rentals&mp_connected=true`);
    } catch (err: any) {
      console.error('Error en /api/mp/oauth/callback:', err);
      return res.status(500).send('Error interno procesando vinculación con Mercado Pago.');
    }
  });

  // b) Checkout: Crea reserva en estado pendiente_pago y preferencia de Mercado Pago Marketplace
  app.post('/api/rentals/checkout', authenticateFirebaseUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const {
        rentalItemId,
        startDate,
        endDate,
        deliveryMethod = 'retiro_dueno',
        deliveryAddress = '',
        notes = '',
        clientName = '',
        clientPhone = '',
        clientDni = '',
        contractAccepted = false,
      } = req.body;

      if (!rentalItemId || !startDate || !endDate) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos (rentalItemId, startDate, endDate).' });
      }

      if (!clientName.trim() || !clientPhone.trim() || !clientDni.trim()) {
        return res.status(400).json({ error: 'Faltan los datos obligatorios del cliente (nombre, teléfono y DNI).' });
      }

      if (!contractAccepted) {
        return res.status(400).json({ error: 'Debes aceptar los Términos y Condiciones del Contrato de Alquiler.' });
      }

      // Si Mercado Pago no está configurado, informar explícitamente sin simular pago
      if (!isMpConfigured) {
        return res.status(400).json({
          error: 'Pagos no configurados',
          mpConfigured: false,
          message: 'El procesador de pagos de Mercado Pago no está configurado en las variables de entorno.',
        });
      }

      // 1. Leer rental_item en Firestore autoritativamente (el cliente NUNCA envía montos)
      const itemRef = adminDb.collection('rental_items').doc(rentalItemId);
      const itemSnap = await itemRef.get();
      if (!itemSnap.exists) {
        return res.status(404).json({ error: 'El producto a alquilar no existe en el catálogo.' });
      }

      const item = itemSnap.data() as any;
      const dailyPrice = Number(item.dailyPrice) || 0;
      const depositAmount = Number(item.depositAmount) || 0;
      const weeklyPrice = item.weeklyPrice ? Number(item.weeklyPrice) : undefined;
      const ownerId = item.ownerUid || item.ownerId || '';
      const ownerName = item.ownerName || 'Locador';
      const ownerPhone = item.ownerPhone || '';
      const ownerWhatsapp = item.ownerWhatsapp || ownerPhone;

      // 2. Calcular días de forma canónica
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.max(0, end.getTime() - start.getTime());
      const totalDays = Math.max(item.minRentalDays || 1, Math.round(diffTime / (1000 * 60 * 60 * 24)) || 1);

      // 3. Calcular subtotal de alquiler
      const baseSubtotal = totalDays * dailyPrice;
      let rentalSubtotal = baseSubtotal;
      if (totalDays >= 7 && weeklyPrice) {
        const fullWeeks = Math.floor(totalDays / 7);
        const extraDays = totalDays % 7;
        rentalSubtotal = (fullWeeks * weeklyPrice) + (extraDays * dailyPrice);
      }

      // 4. Leer platformFeeRate de app_config/rentals (default 0.05)
      let platformFeeRate = 0.05;
      try {
        const configSnap = await adminDb.collection('app_config').doc('rentals').get();
        if (configSnap.exists && typeof configSnap.data()?.platformFeeRate === 'number') {
          platformFeeRate = configSnap.data()?.platformFeeRate;
        }
      } catch (err) {
        // Fallback default 0.05
      }

      const platformFeeAmount = Math.round(rentalSubtotal * platformFeeRate);
      const ownerNetAmount = rentalSubtotal - platformFeeAmount;
      const totalPrice = rentalSubtotal + depositAmount;

      const userSnap = await adminDb.collection('users').doc(user.uid).get();
      if (userSnap.exists && userSnap.data()?.blocked) {
        return res.status(403).json({ error: 'Tu cuenta está bloqueada por un alquiler no devuelto. Contactá a ServiGo.' });
      }

      const bookingId = `rent-book-${Date.now()}`;
      const baseUrl = APP_URL || `${req.protocol}://${req.get('host')}`;

      // 5. Consultar access token del dueño desde la colección privada rental_owner_secrets
      const secretSnap = await adminDb.collection('rental_owner_secrets').doc(ownerId).get();
      const ownerAccessToken = secretSnap.exists ? secretSnap.data()?.accessToken : null;

      // Crear preferencia en MP con el token del dueño (o de la plataforma en fallback) con marketplace_fee
      const tokenForPreference = ownerAccessToken || MP_ACCESS_TOKEN;
      const preferenceClient = new Preference(new MercadoPagoConfig({ accessToken: tokenForPreference }));

      const prefResult = await preferenceClient.create({
        body: {
          items: [
            {
              id: item.id,
              title: `Alquiler: ${item.title} (${totalDays} día${totalDays > 1 ? 's' : ''})`,
              unit_price: rentalSubtotal,
              quantity: 1,
              currency_id: 'ARS',
            },
          ],
          ...(ownerAccessToken ? { marketplace_fee: platformFeeAmount } : {}),
          external_reference: bookingId,
          notification_url: `${baseUrl}/api/mp/webhook`,
          back_urls: {
            success: `${baseUrl}/?tab=rentals&booking_status=confirmado&booking_id=${bookingId}`,
            pending: `${baseUrl}/?tab=rentals&booking_status=pendiente&booking_id=${bookingId}`,
            failure: `${baseUrl}/?tab=rentals&booking_status=fallido&booking_id=${bookingId}`,
          },
          auto_return: 'approved',
        },
      });

      // 6. Depósito de garantía en custodia: cobrado como pago aparte a la cuenta de la plataforma
      let depositInitPoint: string | undefined = undefined;
      let depositPrefId: string | undefined = undefined;

      if (depositAmount > 0) {
        const platformPrefClient = new Preference(new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN }));
        const depositPref = await platformPrefClient.create({
          body: {
            items: [
              {
                id: `deposit-${bookingId}`,
                title: `Garantía Reembolsable en Custodia: ${item.title}`,
                unit_price: depositAmount,
                quantity: 1,
                currency_id: 'ARS',
              },
            ],
            external_reference: `deposit_${bookingId}`,
            notification_url: `${baseUrl}/api/mp/webhook`,
            back_urls: {
              success: `${baseUrl}/?tab=rentals&deposit_status=custodiada&booking_id=${bookingId}`,
              pending: `${baseUrl}/?tab=rentals&deposit_status=pendiente&booking_id=${bookingId}`,
              failure: `${baseUrl}/?tab=rentals&deposit_status=fallida&booking_id=${bookingId}`,
            },
            auto_return: 'approved',
          },
        });
        depositInitPoint = depositPref.init_point || depositPref.sandbox_init_point;
        depositPrefId = depositPref.id;
      }

      // 7. Crear reserva en Firestore con estado pendiente_pago
      const bookingDoc = {
        paidDirectToOwner: Boolean(ownerAccessToken),
        id: bookingId,
        rentalItemId: item.id,
        rentalItemTitle: item.title,
        rentalItemImage: (item.images && item.images[0]) || '',
        dailyPrice,
        ownerId,
        ownerUid: ownerId,
        clientUid: user.uid,
        createdBy: user.uid,
        ownerName,
        ownerPhone,
        ownerWhatsapp,
        ownerCbuOrAlias: item.ownerCbuOrAlias || '',
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientWhatsapp: clientPhone.trim(),
        clientDni: clientDni.trim(),
        startDate,
        endDate,
        totalDays,
        rentalSubtotal,
        platformFeeRate,
        platformFeeAmount,
        ownerNetAmount,
        depositAmount,
        totalPrice,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'envio_cadete' ? deliveryAddress.trim() : '',
        notes: notes.trim(),
        status: 'pendiente',
        paymentStatus: 'pendiente_pago',
        depositStatus: depositAmount > 0 ? 'pendiente' : 'en_custodia',
        mpRentalPreferenceId: prefResult.id,
        mpDepositPreferenceId: depositPrefId || null,
        contractAccepted: true,
        contractAcceptedAt: new Date().toISOString(),
        contractSignerDni: clientDni.trim(),
        contractSignerName: clientName.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await adminDb.collection('rental_bookings').doc(bookingId).set(bookingDoc);

      return res.json({
        success: true,
        bookingId,
        init_point: prefResult.init_point || prefResult.sandbox_init_point,
        deposit_init_point: depositInitPoint,
        rentalSubtotal,
        platformFeeRate,
        platformFeeAmount,
        ownerNetAmount,
        depositAmount,
        totalPrice,
      });
    } catch (err: any) {
      console.error('Error en /api/rentals/checkout:', err);
      return res.status(500).json({ error: err.message || 'Error al procesar el checkout de alquiler.' });
    }
  });

  // c) Webhook: Valida firma, consulta el pago a la API de MP y SOLO si está approved pasa la reserva a confirmado / paymentStatus pagado
  app.post('/api/mp/webhook', async (req, res) => {
    try {
      const xSignature = req.headers['x-signature'] as string | undefined;
      const xRequestId = req.headers['x-request-id'] as string | undefined;
      const dataId = String(req.query['data.id'] || req.body?.data?.id || req.body?.id || '');

      // 1) Firma obligatoria si hay secreto configurado: si no coincide, se rechaza.
      if (MP_WEBHOOK_SECRET) {
        let ts = '';
        let hash = '';
        for (const part of String(xSignature || '').split(',')) {
          const [key, val] = part.split('=');
          if (key?.trim() === 'ts') ts = (val || '').trim();
          if (key?.trim() === 'v1') hash = (val || '').trim();
        }
        if (!ts || !hash || !dataId) {
          return res.sendStatus(401);
        }
        const idForManifest = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
        const manifest = `id:${idForManifest};request-id:${xRequestId || ''};ts:${ts};`;
        const expectedHash = crypto.createHmac('sha256', MP_WEBHOOK_SECRET).update(manifest).digest('hex');
        if (expectedHash.length !== hash.length ||
            !crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(hash))) {
          console.warn('Webhook MP rechazado: firma inválida.');
          return res.sendStatus(401);
        }
      }

      const topic = String(req.query.type || req.query.topic || req.body?.type || '');
      if (!dataId || !isMpConfigured || (topic && topic !== 'payment')) {
        return res.sendStatus(200);
      }

      // 2) Consultar el pago con el token correcto: primero el de la plataforma
      //    (garantías y dueños sin cuenta vinculada); si no, el del dueño cobrador.
      let paymentData: any = null;
      try {
        paymentData = await new Payment(mpPlatformClient!).get({ id: dataId });
      } catch (_e) {
        const collectorId = req.body?.user_id;
        if (collectorId) {
          const q = await adminDb.collection('rental_owner_secrets')
            .where('mpUserId', '==', Number(collectorId)).limit(1).get();
          const q2 = q.empty
            ? await adminDb.collection('rental_owner_secrets').where('mpUserId', '==', String(collectorId)).limit(1).get()
            : q;
          const token = q2.empty ? null : q2.docs[0].data().accessToken;
          if (token) {
            try {
              paymentData = await new Payment(new MercadoPagoConfig({ accessToken: token })).get({ id: dataId });
            } catch (err: any) {
              console.warn('No se pudo consultar el pago con el token del dueño:', err.message);
            }
          }
        }
      }

      if (!paymentData || paymentData.status !== 'approved') {
        return res.sendStatus(200);
      }

      const extRef = String(paymentData.external_reference || '');
      const paid = Number(paymentData.transaction_amount) || 0;
      const isDeposit = extRef.startsWith('deposit_');
      const bookingId = isDeposit ? extRef.replace('deposit_', '') : extRef;
      if (!bookingId) return res.sendStatus(200);

      const bookingRef = adminDb.collection('rental_bookings').doc(bookingId);

      // 3) Transacción: verifica monto y evita acreditar dos veces el mismo pago.
      await adminDb.runTransaction(async (tx) => {
        const snap = await tx.get(bookingRef);
        if (!snap.exists) return;
        const booking = snap.data() as any;
        const now = new Date().toISOString();

        if (isDeposit) {
          if (booking.mpDepositPaymentId) return; // ya procesado
          if (Math.abs(paid - (Number(booking.depositAmount) || 0)) > 1) {
            console.warn(`Monto de garantía no coincide en ${bookingId}: pagado ${paid}`);
            tx.update(bookingRef, { paymentMismatch: true, updatedAt: now });
            return;
          }
          tx.update(bookingRef, {
            depositStatus: 'en_custodia',
            mpDepositPaymentId: paymentData.id,
            depositPaidAt: now,
            updatedAt: now,
          });
          return;
        }

        if (booking.mpPaymentId || booking.paymentStatus === 'pagado') return; // ya procesado
        if (Math.abs(paid - (Number(booking.rentalSubtotal) || 0)) > 1) {
          console.warn(`Monto de alquiler no coincide en ${bookingId}: pagado ${paid}`);
          tx.update(bookingRef, { paymentMismatch: true, updatedAt: now });
          return;
        }

        tx.update(bookingRef, {
          status: 'confirmado',
          paymentStatus: 'pagado',
          mpPaymentId: paymentData.id,
          paidAt: now,
          updatedAt: now,
        });

        const ownerId = booking.ownerUid || booking.ownerId;
        if (ownerId && !booking.paidDirectToOwner) {
          const ownerRef = adminDb.collection('rental_owners').doc(ownerId);
          tx.set(ownerRef, {
            pendingBalance: FieldValue.increment(Number(booking.ownerNetAmount) || 0),
          }, { merge: true });
        }
      });

      return res.sendStatus(200);
    } catch (err: any) {
      console.error('Error en webhook de Mercado Pago:', err);
      // 500 para que Mercado Pago reintente más tarde
      return res.sendStatus(500);
    }
  });

  // d) Reembolso de depósito de garantía vía API oficial de Mercado Pago
  app.post('/api/rentals/refund-deposit', authenticateFirebaseUser, async (req, res) => {
    try {
      const { bookingId } = req.body;
      const user = (req as any).user;

      if (!bookingId) {
        return res.status(400).json({ error: 'Falta bookingId de la reserva.' });
      }

      const bookingRef = adminDb.collection('rental_bookings').doc(bookingId);
      const snap = await bookingRef.get();
      if (!snap.exists) {
        return res.status(404).json({ error: 'Reserva no encontrada.' });
      }

      const booking = snap.data() as any;
      const isOwner = user.uid === booking.ownerUid || user.uid === booking.ownerId;
      const isAdminUser = isUserAdmin(user);

      if (!isOwner && !isAdminUser) {
        return res.status(403).json({ error: 'No tienes permisos para reembolsar la garantía de este alquiler.' });
      }

      if (booking.depositStatus === 'devuelto_a_cliente') {
        return res.json({ success: true, message: 'La garantía ya fue devuelta previamente.' });
      }

      // Reembolso vía API de Mercado Pago si existe el ID de pago de la garantía
      if (booking.mpDepositPaymentId && isMpConfigured) {
        try {
          const refundResp = await fetch(`https://api.mercadopago.com/v1/payments/${booking.mpDepositPaymentId}/refunds`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
          });
          if (!refundResp.ok) {
            const errTxt = await refundResp.text();
            console.warn('Advertencia al solicitar reembolso en MP:', errTxt);
          }
        } catch (mpErr: any) {
          console.error('Error llamando a API de reembolso de MP:', mpErr);
        }
      }

      await bookingRef.update({
        depositStatus: 'devuelto_a_cliente',
        depositRefundedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return res.json({
        success: true,
        message: 'Depósito de garantía reembolsado exitosamente al cliente.',
      });
    } catch (err: any) {
      console.error('Error en /api/rentals/refund-deposit:', err);
      return res.status(500).json({ error: err.message || 'Error al procesar el reembolso de la garantía.' });
    }
  });

  // 1. Confirmar devolución del bien: liquida el alquiler al dueño y reintegra la caución al cliente
  // Cierra un alquiler devuelto conforme: reintegra garantía (menos mora), acredita al dueño y emite cupones.
  // Es atómico: si dos pedidos llegan juntos, solo uno liquida.
  async function settleReturn(bookingId: string) {
    const bookingRef = adminDb.collection('rental_bookings').doc(bookingId);
    const now = new Date();

    const claimed = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(bookingRef);
      if (!snap.exists) throw Object.assign(new Error('Reserva no encontrada.'), { status: 404 });
      const b = snap.data() as any;
      if (b.paymentStatus === 'liquidado_a_dueno') return null;
      if (b.paymentStatus !== 'pagado') {
        throw Object.assign(new Error('La reserva todavía no figura como pagada. No se puede cerrar.'), { status: 400 });
      }

      // Mora: 150% del precio diario por día de atraso, hasta el momento de la devolución
      const returnedAt = b.devolucion?.clientSignedAt || b.devolucion?.submittedAt || now.toISOString();
      const depositPaid = b.depositStatus === 'en_custodia' ? (Number(b.depositAmount) || 0) : 0;
      let lateFee = 0;
      if (b.endDate) {
        const daysLate = Math.floor((new Date(returnedAt).getTime() - new Date(`${b.endDate}T23:59:59`).getTime()) / 86400000) + 1;
        if (daysLate > 0) {
          const daily = Number(b.dailyPrice) || (Number(b.rentalSubtotal) || 0) / Math.max(1, Number(b.totalDays) || 1);
          lateFee = Math.round(daily * 1.5 * daysLate);
        }
      }
      const lateFeeRetained = Math.min(lateFee, depositPaid);
      const depositRefund = depositPaid - lateFeeRetained;

      tx.update(bookingRef, {
        status: 'devuelto',
        paymentStatus: 'liquidado_a_dueno',
        depositStatus: lateFeeRetained > 0 && depositRefund === 0 ? 'retenido_por_dano' : 'devuelto_a_cliente',
        lateFeeRetained,
        depositRefunded: depositRefund,
        closedAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
      return { b, lateFeeRetained, depositRefund };
    });

    if (!claimed) return { already: true, vouchers: [] as any[] };
    const { b, lateFeeRetained, depositRefund } = claimed;

    // Reintegro de la garantía (pagada a la cuenta de la plataforma)
    if (b.mpDepositPaymentId && isMpConfigured && depositRefund > 0) {
      try {
        await fetch(`https://api.mercadopago.com/v1/payments/${b.mpDepositPaymentId}/refunds`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `refund-${bookingId}`,
          },
          body: JSON.stringify(lateFeeRetained > 0 ? { amount: depositRefund } : {}),
        });
      } catch (refundErr) {
        console.warn('Error en reembolso MP:', refundErr);
      }
    }

    const ownerId = b.ownerUid || b.ownerId;
    const ownerNetAmount = Number(b.ownerNetAmount) || 0;
    if (ownerId) {
      const ownerRef = adminDb.collection('rental_owners').doc(ownerId);
      const ownerSnap = await ownerRef.get();
      if (ownerSnap.exists) {
        await ownerRef.update(
          b.paidDirectToOwner
            ? {
                walletBalance: FieldValue.increment(lateFeeRetained),
                totalEarned: FieldValue.increment(ownerNetAmount + lateFeeRetained),
              }
            : {
                walletBalance: FieldValue.increment(ownerNetAmount + lateFeeRetained),
                pendingBalance: FieldValue.increment(-ownerNetAmount),
                totalEarned: FieldValue.increment(ownerNetAmount + lateFeeRetained),
              }
        );
      }
    }

    const vouchers = await issueBruzzoneVouchers(bookingId, b);
    return { already: false, vouchers, lateFeeRetained, depositRefund };
  }

  app.post('/api/rentals/confirm-return', authenticateFirebaseUser, async (req, res) => {
    try {
      const { bookingId } = req.body;
      const user = (req as any).user;
      if (!bookingId) return res.status(400).json({ error: 'Falta el bookingId de la reserva.' });

      const snap = await adminDb.collection('rental_bookings').doc(bookingId).get();
      if (!snap.exists) return res.status(404).json({ error: 'Reserva no encontrada.' });
      const booking = snap.data() as any;

      const isOwner = user.uid === booking.ownerUid || user.uid === booking.ownerId;
      if (!isOwner && !isUserAdmin(user)) {
        return res.status(403).json({ error: 'No tienes permisos para confirmar la devolución de este bien.' });
      }

      const result = await settleReturn(bookingId);
      return res.json({
        success: true,
        message: result.already
          ? 'La reserva ya fue liquidada previamente.'
          : 'Devolución confirmada con éxito. Caución reintegrada y saldo liquidado al locador.',
        vouchers: result.vouchers,
      });
    } catch (err: any) {
      console.error('Error en /api/rentals/confirm-return:', err);
      return res.status(err.status || 500).json({ error: err.message || 'Error del servidor al confirmar devolución.' });
    }
  });

  // =========================================================================
  // ACTAS DE ENTREGA Y DEVOLUCIÓN (conformidad de ambas partes, con fotos)
  //  entrega:    la carga el dueño  -> firma el inquilino  -> status en_curso
  //  devolucion: la carga el inquilino (o el dueño) -> el dueño firma conforme
  //              -> se liquida (garantía, saldo, cupones) o se reporta daño
  // Fotos: subcolección rental_bookings/{id}/evidencias (JPEG/WebP comprimido)
  // =========================================================================
  const CHECK_KEYS = ['funciona', 'accesorios', 'estetica', 'limpio'] as const;
  const MAX_PHOTO_CHARS = 450_000; // ~330 KB de imagen

  function cleanChecklist(raw: any) {
    const out: Record<string, boolean> = {};
    for (const k of CHECK_KEYS) out[k] = Boolean(raw?.[k]);
    return out;
  }

  app.post('/api/rentals/acta', authenticateFirebaseUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { bookingId, stage, checklist, notes = '', photos = [] } = req.body || {};
      if (!bookingId || (stage !== 'entrega' && stage !== 'devolucion')) {
        return res.status(400).json({ error: 'Datos del acta incompletos.' });
      }
      if (!Array.isArray(photos) || photos.length < 2 || photos.length > 4) {
        return res.status(400).json({ error: 'Subí entre 2 y 4 fotos del producto.' });
      }
      for (const ph of photos) {
        if (typeof ph !== 'string' || !/^data:image\/(jpeg|jpg|webp|png);base64,/.test(ph) || ph.length > MAX_PHOTO_CHARS) {
          return res.status(400).json({ error: 'Alguna foto no es válida o es demasiado pesada.' });
        }
      }

      const bookingRef = adminDb.collection('rental_bookings').doc(bookingId);
      const snap = await bookingRef.get();
      if (!snap.exists) return res.status(404).json({ error: 'Reserva no encontrada.' });
      const b = snap.data() as any;
      const isOwner = user.uid === b.ownerUid || user.uid === b.ownerId;
      const isClient = user.uid === b.clientUid;
      if (!isOwner && !isClient && !isUserAdmin(user)) {
        return res.status(403).json({ error: 'No sos parte de este alquiler.' });
      }
      if (b.paymentStatus !== 'pagado') {
        return res.status(400).json({ error: 'El alquiler todavía no está pagado.' });
      }

      if (stage === 'entrega') {
        if (!isOwner && !isUserAdmin(user)) return res.status(403).json({ error: 'El acta de entrega la completa el dueño.' });
        if (!['confirmado', 'entrega_pendiente'].includes(b.status)) {
          return res.status(400).json({ error: 'Esta reserva ya no está en etapa de entrega.' });
        }
        if (b.entrega?.clientSignedAt) return res.status(400).json({ error: 'La entrega ya fue firmada por ambas partes.' });
      } else {
        if (!['en_curso', 'devolucion_pendiente', 'entrega_pendiente', 'confirmado'].includes(b.status)) {
          return res.status(400).json({ error: 'Esta reserva no está en etapa de devolución.' });
        }
        if (b.devolucion?.ownerSignedAt) return res.status(400).json({ error: 'La devolución ya fue cerrada.' });
      }

      const now = new Date().toISOString();
      const role = isOwner ? 'dueño' : isClient ? 'inquilino' : 'admin';
      const evid = bookingRef.collection('evidencias');
      const photoIds: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const id = `${stage}-${Date.now()}-${i}`;
        await evid.doc(id).set({ id, stage, dataUrl: photos[i], uploadedBy: user.uid, role, at: now });
        photoIds.push(id);
      }

      const acta: any = {
        checklist: cleanChecklist(checklist),
        notes: String(notes).slice(0, 1000),
        photoIds,
        submittedBy: role,
        submittedByUid: user.uid,
        submittedAt: now,
      };
      if (role === 'dueño' || role === 'admin') acta.ownerSignedAt = now;
      if (role === 'inquilino') acta.clientSignedAt = now;

      const patch: any = { [stage]: acta, updatedAt: now };
      if (stage === 'entrega') patch.status = 'entrega_pendiente';
      if (stage === 'devolucion') patch.status = 'devolucion_pendiente';
      await bookingRef.update(patch);

      return res.json({ success: true, acta });
    } catch (err: any) {
      console.error('Error en /api/rentals/acta:', err);
      return res.status(500).json({ error: err.message || 'Error al guardar el acta.' });
    }
  });

  // Firma de conformidad de la otra parte
  app.post('/api/rentals/acta/firmar', authenticateFirebaseUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { bookingId, stage, observations = '' } = req.body || {};
      if (!bookingId || (stage !== 'entrega' && stage !== 'devolucion')) {
        return res.status(400).json({ error: 'Datos incompletos.' });
      }
      const bookingRef = adminDb.collection('rental_bookings').doc(bookingId);
      const snap = await bookingRef.get();
      if (!snap.exists) return res.status(404).json({ error: 'Reserva no encontrada.' });
      const b = snap.data() as any;
      const isOwner = user.uid === b.ownerUid || user.uid === b.ownerId;
      const isClient = user.uid === b.clientUid;
      const acta = b[stage];
      if (!acta) return res.status(400).json({ error: 'Todavía no se cargó el acta.' });
      const now = new Date().toISOString();
      const obs = String(observations).slice(0, 1000);

      if (stage === 'entrega') {
        if (!isClient) return res.status(403).json({ error: 'La entrega la firma el inquilino.' });
        if (acta.clientSignedAt) return res.json({ success: true, already: true });
        await bookingRef.update({
          'entrega.clientSignedAt': now,
          'entrega.clientObservations': obs,
          status: 'en_curso',
          updatedAt: now,
        });
        return res.json({ success: true, status: 'en_curso' });
      }

      // devolución
      if (isClient) {
        if (acta.clientSignedAt) return res.json({ success: true, already: true });
        await bookingRef.update({ 'devolucion.clientSignedAt': now, 'devolucion.clientObservations': obs, updatedAt: now });
        return res.json({ success: true });
      }
      if (!isOwner && !isUserAdmin(user)) return res.status(403).json({ error: 'No sos parte de este alquiler.' });
      await bookingRef.update({ 'devolucion.ownerSignedAt': now, 'devolucion.ownerObservations': obs, updatedAt: now });
      const result = await settleReturn(bookingId);
      return res.json({ success: true, status: 'devuelto', vouchers: result.vouchers, lateFeeRetained: (result as any).lateFeeRetained || 0 });
    } catch (err: any) {
      console.error('Error en /api/rentals/acta/firmar:', err);
      return res.status(err.status || 500).json({ error: err.message || 'Error al firmar el acta.' });
    }
  });

  // 2. Reportar daño y retener garantía: acredita garantía + alquiler al locador
  app.post('/api/rentals/report-damage', authenticateFirebaseUser, async (req, res) => {
    try {
      const { bookingId, damageReport } = req.body;
      const user = (req as any).user;

      if (!bookingId || !damageReport) {
        return res.status(400).json({ error: 'Faltan datos requeridos (bookingId, damageReport).' });
      }

      const bookingRef = adminDb.collection('rental_bookings').doc(bookingId);
      const bookingSnap = await bookingRef.get();

      if (!bookingSnap.exists) {
        return res.status(404).json({ error: 'Reserva no encontrada.' });
      }

      const booking = bookingSnap.data() as any;
      const isOwner = user.uid === booking.ownerUid || user.uid === booking.ownerId;
      const isAdminUser = isUserAdmin(user);

      if (!isOwner && !isAdminUser) {
        return res.status(403).json({ error: 'No tienes permisos para registrar daño en este alquiler.' });
      }

      const ownerId = booking.ownerUid || booking.ownerId || user.uid;
      const ownerNetAmount = Number(booking.ownerNetAmount) || 0;
      if (booking.paymentStatus === 'liquidado_a_dueno') {
        return res.json({ success: true, message: 'La reserva ya fue cerrada previamente.' });
      }
      if (booking.paymentStatus !== 'pagado') {
        return res.status(400).json({ error: 'La reserva todavía no figura como pagada.' });
      }
      const depositPaid = booking.depositStatus === 'en_custodia' ? (Number(booking.depositAmount) || 0) : 0;
      const requested = Number(damageReport.depositRetained);
      const depositRetained = Math.max(0, Math.min(depositPaid, Number.isFinite(requested) && requested > 0 ? requested : depositPaid));

      // Actualizar reserva
      await bookingRef.update({
        status: 'devuelto',
        paymentStatus: 'liquidado_a_dueno',
        depositStatus: 'retenido_por_dano',
        damageReport: {
          ...damageReport,
          reportedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      });

      // Acreditar alquiler + caución retenida al locador
      const ownerRef = adminDb.collection('rental_owners').doc(ownerId);
      const ownerSnap = await ownerRef.get();

      if (ownerSnap.exists) {
        await ownerRef.update(
          booking.paidDirectToOwner
            ? {
                walletBalance: FieldValue.increment(depositRetained),
                totalEarned: FieldValue.increment(ownerNetAmount + depositRetained),
              }
            : {
                walletBalance: FieldValue.increment(ownerNetAmount + depositRetained),
                pendingBalance: FieldValue.increment(-ownerNetAmount),
                totalEarned: FieldValue.increment(ownerNetAmount + depositRetained),
              }
        );
      }

      return res.json({
        success: true,
        message: 'Garantía retenida por daño y acreditada a tu billetera disponible.',
      });
    } catch (err: any) {
      console.error('Error en /api/rentals/report-damage:', err);
      return res.status(500).json({ error: err.message || 'Error al reportar daño.' });
    }
  });

  // 3. Solicitar retiro de fondos a CBU/Alias
  app.post('/api/rentals/request-payout', authenticateFirebaseUser, async (req, res) => {
    try {
      const { amount, cbuOrAlias, bankOrMp, ownerName, ownerPhone } = req.body;
      const user = (req as any).user;

      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ error: 'Monto a retirar inválido.' });
      }

      if (!cbuOrAlias) {
        return res.status(400).json({ error: 'Se requiere CBU/CVU o Alias para transferir.' });
      }

      const ownerRef = adminDb.collection('rental_owners').doc(user.uid);
      const ownerSnap = await ownerRef.get();

      if (ownerSnap.exists) {
        const ownerData = ownerSnap.data() as any;
        const currentBalance = Number(ownerData.walletBalance) || 0;

        if (currentBalance < numAmount) {
          return res.status(400).json({
            error: `Saldo disponible insuficiente ($${currentBalance.toLocaleString('es-AR')}) para retirar $${numAmount.toLocaleString('es-AR')}.`,
          });
        }

        // Deducir del saldo disponible
        await ownerRef.update({
          walletBalance: FieldValue.increment(-numAmount),
        });
      }

      const payoutId = `payout-${Date.now()}`;
      const payoutDoc = {
        id: payoutId,
        ownerId: user.uid,
        ownerUid: user.uid,
        ownerName: ownerName || user.email || 'Locador',
        ownerPhone: ownerPhone || '',
        cbuOrAlias,
        bankOrMp: bankOrMp || 'Mercado Pago',
        amount: numAmount,
        status: 'pendiente',
        requestedAt: new Date().toISOString(),
      };

      await adminDb.collection('rental_payouts').doc(payoutId).set(payoutDoc);

      return res.json({
        success: true,
        payoutId,
        message: 'Solicitud de retiro registrada en el servidor con éxito.',
      });
    } catch (err: any) {
      console.error('Error en /api/rentals/request-payout:', err);
      return res.status(500).json({ error: err.message || 'Error al procesar solicitud de retiro.' });
    }
  });

  // 4. Procesar o liquidar pago de retiro (Solo Administrador)
  app.post('/api/rentals/process-payout', authenticateFirebaseUser, async (req, res) => {
    try {
      const { payoutId, status, notes } = req.body;
      const user = (req as any).user;

      if (!isUserAdmin(user)) {
        return res.status(403).json({ error: 'Solo el administrador central puede procesar retiros.' });
      }

      if (!payoutId || !['transferido', 'rechazado', 'procesando'].includes(status)) {
        return res.status(400).json({ error: 'Parámetros inválidos.' });
      }

      const payoutRef = adminDb.collection('rental_payouts').doc(payoutId);
      const payoutSnap = await payoutRef.get();

      if (!payoutSnap.exists) {
        return res.status(404).json({ error: 'Solicitud de retiro no encontrada.' });
      }

      const payoutData = payoutSnap.data() as any;

      // Si se rechaza, restituir el monto a la billetera del propietario
      if (status === 'rechazado' && payoutData.status !== 'rechazado') {
        const ownerRef = adminDb.collection('rental_owners').doc(payoutData.ownerUid || payoutData.ownerId);
        const ownerSnap = await ownerRef.get();
        if (ownerSnap.exists) {
          await ownerRef.update({
            walletBalance: FieldValue.increment(payoutData.amount),
          });
        }
      }

      await payoutRef.update({
        status,
        processedAt: new Date().toISOString(),
        notes: notes || '',
      });

      return res.json({
        success: true,
        message: `Retiro actualizado a estado: ${status}`,
      });
    } catch (err: any) {
      console.error('Error en /api/rentals/process-payout:', err);
      return res.status(500).json({ error: err.message || 'Error al procesar el retiro.' });
    }
  });

  // =========================================================================
  // CONVENIO FERRETERÍA BRUZZONE: cupones al cerrar un negocio
  // Configurable en app_config/bruzzone_convenio { active, percent, validDays, minSpend }
  // =========================================================================
  async function getConvenioConfig() {
    const defaults = { active: true, percent: 10, validDays: 30, minSpend: 0 };
    try {
      const snap = await adminDb.collection('app_config').doc('bruzzone_convenio').get();
      return { ...defaults, ...(snap.exists ? snap.data() : {}) } as typeof defaults;
    } catch {
      return defaults;
    }
  }

  function newVoucherCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = crypto.randomBytes(6);
    let out = '';
    for (const b of bytes) out += alphabet[b % alphabet.length];
    return `BRZ-${out}`;
  }

  async function issueBruzzoneVouchers(bookingId: string, booking: any) {
    const cfg = await getConvenioConfig();
    if (!cfg.active) return [];
    const now = new Date();
    const expires = new Date(now.getTime() + Number(cfg.validDays || 30) * 86400000);
    const recipients = [
      { role: 'inquilino', uid: booking.clientUid, name: booking.clientName, phone: booking.clientPhone },
      { role: 'dueño', uid: booking.ownerUid || booking.ownerId, name: booking.ownerName, phone: booking.ownerPhone },
    ].filter((r) => r.uid);
    const issued: any[] = [];
    for (const r of recipients) {
      const id = `rental-${bookingId}-${r.role === 'dueño' ? 'owner' : 'client'}`;
      const ref = adminDb.collection('issued_vouchers').doc(id);
      const existing = await ref.get();
      if (existing.exists) { issued.push(existing.data()); continue; }
      const voucher = {
        id,
        voucherCode: newVoucherCode(),
        couponId: 'convenio-bruzzone-alquiler',
        couponTitle: `${cfg.percent}% OFF en Ferretería Bruzzone`,
        discountText: `${cfg.percent}% OFF`,
        targetShopName: 'Ferretería Bruzzone',
        source: 'rental',
        bookingId,
        workerId: 'servigo-alquiler',
        workerName: 'ServiGo Alquiler',
        workerTrade: `Alquiler (${r.role})`,
        clientId: r.uid,
        clientName: r.name || '',
        clientPhone: r.phone || '',
        minSpend: Number(cfg.minSpend) || 0,
        issuedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        status: 'active',
      };
      await ref.set(voucher);
      issued.push(voucher);
    }
    return issued;
  }

  // Mostrador de la ferretería: consultar y canjear cupones (solo el creador)
  app.post('/api/vouchers/check', authenticateFirebaseUser, async (req, res) => {
    if (!isUserAdmin((req as any).user)) return res.status(403).json({ error: 'Solo el creador puede validar cupones.' });
    const code = String(req.body?.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Falta el código.' });
    const q = await adminDb.collection('issued_vouchers').where('voucherCode', '==', code).limit(1).get();
    if (q.empty) return res.status(404).json({ error: 'Cupón inexistente.' });
    const v = q.docs[0].data() as any;
    const expired = v.expiresAt && new Date(v.expiresAt) < new Date();
    return res.json({ voucher: v, valid: v.status === 'active' && !expired, expired });
  });

  app.post('/api/vouchers/redeem', authenticateFirebaseUser, async (req, res) => {
    if (!isUserAdmin((req as any).user)) return res.status(403).json({ error: 'Solo el creador puede canjear cupones.' });
    const code = String(req.body?.code || '').trim().toUpperCase();
    const purchaseAmount = Number(req.body?.purchaseAmount) || 0;
    const q = await adminDb.collection('issued_vouchers').where('voucherCode', '==', code).limit(1).get();
    if (q.empty) return res.status(404).json({ error: 'Cupón inexistente.' });
    const ref = q.docs[0].ref;
    try {
      const result = await adminDb.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const v = snap.data() as any;
        if (v.status !== 'active') throw new Error('El cupón ya fue usado.');
        if (v.expiresAt && new Date(v.expiresAt) < new Date()) throw new Error('El cupón está vencido.');
        const patch = {
          status: 'redeemed',
          redeemedAt: new Date().toISOString(),
          redeemedByShop: 'Ferretería Bruzzone',
          purchaseAmount,
        };
        tx.update(ref, patch);
        return { ...v, ...patch };
      });
      return res.json({ success: true, voucher: result });
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  });

  // =========================================================================
  // TAREA DIARIA (Vercel Cron): atrasos de devolución
  // Vercel la llama 1 vez por día con "Authorization: Bearer <CRON_SECRET>".
  // =========================================================================
  app.get('/api/cron/daily', async (req, res) => {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
      return res.sendStatus(401);
    }
    try {
      const LATE_FEE_FACTOR = 1.5;   // 150% de la tarifa diaria por día de atraso
      const NOT_RETURNED_DAYS = 5;   // a los 5 días sin devolver: no devuelto
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const snap = await adminDb.collection('rental_bookings')
        .where('status', 'in', ['confirmado', 'entrega_pendiente', 'en_curso']).get();

      let updated = 0;
      for (const doc of snap.docs) {
        const b = doc.data() as any;
        if (!b.endDate || b.endDate >= today) continue;
        const daysLate = Math.floor((now.getTime() - new Date(`${b.endDate}T23:59:59`).getTime()) / 86400000) + 1;
        if (daysLate <= 0) continue;

        const daily = Number(b.dailyPrice) || (Number(b.rentalSubtotal) || 0) / Math.max(1, Number(b.totalDays) || 1);
        const lateFee = Math.round(daily * LATE_FEE_FACTOR * daysLate);
        const patch: any = {
          isOverdue: true,
          daysLate,
          lateFeeAccrued: lateFee,
          lateFeeCoveredByDeposit: Math.min(lateFee, Number(b.depositAmount) || 0),
          overdueCheckedAt: now.toISOString(),
        };

        if (daysLate >= NOT_RETURNED_DAYS && !b.notReturnedAt) {
          patch.notReturnedAt = now.toISOString();
          patch.depositStatus = 'retenido_por_dano';
          patch.damageReport = {
            ...(b.damageReport || {}),
            type: 'extravio_no_devuelto',
            reportedAt: now.toISOString(),
            depositRetained: Number(b.depositAmount) || 0,
            description: `No devuelto: ${daysLate} días de atraso.`,
          };
          const clientUid = b.clientUid || b.createdBy;
          if (clientUid) {
            await adminDb.collection('users').doc(clientUid).set(
              { blocked: true, blockedReason: `Alquiler ${doc.id} no devuelto`, blockedAt: now.toISOString() },
              { merge: true }
            );
          }
        }

        await doc.ref.update(patch);
        updated++;
      }
      return res.json({ ok: true, checked: snap.size, updated });
    } catch (err: any) {
      console.error('Error en cron diario:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'ServiGo - Ferretería Bruzzone' });
  });

  return app;
}
