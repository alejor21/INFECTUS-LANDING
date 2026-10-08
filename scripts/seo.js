// SEO centralizado: título, descripción, Open Graph, Twitter y datos
// estructurados por página. Con SITE_URL (p. ej. SITE_URL=https://dominio.co
// npm run build) se añaden canonical, og:url, imágenes absolutas y sitemap.xml.
const SITE_NAME = 'INFECTUS';
const PHONE = '+573216456132';
const EMAIL = 'infectuspasto@gmail.com';

export const pages = {
  'index.html': {
    title: 'INFECTUS | Infectología y control de infecciones en Pasto',
    description: 'Excelencia clínica, instituciones seguras. Programas PROA, Prevención y Control de Infecciones (PCI), consulta por infectología y vacunación para IPS en Pasto, Colombia.',
    priority: '1.0',
  },
  'servicios.html': {
    title: 'Servicios de infectología, PROA, PCI y vacunación en Pasto | INFECTUS',
    description: 'Asesoría integral para IPS de cualquier nivel de atención: PROA, PCI e IAAS, Comité de Infecciones, higiene de manos, peritajes, epidemiología territorial, formación, consulta y vacunación.',
    priority: '0.9',
  },
  'acerca-de.html': {
    title: 'Nosotros: misión, visión e historia | INFECTUS',
    description: 'Empresa líder en el manejo de enfermedades infecciosas y uso racional de antimicrobianos. Conozca nuestra misión, visión, historia, principios y políticas institucionales.',
    priority: '0.7',
  },
  'modelo-de-negocio.html': {
    title: 'Modelo de Gestión Integral en Salud: Vaccine, Labs y Research | INFECTUS',
    description: 'Un ecosistema que articula tres pilares: prevenir con INFECTUS Vaccine, diagnosticar con INFECTUS Labs y generar evidencia científica con INFECTUS Research.',
    priority: '0.7',
  },
  'equipo.html': {
    title: 'Nuestro equipo: infectología, epidemiología y PROA | INFECTUS',
    description: 'Infectólogo, epidemiólogas, médicos PROA, enfermería en IAAS y microbiología clínica: el equipo de INFECTUS al servicio de las instituciones de salud.',
    priority: '0.6',
  },
  'blog.html': {
    title: 'Actualidad en enfermedades infecciosas | INFECTUS',
    description: 'Fuentes oficiales del INS, MinSalud y la OMS sobre vigilancia, vacunación, resistencia antimicrobiana e higiene de manos para equipos de salud.',
    priority: '0.5',
  },
  'contacto.html': {
    title: 'Contacto: solicite asesoría en Pasto | INFECTUS',
    description: 'Escríbanos por WhatsApp, correo o teléfono (+57 321 645 61 32). Carrera 41 # 12A-11, Villa San Rafael, Pasto, Nariño. Asesoría en PROA, control de infecciones, infectología y vacunación.',
    priority: '0.8',
  },
  'design-system.html': { noindex: true },
  '404.html': { noindex: true },
};

const esc = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const SERVICES = ["Implementación de Programas de uso racional de antimicrobianos PROA", "Prevención y Control de Infecciones (PCI) e IAAS", "Comité de Infecciones", "Estrategia multimodal de higiene de manos", "Peritajes médicos y auditoría en Infectología", "Consultoría en Salud Pública y Epidemiología Territorial", "Fortalecimiento de capacidades del talento humano", "Diseño e implementación de Guías de Práctica Clínica", "Consulta y valoración por Infectología", "Vacunación"];
const TEAM = [
  ['David A. Forero Peña', 'Gerente'],
  ['Paola Tulcán Moncayo', 'Subgerente de Servicios de Salud'],
  ['Natalia S. Gallego Eraso', 'Subgerente de Gestión Integral de Salud'],
  ['Magda A. Forero Peña', 'Médico Epidemióloga'],
  ['Angélica María Ojeda Enríquez', 'Médica PROA'],
  ['Daniel Felipe López Herrera', 'Médico PROA'],
  ['Natasha Andreina Camejo Ávila', 'Referente de Microbiología Clínica'],
];

const ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Carrera 41 # 12A-11, Villa San Rafael',
  addressLocality: 'Pasto',
  addressRegion: 'Nariño',
  addressCountry: 'CO',
};
const MAPS = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Carrera 41 # 12A-11, Villa San Rafael, Pasto, Nariño, Colombia');

// Nombre visible de cada página para las migas de pan.
const LABELS = {
  'acerca-de.html': 'Nosotros',
  'modelo-de-negocio.html': 'Nuestro modelo',
  'servicios.html': 'Servicios',
  'equipo.html': 'Nuestro equipo',
  'blog.html': 'Actualidad',
  'contacto.html': 'Contacto',
};

