import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Static multi-page site: each public page is an explicit production entry.
// React is used only for the interactive island on equipo.html.
//
// INFECTUS es una sola marca. Vaccine, Lab y Research son unidades de negocio de
// un mismo Modelo de Gestión Integral y se presentan juntas en
// modelo-de-negocio.html. Las antiguas páginas vaccine.html, research.html y
// labs.html quedan fuera de producción y sin enlaces públicos; su eliminación
// física se hará cuando exista un baseline en Git.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'acerca-de.html'),
        model: resolve(__dirname, 'modelo-de-negocio.html'),
        services: resolve(__dirname, 'servicios.html'),
        team: resolve(__dirname, 'equipo.html'),
        blog: resolve(__dirname, 'blog.html'),
        contact: resolve(__dirname, 'contacto.html'),
        designSystem: resolve(__dirname, 'design-system.html'),
      },
    },
  },
});
