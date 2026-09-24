import { createHeaderAtmosphere } from './header-atmosphere.js';
import { createHeaderBrand } from './header-brand.js';

/**
 * Composes the reusable brand and atmospheric layers into each global header.
 */
export function initHeaderComponents() {
  document.querySelectorAll('.site-header').forEach((header) => {
    const inner = header.querySelector('.header-inner');
    const legacyBrand = header.querySelector('.logo-link');

    if (!inner || !legacyBrand || header.querySelector('.header-atmosphere')) return;

    inner.prepend(createHeaderAtmosphere());
    legacyBrand.replaceWith(createHeaderBrand());
  });
}
