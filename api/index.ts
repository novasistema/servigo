// Función serverless de Vercel: atiende todas las rutas /api/*
import { createApp } from '../server/app.js';

const app = createApp();

export default app;
