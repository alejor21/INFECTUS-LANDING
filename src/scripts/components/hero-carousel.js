/** Image-only carousel. Existing hero particle and pointer effects stay independent. */
export function initHeroCarousel(root) {
  if (!root) return null;
  const slides = [...root.querySelectorAll('[data-hero-slide]')];
  if (slides.length < 2) return null;
  const dots = [...root.querySelectorAll('[data-hero-dot]')];
  const pauseButton = root.querySelector('[data-hero-pause]');
  const pauseText = root.querySelector('[data-hero-pause-text]');
  const pauseIcon = root.querySelector('[data-pause-icon]');
  const status = root.querySelector('[data-hero-status]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const { signal } = controller;
  let active = 0;
  let paused = reducedMotion.matches;
  let hovering = false;
  let visible = false;
  let timer = 0;
  let transitionTimer = 0;
  let transitioning = false;

  const render = () => {
    slides.forEach((slide, index) => {
      const position = (index - active + slides.length) % slides.length;
      slide.dataset.position = ['front', 'next', 'back'][position];
      slide.setAttribute('aria-hidden', String(index !== active));
    });
    dots.forEach((dot, index) => {
      if (index === active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };
  const schedule = () => {
    clearTimeout(timer);
    if (!paused && !hovering && visible && !document.hidden && !reducedMotion.matches) {
      timer = setTimeout(() => show((active + 1) % slides.length), 6500);
    }
  };
  const updatePlayback = () => {
    pauseButton.hidden = reducedMotion.matches;
    pauseButton.setAttribute('aria-label', paused ? 'Reproducir carrusel' : 'Pausar carrusel');
    pauseText.textContent = paused ? 'Reproducir' : 'Pausar';
    pauseIcon.setAttribute('d', paused ? 'M7 4l8 6-8 6Z' : 'M7 5v10M13 5v10');
    root.dataset.playback = paused ? 'paused' : 'playing';
    schedule();
  };
  const show = (index, manual = false) => {
    if (transitioning || index === active) return;
    const outgoing = slides[active];
    active = (index + slides.length) % slides.length;
    render();
    if (!reducedMotion.matches) {
      transitioning = true;
      outgoing.dataset.position = 'leaving';
      transitionTimer = setTimeout(() => { render(); transitioning = false; }, 850);
    }
    if (manual) status.textContent = slides[active].getAttribute('aria-label');
    schedule();
  };
  root.querySelector('.hero-carousel__controls').hidden = false;
  dots.forEach((dot, index) => dot.addEventListener('click', () => show(index, true), { signal }));
  root.querySelector('[data-hero-next]').addEventListener('click', () => show((active + 1) % slides.length, true), { signal });
  pauseButton.addEventListener('click', () => { paused = !paused; updatePlayback(); }, { signal });
  root.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') { hovering = true; schedule(); } }, { signal });
  root.addEventListener('pointerleave', () => { hovering = false; schedule(); }, { signal });
  // Keyboard users retain the selected slide until they explicitly resume rotation.
  root.addEventListener('focusin', (event) => {
    if (event.target === pauseButton) return;
    paused = true;
    updatePlayback();
  }, { signal });
  root.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1);
    show(index, true);
  }, { signal });
  document.addEventListener('visibilitychange', schedule, { signal });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updatePlayback(); }, { signal });
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: .2 });
  observer.observe(root);
  render();
  updatePlayback();
  return { destroy() { clearTimeout(timer); clearTimeout(transitionTimer); observer.disconnect(); controller.abort(); } };
}
