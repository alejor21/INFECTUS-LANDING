/**
 * Converts source photography from assets/imagenes into the optimized WebP
 * files served from public/images. Re-run after adding a source image.
 */
import { statSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const SRC = 'assets/imagenes';
const OUT = 'public/images';

/** source (relative to assets/imagenes) -> published path (relative to public/images) */
const MAP = {
  // Home / Nosotros (already published in FASE 9)
  'FONDOS/1923d230-090d-4fcd-8c8a-3335fdf7f0ee.png': 'contact/contact-hero-background.webp',
  'FONDOS/22093c0b-67a4-455c-ace4-7692248955b2.png': 'services/services-cta-background.webp',
  'FONDOS/9f56d2da-0632-4fd0-b4a3-fea748dbb8fe.png': 'blog/blog-hero-editorial.webp',
  'FONDOS/aec403e6-2632-4dc3-a4da-4be219029414.png': 'blog/blog-research-background.webp',
  'FONDOS/b91802dc-afc1-451c-a933-fd77a0bfa0b0.png': 'contact/contact-hero-atmosphere.webp',
  'FONDOS/ef931c9e-b4fa-402a-b06c-c2fac6fd7b18.png': 'about/about-purpose-background.webp',
  'HERO/17ef79f8-fbc8-4bc5-843f-98a702ed5d46.png': 'home/hero-infectus.webp',
  'HERO/27ca5f26-f616-4d0e-b280-bd0a6d498102.png': 'home/hero-infectus-molecular.webp',
  'INDENTIDAD/0098b7c0-9a5d-4ff7-a7d7-27f6746e17bb.png': 'about/about-collaboration-team.webp',
  'INDENTIDAD/78bcaac6-e71b-45d0-b6bb-d60f99853479.png': 'home/identity-lab-collaboration.webp',
  'INVESTIGACION/106069db-dae8-48cb-bdbf-001cec1c85bd.png': 'home/research-data-review.webp',
  'INVESTIGACION/1a0b08b7-e270-4ad5-8715-8928cc9ef005.png': 'about/about-science-analysis.webp',
  'INVESTIGACION/3f0a8f29-711c-40fd-914d-433f2c44790f.png': 'home/research-cellular-science.webp',
  'VACCINE/e0b28417-ed84-4059-b2b6-0297eeee2cab.png': 'home/vaccine-vial-analysis.webp',

  // FASE 10 — remaining library, distributed across the redesigned pages
  'FONDOS/2c130df4-581e-4ede-a1b5-0ba0475126f8.png': 'shared/molecular-field.webp',
  'HERO/3f89d970-b64f-4b8c-b9f2-d13fb86d858f.png': 'shared/cell-structure.webp',
  'HERO/d2c6a238-cd5d-48b1-9307-396e779f74ac.png': 'shared/molecular-macro.webp',
  'HERO/edacd78b-66d3-4700-b299-ed25e3726079.png': 'services/vaccine-vials-lab.webp',
  'INDENTIDAD/156f48c6-7756-471e-95e6-84f45283b01a.png': 'contact/pediatric-consultation.webp',
  'INDENTIDAD/2c1d8205-31e0-442d-91ea-ecca5fee0353.png': 'team/researcher-portrait.webp',
  'INDENTIDAD/dd88b2ba-8d89-45ce-800b-353d288a069e.png': 'blog/community-health.webp',
  'INVESTIGACION/6a8a0aa8-e84c-40a9-8166-64ec0f3ae611.png': 'services/microplate-analysis.webp',
  'INVESTIGACION/ff881fd7-680f-40eb-9d19-88d11ce4d513.png': 'team/team-conversation.webp',
  'VACCINE/b07ce371-7f30-44ec-be0e-7257703a77c1.png': 'services/data-visualization.webp',
  'VACCINE/e10f11bf-aca7-437a-a530-61086228d693.png': 'team/microscope-work.webp',
  'VACCINE/fdbcf627-dc92-40a5-a85a-7d52ec531e60.png': 'contact/clinical-consultation.webp',

  // FASE D1 — sistema de composición por capas para Modelo, Servicios, Equipo y
  // Actualidad. Los recortes de personas y los objetos 3D conservan canal alfa.
  'FONDOS/Imagen de Codex 23 sept 2026, 18_14_13.png': 'model/ecosystem-background.webp',
  'varios/molecula1.png': 'model/ecosystem-core.webp',
  'varios/Imagen de Codex 23 sept 2026, 18_46_21-2.png': 'model/vaccine-vial.webp',
  'FONDOS/fondos1.png': 'services/services-hero-background.webp',
  'personas/doctor1.png': 'services/services-hero-clinician.webp',
  'varios/capa foreground2.png': 'services/services-hero-foreground.webp',
  'personas/doctora1.png': 'services/clinical-care-specialist.webp',
  'FONDOS/fondos2.png': 'team/team-hero-background.webp',
  'personas/colaboracion1.png': 'team/team-hero-group.webp',
  'FONDOS/fondos3': 'editorial/editorial-hero-background.webp',
  'varios/molecula2.png': 'editorial/editorial-object.webp',
  'varios/capa foreground1.png': 'editorial/editorial-foreground.webp',
};

let totalBefore = 0;
let totalAfter = 0;

for (const [source, target] of Object.entries(MAP)) {
  const from = join(SRC, source);
  const to = join(OUT, target);
  if (!existsSync(from)) { console.warn('missing source:', from); continue; }
  mkdirSync(dirname(to), { recursive: true });

  const before = statSync(from).size;
  const meta = await sharp(from).metadata();
  await sharp(from).webp({ quality: 78, effort: 6 }).toFile(to);
  const after = statSync(to).size;

  totalBefore += before;
  totalAfter += after;
  console.log(`${target.padEnd(42)} ${meta.width}x${meta.height}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
}

console.log(`\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB (${(100 - (totalAfter / totalBefore) * 100).toFixed(1)}% menos)`);
