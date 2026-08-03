# ServiGo - Red de Servicios y Profesionales del Hogar 🛠️

ServiGo es una plataforma web y móvil para la búsqueda rápida, presupuesto y contratación de profesionales independientes (Gasistas Matriculados, Electricistas, Plomeros, Pintores, Cerrajeros, Técnicos en Aire Acondicionado, etc.).

La aplicación incluye:
- ☁️ **Persistencia en la Nube con Google Firebase Firestore**: Todos los perfiles de trabajadores registrados, calificaciones/reseñas y solicitudes de servicio se guardan de forma persistente y sincronizan en tiempo real.
- 🤖 **Diagnóstico Inteligente con Gemini AI**: Evaluación automatizada de fallas para guiar al usuario hacia el rubro correcto y recomendar materiales.
- 🏪 **Auspicio Oficial de Ferretería Bruzzone**: Catálogo de insumos con descuentos en mano de obra.
- 📲 **Coordinación Inmediata por WhatsApp**: Envío automático de solicitudes de turno.

---

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript**
- **Vite** + **Express**
- **Tailwind CSS v4**
- **Google Firebase Firestore**
- **Lucide React Icons**

---

## 🚀 Pasos para Subir el Código a GitHub

Para subir este proyecto a tu cuenta de GitHub desde tu terminal local:

1. **Inicializa el repositorio Git** (si aún no lo está):
   ```bash
   git init
   ```

2. **Agrega todos los archivos al repositorio**:
   ```bash
   git add .
   ```

3. **Crea tu primer commit**:
   ```bash
   git commit -m "feat: proyecto ServiGo completo con Firebase Firestore y GitHub listo"
   ```

4. **Conecta tu repositorio de GitHub**:
   Crea un nuevo repositorio en GitHub (por ejemplo `servigo-app`) y ejecuta:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/servigo-app.git
   ```

5. **Sube los cambios a GitHub**:
   ```bash
   git push -u origin main
   ```

---

## 💻 Pasos para Ejecutar Localmente

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/TU_USUARIO/servigo-app.git
   cd servigo-app
   ```

2. **Instalar las dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```

4. **Compilar para producción**:
   ```bash
   npm run build
   npm start
   ```

---

## ☁️ Configuración de Firebase Firestore en la Nube

El proyecto ya cuenta con las credenciales de Firebase y las reglas de seguridad de Firestore configuradas en `firebase-applet-config.json` y `firestore.rules`. Los datos ingresados se guardan automáticamente en la nube.
