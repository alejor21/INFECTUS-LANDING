/**
 * Entrada suave de las secciones al hacer scroll, a prueba de fallos:
 * - El contenido es visible por defecto; solo se oculta cuando este script
 *   añade .reveal-ready a <html>, es decir, cuando sabe que puede mostrarlo.
 * - Basta con que asome un píxel (threshold 0), así los bloques muy altos en
 *   celular (carnés, catálogo, organigrama) aparecen siempre.
 * - Red de seguridad: un control por scroll revela lo que ya pasó por
 *   pantalla aunque IntersectionObserver no dispare (navegadores antiguos,
 *   saltos con anclas o scroll muy rápido).
 */
export function initReveal() {
  const elements = [...document.querySelectorAll('.reveal')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!elements.length || reduced || !('IntersectionObserver' in window)) {
    elements.forEach(element => element.classList.add('is-revealed'));
    return;
  }

  const pending = new Set(elements);
  const reveal = element => {
    if (!pending.delete(element)) return;
    element.classList.add('is-revealed');
    observer.unobserve(element);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
  }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });

  let frame = 0;
  const sweep = () => {
    frame = 0;
    const limit = window.innerHeight;
    pending.forEach(element => { if (element.getBoundingClientRect().top < limit) reveal(element); });
    if (!pending.size) {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    }
  };
  // Temporizador en vez de requestAnimationFrame: sigue funcionando aunque el
  // navegador frene los fotogramas (modo ahorro de batería, pestaña en 2.º plano).
  const onScroll = () => { if (!frame) frame = setTimeout(sweep, 90); };

  document.documentElement.classList.add('reveal-ready');
  elements.forEach(element => observer.observe(element));
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  // Lo que ya está en pantalla al cargar aparece de inmediato.
  sweep();
}
