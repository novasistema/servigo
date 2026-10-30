# ServiGo en Vercel

## Qué cambió
- `server/app.ts`: el servidor (pagos, billeteras, Gemini) ahora es una app reutilizable.
- `api/index.ts`: función de Vercel que atiende todas las rutas `/api/*`.
- `server.ts`: queda para correr local o en AI Studio / Cloud Run.
- `vercel.json`: rutas, función y tarea diaria (`/api/cron/daily`, 9:00 hora Argentina).
- Webhook de Mercado Pago: rechaza firmas inválidas (401), verifica el monto y no acredita dos veces el mismo pago.
- Vinculación de Mercado Pago del dueño: el "state" va firmado (nadie puede conectar su cuenta de MP al perfil de otro).
- Tarea diaria: marca alquileres atrasados, calcula mora del 150% diario, y a los 5 días retiene la garantía y bloquea al inquilino.
- Un usuario bloqueado no puede reservar, y no puede sacarse el bloqueo (reglas de Firestore).

## Variables de entorno (Vercel > proyecto > Settings > Environment Variables)
| Variable | De dónde sale |
|---|---|
| FIREBASE_SERVICE_ACCOUNT | Firebase > Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada. Abrí el .json y pegá TODO el contenido como valor. |
| GEMINI_API_KEY | aistudio.google.com > Get API key |
| MP_ACCESS_TOKEN | Mercado Pago Developers > tu aplicación > Credenciales |
| MP_CLIENT_ID | ídem |
| MP_CLIENT_SECRET | ídem |
| MP_WEBHOOK_SECRET | Mercado Pago Developers > tu aplicación > Webhooks |
| APP_URL | https://servigo-omega.vercel.app |
| CRON_SECRET | Inventá una clave larga cualquiera (ej. 40 letras y números) |

Después de cargarlas, volvé a publicar: `vercel --prod`

## Reglas de Firestore (importante)
Vercel no sube las reglas. Copiá el contenido de `firestore.rules` en:
Firebase > Firestore Database > (elegí la base `ai-studio-remixservigodeli-...`) > Reglas > pegar > Publicar.

## Mercado Pago
- Webhook: `https://servigo-omega.vercel.app/api/mp/webhook`, evento "Pagos".
- Redirect URL de OAuth de la aplicación: `https://servigo-omega.vercel.app/api/mp/oauth/callback`

## Firebase Authentication
Agregá `servigo-omega.vercel.app` en Authentication > Configuración > Dominios autorizados.
