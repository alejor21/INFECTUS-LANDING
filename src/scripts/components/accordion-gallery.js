import { gsap } from 'gsap';

/**
 * Vanilla port of the AccordionGallery interaction for the Infectus home page.
 * It owns its listeners and observers so it can safely be mounted or removed.
 */
export function initAccordionGallery(root, options = {}) {
  if (!root) return () => {};

  const panels = [...root.querySelectorAll('[data-accordion-panel]')];
  if (!panels.length) return () => {};

  const settings = {
    defaultIndex: 0,
    duration: 0.76,
    expandRatio: 4.15,
    hoverDelay: 110,
    ...options
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = Math.min(Math.max(settings.defaultIndex, 0), panels.length - 1);
  let hoverTimer;
  let timeline;

  const animate = (target, vars) => {
    gsap.killTweensOf(target);
    return gsap.to(target, {
      duration: reducedMotion.matches ? 0 : settings.duration,
      ease: 'power3.out',
      overwrite: 'auto',
      ...vars
    });
  };

  const applyLayout = (nextIndex, shouldAnimate = true) => {
    activeIndex = nextIndex;
    timeline?.kill();
    timeline = gsap.timeline();

    panels.forEach((panel, index) => {
      const isActive = index === activeIndex;
      const caption = panel.querySelector('[data-accordion-caption]');
      panel.classList.toggle('is-active', isActive);
      if (panel.tagName === 'BUTTON') panel.setAttribute('aria-expanded', String(isActive));
      // Keep every panel in the tab order so keyboard users can discover the full narrative.
      panel.tabIndex = 0;

      const duration = shouldAnimate && !reducedMotion.matches ? settings.duration : 0;
      timeline.to(panel, {
        flexGrow: isActive ? settings.expandRatio : 1,
        duration,
        ease: 'power3.out',
        overwrite: 'auto'
      }, 0);
      timeline.to(panel, {
        '--accordion-dim': isActive ? .02 : .36,
        '--accordion-saturation': isActive ? 1 : .7,
        '--accordion-shift': `${(activeIndex - index) * 1.2}%`,
        duration,
        ease: 'power3.out',
        overwrite: 'auto'
      }, 0);
      if (caption) {
        timeline.to(caption, {
          autoAlpha: isActive ? 1 : 0,
          y: isActive ? 0 : 12,
          duration: isActive ? duration : duration * .55,
          ease: 'power3.out',
          overwrite: 'auto'
        }, isActive ? .1 : 0);
      }
    });
  };

  const setActive = (index, shouldAnimate = true) => {
    const nextIndex = (index + panels.length) % panels.length;
    if (nextIndex === activeIndex && shouldAnimate) return;
    applyLayout(nextIndex, shouldAnimate);
  };

  const onKeyDown = (event, index) => {
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    if (forward || backward) {
      event.preventDefault();
      const next = forward ? index + 1 : index - 1;
      setActive(next);
      panels[(next + panels.length) % panels.length].focus();
    }
    if (event.key === 'Home') { event.preventDefault(); setActive(0); panels[0].focus(); }
    if (event.key === 'End') { event.preventDefault(); setActive(panels.length - 1); panels.at(-1).focus(); }
  };

  const listeners = panels.map((panel, index) => {
    const onPointerEnter = () => {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(() => setActive(index), settings.hoverDelay);
      }
    };
    const onClick = () => setActive(index);
    const onFocus = () => setActive(index);
    const onKey = event => onKeyDown(event, index);
    panel.addEventListener('pointerenter', onPointerEnter);
    panel.addEventListener('click', onClick);
    panel.addEventListener('focus', onFocus);
    panel.addEventListener('keydown', onKey);
    return () => {
      panel.removeEventListener('pointerenter', onPointerEnter);
      panel.removeEventListener('click', onClick);
      panel.removeEventListener('focus', onFocus);
      panel.removeEventListener('keydown', onKey);
    };
  });

  const observer = new ResizeObserver(() => {
    root.classList.toggle('is-compact', root.clientWidth < 820);
  });
  observer.observe(root);
  applyLayout(activeIndex, false);

  return () => {
    clearTimeout(hoverTimer);
    timeline?.kill();
    observer.disconnect();
    listeners.forEach(remove => remove());
  };
}
