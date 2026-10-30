import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'ServiGo - Ferretería Bruzzone' });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ServiGo corriendo en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error iniciando el servidor:', err);
});
