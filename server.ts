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
        model: 'gemini-3.6-flash',
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
      console.error('Error en diagnóstico Gemini:', error);
      return res.status(500).json({
        error: error.message || 'Error al procesar el diagnóstico con IA',
      });
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
