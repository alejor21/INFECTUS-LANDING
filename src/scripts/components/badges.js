/**
 * Carnés institucionales del equipo.
 * - Todos los perfiles son visibles a la vez; el reverso de cada carné guarda
 *   la trayectoria y se muestra con el botón «Ver trayectoria».
 * - Con puntero fino, el carné se inclina levemente siguiendo el cursor.
 * La cara oculta queda fuera del árbol accesible y del orden de tabulación.
 */
const MAX_TILT = 6;

export function initBadges(root) {
  if (!root) return null;
  const abort = new AbortController();
  const { signal } = abort;
  const canTilt = matchMedia('(hover: hover) and (pointer: fine)').matches
    && !matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.querySelectorAll('[data-badge]').forEach(badge => {
    const inner = badge.querySelector('.badge-card__inner');
    const front = badge.querySelector('.badge-card__front');
    const back = badge.querySelector('.badge-card__back');
    const [openButton, closeButton] = badge.querySelectorAll('[data-badge-flip]');

    const setFlipped = flipped => {
      badge.classList.toggle('is-flipped', flipped);
      openButton.setAttribute('aria-expanded', String(flipped));
      closeButton.setAttribute('aria-expanded', String(flipped));
      back.setAttribute('aria-hidden', String(!flipped));
      front.toggleAttribute('inert', flipped);
      back.toggleAttribute('inert', !flipped);
      closeButton.tabIndex = flipped ? 0 : -1;
      (flipped ? closeButton : openButton).focus({ preventScroll: true });
    };
    back.toggleAttribute('inert', true);
    openButton.addEventListener('click', () => setFlipped(true), { signal });
    closeButton.addEventListener('click', () => setFlipped(false), { signal });
    badge.addEventListener('keydown', event => {
      if (event.key === 'Escape' && badge.classList.contains('is-flipped')) setFlipped(false);
    }, { signal });

    if (!canTilt) return;
    let frame = 0;
    badge.addEventListener('pointermove', event => {
      const rect = badge.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        inner.style.setProperty('--tilt-x', (-y * MAX_TILT).toFixed(2) + 'deg');
        inner.style.setProperty('--tilt-y', (x * MAX_TILT).toFixed(2) + 'deg');
        inner.style.setProperty('--glare-x', ((x + 0.5) * 100).toFixed(1) + '%');
        inner.style.setProperty('--glare-y', ((y + 0.5) * 100).toFixed(1) + '%');
      });
    }, { signal });
    badge.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      inner.style.setProperty('--tilt-x', '0deg');
      inner.style.setProperty('--tilt-y', '0deg');
    }, { signal });
  });

  return { destroy() { abort.abort(); } };
}
