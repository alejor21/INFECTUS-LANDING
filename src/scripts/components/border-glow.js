/** Directional, edge-proximity glow adapted from the supplied React Bits component. */
export function initBorderGlow(element, { edgeSensitivity = 30, glowIntensity = .55 } = {}) {
  if (!element) return null;
  const abort = new AbortController();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const reset = () => element.style.setProperty('--glow-opacity', '0');
  element.addEventListener('pointermove', e => {
    if (reduced.matches || e.pointerType === 'touch') return;
    const r = element.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
    const edge = Math.min(1, Math.max(Math.abs(x) / (r.width / 2), Math.abs(y) / (r.height / 2)));
    const strength = Math.max(0, (edge * 100 - (100 - edgeSensitivity)) / edgeSensitivity);
    element.style.setProperty('--cursor-angle', `${Math.atan2(y, x) * 180 / Math.PI + 90}deg`);
    element.style.setProperty('--glow-opacity', String(strength * glowIntensity));
  }, { signal: abort.signal });
  element.addEventListener('pointerleave', reset, { signal: abort.signal });
  reduced.addEventListener('change', reset, { signal: abort.signal });
  return { destroy() { abort.abort(); reset(); element.style.removeProperty('--cursor-angle'); } };
}