// Cloudflare Pages sirve las páginas sin «.html» (y redirige la versión con
// extensión), así que canonical, og:url y sitemap usan la URL limpia.
export const pathFor = file => (file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`);

const organization = (site, file) => ({
  '@type': ['MedicalOrganization', 'MedicalBusiness'],
  '@id': `${site || ''}/#organizacion`,
  name: SITE_NAME,
  legalName: 'INFECTUS SAS',
  slogan: 'Excelencia clínica, instituciones seguras.',
  description: 'Somos una empresa líder en el manejo de enfermedades infecciosas y uso racional de antimicrobianos.',
  medicalSpecialty: 'InfectiousDisease',
  foundingDate: '2025-02',
  foundingLocation: { '@type': 'Place', name: 'Bogotá, Colombia' },
  founder: { '@type': 'Person', name: 'David A. Forero Peña', jobTitle: 'Gerente' },
  telephone: PHONE,
  email: EMAIL,
  address: ADDRESS,
  hasMap: MAPS,
  areaServed: [{ '@type': 'City', name: 'Pasto' }, { '@type': 'State', name: 'Nariño' }, { '@type': 'Country', name: 'Colombia' }],
  contactPoint: { '@type': 'ContactPoint', telephone: PHONE, email: EMAIL, contactType: 'customer service', availableLanguage: 'es' },
  knowsAbout: ['Infectología', 'Programas de Optimización Antimicrobiana (PROA)', 'Prevención y Control de Infecciones (PCI)', 'Infecciones Asociadas a la Atención en Salud (IAAS)', 'Vacunación', 'Epidemiología', 'Microbiología clínica'],
  ...(site && { url: `${site}/`, logo: `${site}/brand/infectus-primary-transparent.png`, image: `${site}/og-image.jpg` }),
  ...(file === 'servicios.html' && {
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios de INFECTUS',
      itemListElement: SERVICES.map((name, i) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name, provider: { '@id': `${site || ''}/#organizacion` }, areaServed: 'Colombia', ...(site && { url: `${site}/servicios#servicio-${String(i + 1).padStart(2, '0')}` }) },
      })),
    },
  }),
  ...(file === 'equipo.html' && {
    employee: TEAM.map(([name, jobTitle]) => ({ '@type': 'Person', name, jobTitle, worksFor: { '@id': `${site || ''}/#organizacion` } })),
  }),
});

const graph = (site, file) => {
  const nodes = [organization(site, file)];
  if (site) {
    nodes.push({ '@type': 'WebSite', '@id': `${site}/#sitio`, url: `${site}/`, name: SITE_NAME, inLanguage: 'es-CO', publisher: { '@id': `${site}/#organizacion` } });
    if (LABELS[file]) {
      nodes.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${site}/` },
          { '@type': 'ListItem', position: 2, name: LABELS[file], item: `${site}${pathFor(file)}` },
        ],
      });
    }
  }
  return { '@context': 'https://schema.org', '@graph': nodes };
};

export function seoTags(file, site) {
  const page = pages[file];
  if (!page) return { tags: '', title: null, description: null };
  if (page.noindex) return { tags: '<meta name="robots" content="noindex, nofollow">', title: null, description: null };
  const url = site && `${site}${pathFor(file)}`;
  const image = `${site || ''}/og-image.jpg`;
  const tags = [
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">',
    url && `<link rel="canonical" href="${url}">`,
    '<meta name="geo.region" content="CO-NAR"><meta name="geo.placename" content="Pasto">',
    '<link rel="apple-touch-icon" href="/brand/infectus-mark-shield.png">',
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="es_CO">',
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:title" content="${esc(page.title)}">`,
    `<meta property="og:description" content="${esc(page.description)}">`,
    url && `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${image}">`,
    '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="INFECTUS, infectología y control de infecciones">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(page.title)}">`,
    `<meta name="twitter:description" content="${esc(page.description)}">`,
    `<meta name="twitter:image" content="${image}">`,
    `<script type="application/ld+json">${JSON.stringify(graph(site, file))}</script>`,
  ].filter(Boolean).join('\n  ');
  return { tags, title: esc(page.title), description: esc(page.description) };
}

export function sitemap(site) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = Object.entries(pages).filter(([, page]) => !page.noindex).map(([file, page]) =>
    `  <url><loc>${site}${pathFor(file)}</loc><lastmod>${today}</lastmod><priority>${page.priority}</priority></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}
