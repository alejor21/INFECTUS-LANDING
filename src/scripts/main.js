import { initNavigation } from './navigation.js';
import { initContactForm } from './contact-form.js';
import { initReveal } from './reveal.js';
import { initHeaderComponents } from './components/header.js';
import './quality.js';
import { initPdfReader } from './components/pdf-reader.js';
import { initIslands } from './islands.js';

initHeaderComponents();
initNavigation();
// The persistent contact action is never the current page: only the matching
// entry inside the primary navigation carries aria-current. This also
// normalizes any legacy markup that still ships the attribute on the CTA.
document.querySelectorAll('.header-cta[aria-current]').forEach(link => link.removeAttribute('aria-current'));
initContactForm();
initReveal();
initIslands();

const pdfReaders = [...document.querySelectorAll('[data-pdf-reader]')].map(initPdfReader);
const scientificObjects = [...document.querySelectorAll('[data-science-motion]')];
const reducedScientificMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scientificObserver = scientificObjects.length ? new IntersectionObserver(entries => {
  entries.forEach(({target, isIntersecting}) => {
    target.classList.toggle('is-in-view', isIntersecting);
    const video = target.querySelector('[data-science-video]');
    if (!video) return;
    if (isIntersecting && !reducedScientificMotion) video.play().catch(() => {});
    else video.pause();
  });
}, { threshold: 0.15 }) : null;
scientificObjects.forEach(element => scientificObserver.observe(element));
if (import.meta.hot) import.meta.hot.dispose(() => {
  pdfReaders.forEach(reader => reader.destroy());
  scientificObserver?.disconnect();
});

// Heavy, page-specific components are code-split via dynamic import so pages
// that don't use them (blog, contacto, servicios) never fetch GSAP/OGL/canvas code.
const accordionRoot = document.querySelector('[data-accordion-gallery]');
if (accordionRoot) {
  import('./components/accordion-gallery.js').then(({ initAccordionGallery }) => {
    initAccordionGallery(accordionRoot, { defaultIndex: 0 });
  });
}

const carouselRoot = document.querySelector('[data-hero-carousel]');
if (carouselRoot) {
  import('./components/hero-carousel.js').then(({ initHeroCarousel }) => {
    const heroCarousel = initHeroCarousel(carouselRoot);
    if (import.meta.hot) import.meta.hot.dispose(() => heroCarousel?.destroy());
  });
}

const driftWallRoot = document.querySelector('[data-drift-wall]');
if (driftWallRoot) {
  import('./components/drift-wall.js').then(({ initDriftWall }) => {
    const driftWall = initDriftWall(driftWallRoot);
    if (import.meta.hot) import.meta.hot.dispose(() => driftWall?.destroy());
  });
}

const borderGlowRoots = [...document.querySelectorAll('[data-border-glow]')];
if (borderGlowRoots.length) {
  import('./components/border-glow.js').then(({ initBorderGlow }) => {
    const glows = borderGlowRoots.map(element => initBorderGlow(element));
    if (import.meta.hot) import.meta.hot.dispose(() => glows.forEach(glow => glow?.destroy()));
  });
}

const homeHero = document.querySelector('.home-hero');
if (homeHero) {
  import('./effects/floating-3d-particles.js').then(({ initFloating3DParticles }) => {
    initFloating3DParticles(homeHero);
  });
  import('./effects/glow-cursor.js').then(({ initGlowCursor }) => {
    initGlowCursor(homeHero);
  });
}

const editorialRailRoot = document.querySelector('[data-editorial-rail]');
if (editorialRailRoot) {
  import('./components/editorial-rail.js').then(({ initEditorialRail }) => {
    initEditorialRail(editorialRailRoot);
  });
}

const servicesProgressRoot = document.querySelector('[data-services-progress]');
if (servicesProgressRoot) {
  import('./components/services-progress.js').then(({ initServicesProgress }) => {
    initServicesProgress(servicesProgressRoot);
  });
}
