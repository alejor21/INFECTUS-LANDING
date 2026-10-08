import { initNavigation } from './navigation.js';
import { initContactForm } from './contact-form.js';
import { initReveal } from './reveal.js';
import { initHeaderComponents } from './components/header.js';
import './quality.js';

initHeaderComponents();
initNavigation();
// The persistent contact action is never the current page: only the matching
// entry inside the primary navigation carries aria-current. This also
// normalizes any legacy markup that still ships the attribute on the CTA.
document.querySelectorAll('.header-cta[aria-current]').forEach(link => link.removeAttribute('aria-current'));
initContactForm();
initReveal();

const pdfReaderRoots = [...document.querySelectorAll('[data-pdf-reader]')];
let pdfReaders = [];
if (pdfReaderRoots.length) {
  import('./components/pdf-reader.js').then(({ initPdfReader }) => {
    pdfReaders = pdfReaderRoots.map(initPdfReader);
  });
}
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

const serviceDeckRoot = document.querySelector('[data-service-deck]');
if (serviceDeckRoot) {
  import('./components/service-deck.js').then(({ initServiceDeck }) => {
    const serviceDeck = initServiceDeck(serviceDeckRoot);
    if (import.meta.hot) import.meta.hot.dispose(() => serviceDeck?.destroy());
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
    // Particles fill the light half of the hero and fade before the navy
    // wedge; on mobile the light area is the top band.
    initFloating3DParticles(homeHero, {
      fade: {
        query: '(max-width: 768px)',
        match: { axis: 'y', start: 0.3, end: 0.46 },
        otherwise: { axis: 'x', start: 0.72, end: 1 }
      }
    });
  });
  import('./effects/glow-cursor.js').then(({ initGlowCursor }) => {
    initGlowCursor(homeHero);
  });
}

const parallaxRoots = [...document.querySelectorAll('[data-hero-parallax]')];
if (parallaxRoots.length) {
  import('./components/hero-parallax.js').then(({ initHeroParallax }) => {
    const parallax = parallaxRoots.map(initHeroParallax);
    if (import.meta.hot) import.meta.hot.dispose(() => parallax.forEach(item => item?.destroy()));
  });
}

const badgesRoot = document.querySelector('[data-badges]');
if (badgesRoot) {
  import('./components/badges.js').then(({ initBadges }) => {
    const badges = initBadges(badgesRoot);
    if (import.meta.hot) import.meta.hot.dispose(() => badges?.destroy());
  });
}

const editorialRailRoots = [...document.querySelectorAll('[data-editorial-rail]')];
if (editorialRailRoots.length) {
  import('./components/editorial-rail.js').then(({ initEditorialRail }) => {
    editorialRailRoots.forEach(initEditorialRail);
  });
}

const servicesProgressRoot = document.querySelector('[data-services-progress]');
if (servicesProgressRoot) {
  import('./components/services-progress.js').then(({ initServicesProgress }) => {
    initServicesProgress(servicesProgressRoot);
  });
}

const storyRoots = document.querySelectorAll('[data-tabs], [data-timeline], [data-tilt]');
if (storyRoots.length) {
  import('./components/about-story.js').then(({ initTabs, initTimeline, initTilt }) => {
    document.querySelectorAll('[data-tabs]').forEach(initTabs);
    document.querySelectorAll('[data-timeline]').forEach(initTimeline);
    document.querySelectorAll('[data-tilt]').forEach(initTilt);
  });
}

// El acceso a WhatsApp aparece cuando el visitante deja atrás el hero.
const floatContact = document.querySelector('[data-float-contact]');
if (floatContact) {
  const toggle = () => floatContact.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
  addEventListener('scroll', toggle, { passive: true });
  toggle();
}
