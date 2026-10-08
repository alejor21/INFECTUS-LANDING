/**
 * Paralaje sutil de los heroes con capas: cada elemento con
 * data-parallax-depth se desplaza unos píxeles siguiendo el cursor.
 * Usa la propiedad `translate` para no interferir con las animaciones de
 * `transform` (flotado de las etiquetas). Solo con puntero fino y sin
 * «reducir movimiento».
 */
export function initHeroParallax(root) {
  if (!root) return null;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return null;

  const layers = [...root.querySelectorAll('[data-parallax-depth]')].map(element => ({
    element,
    depth: Number(element.dataset.parallaxDepth) || 0,
  }));
  if (!layers.length) return null;

  const abort = new AbortController();
  let frame = 0;
  const apply = (x, y) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      layers.forEach(({ element, depth }) => {
        element.style.translate = `${(x * depth).toFixed(1)}px ${(y * depth).toFixed(1)}px`;
      });
    });
  };

  root.addEventListener('pointermove', event => {
    const rect = root.getBoundingClientRect();
    apply((event.clientX - rect.left) / rect.width - 0.5, (event.clientY - rect.top) / rect.height - 0.5);
  }, { signal: abort.signal });
  root.addEventListener('pointerleave', () => apply(0, 0), { signal: abort.signal });

  return { destroy() { abort.abort(); cancelAnimationFrame(frame); } };
}
