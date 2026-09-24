/**
 * Decorative layer for every global header. It is deliberately content-free
 * so it can be placed behind any navigation without affecting semantics.
 */
export function createHeaderAtmosphere() {
  const atmosphere = document.createElement('div');
  atmosphere.className = 'header-atmosphere';
  atmosphere.setAttribute('aria-hidden', 'true');
  return atmosphere;
}
