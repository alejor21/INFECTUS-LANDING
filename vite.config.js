import { defineConfig } from 'vite';
import { basename, resolve } from 'node:path';
import { seoTags, sitemap } from './scripts/seo.js';

// Dominio público (sin barra final) para canonical, Open Graph y sitemap.
// Por defecto, el dominio de producción; SITE_URL lo reemplaza (p. ej. un túnel).
const SITE_URL = (process.env.SITE_URL || 'https://infectus.com.co').replace(/\/$/, '');

const WHATSAPP_CTA = `<a class="float-contact" href="https://wa.me/573216456132?text=${encodeURIComponent('Hola, quisiera información sobre los servicios de INFECTUS.')}" target="_blank" rel="noopener" data-float-contact><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z"/></svg><span>Escríbenos<span class="visually-hidden"> por WhatsApp (se abre en una pestaña nueva)</span></span></a>`;

// Inyecta las metaetiquetas de SEO de cada página y genera robots.txt y,
// si hay dominio, sitemap.xml.
const seo = () => ({
  name: 'infectus-seo',
  transformIndexHtml: {
    order: 'pre',
    handler(html, { filename }) {
      const { tags, title, description } = seoTags(basename(filename), SITE_URL);
      const file = basename(filename);
      let out = html;
      // Conexión anticipada con el proveedor de la tipografía (mejora LCP).
      out = out.replace('<link href="https://api.fontshare.com', '<link rel="preconnect" href="https://api.fontshare.com" crossorigin><link rel="preconnect" href="https://cdn.fontshare.com" crossorigin><link href="https://api.fontshare.com');
      // Acceso directo a WhatsApp en todas las páginas salvo Contacto.
      if (!['contacto.html', '404.html', 'design-system.html'].includes(file)) out = out.replace('</body>', `${WHATSAPP_CTA}
</body>`);
      if (title) out = out.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
      if (description) out = out.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`);
      return out.replace('</head>', `  ${tags}\n</head>`);
    },
  },
  generateBundle() {
    // Buscadores y asistentes de IA (OAI-SearchBot, etc.) pueden rastrear el
    // sitio para recomendarlo; solo se excluye la página interna de diseño.
    const robots = ['User-agent: *', 'Allow: /', '', 'User-agent: OAI-SearchBot', 'Allow: /'];
    if (SITE_URL) {
      robots.push(`Sitemap: ${SITE_URL}/sitemap.xml`);
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(SITE_URL) });
    }
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` });
  },
});

// Static multi-page site: each public page is an explicit production entry.
// design-system.html es una referencia interna: no se publica.
// Vaccine, Labs y Research se presentan juntas en modelo-de-negocio.html.
export default defineConfig({
  plugins: [seo()],
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
        notFound: resolve(__dirname, '404.html'),
      },
    },
  },
  // Permite compartir la vista previa con un túnel temporal de Cloudflare.
  preview: {
    allowedHosts: ['.trycloudflare.com'],
  },
});
