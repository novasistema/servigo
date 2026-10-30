// Datos públicos del proyecto Firebase (los mismos de firebase-applet-config.json).
// Se copian acá para que el servidor no dependa de leer archivos en Vercel.
export const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0721502809',
  firestoreDatabaseId:
    process.env.FIRESTORE_DATABASE_ID ||
    'ai-studio-remixservigodeli-bb5011ec-7bca-4420-9bf1-8abb60f667ba',
};
