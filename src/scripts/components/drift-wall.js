/** Vanilla adaptation of the supplied React Bits DriftWall interaction. */
import { byTier, isLowTier } from '../quality.js';

export function initDriftWall(element, options = {}) {
  if (!element) return null;
  const mobile = matchMedia('(max-width: 768px)');
  const config = {
    columns: mobile.matches || isLowTier ? 2 : byTier({ low: 2, balanced: 3, high: 4 }),
    tilesPerGroup: byTier({ low: 3, balanced: 4, high: 4 }),
    speed: 18, tilt: 8, turn: -8, parallax: .3, ...options
  };
  const source = [...element.querySelectorAll('img')];
  if (!source.length) return null;
  const original = [...element.childNodes];
  const abort = new AbortController();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const plane = document.createElement('div');
  plane.className = 'drift-wall__plane';
  plane.style.setProperty('--drift-columns', String(config.columns));
  plane.setAttribute('aria-hidden', 'true');
  const tracks = [];
  for (let c = 0; c < config.columns; c++) {
    const col = document.createElement('div');
    col.className = 'drift-wall__col';
    const track = document.createElement('div');
    track.className = 'drift-wall__track';
    for (let copy = 0; copy < 2; copy++) {
      const group = document.createElement('div');
      group.className = 'drift-wall__group';
      for (let i = 0; i < config.tilesPerGroup; i++) {
        const tile = document.createElement('div');
        tile.className = 'drift-wall__tile';
        const img = source[(i + c * 2) % source.length].cloneNode(true);
        img.alt = ''; img.draggable = false;
        tile.append(img); group.append(tile);
      }
      track.append(group);
    }
    col.append(track); plane.append(col); tracks.push(track);
  }
  element.replaceChildren(plane);
  const button = element.parentElement.querySelector('[data-drift-pause]');
  let paused = false, visible = false, frame = 0, last = 0, destroyed = false, isMobile = mobile.matches;
  const offset = tracks.map((_, i) => i * 117);
  /* Group heights are measured outside the frame loop: reading offsetHeight between
     transform writes forced a synchronous reflow on every track, every frame. */
  const heights = tracks.map(() => 0);
  const hovered = tracks.map(() => false);
  const pointer = { x: 0, y: 0 }, damped = { x: 0, y: 0 };

  function measure() {
    tracks.forEach((track, i) => { heights[i] = track.firstElementChild?.offsetHeight || 0; });
  }

  function draw(ts) {
    frame = 0;
    const dt = last ? Math.min((ts - last) / 1000, .05) : 0;
    last = ts;
    const ease = 1 - Math.exp(-dt / .2);
    damped.x += (pointer.x - damped.x) * ease;
    damped.y += (pointer.y - damped.y) * ease;
    plane.style.transform = `translate(-50%, -50%) rotateX(${(isMobile ? 3 : config.tilt) + damped.y}deg) rotateY(${(isMobile ? -3 : config.turn) + damped.x}deg)`;
    for (let i = 0; i < tracks.length; i++) {
      const height = heights[i];
      const speed = config.speed * (isMobile ? .65 : 1) * (1 + (i % 3) * .13) * (i % 2 ? -1 : 1);
      if (!hovered[i] && height) offset[i] = ((offset[i] + speed * dt) % height + height) % height;
      tracks[i].style.transform = `translate3d(0,${-offset[i]}px,0)`;
    }
    if (visible && !paused && !reduced.matches && !document.hidden && !destroyed) frame = requestAnimationFrame(draw);
  }

  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    element.dataset.motion = reduced.matches || paused ? 'paused' : 'running';
    if (button) { button.hidden = reduced.matches; button.textContent = paused ? 'Reanudar movimiento' : 'Pausar movimiento'; button.setAttribute('aria-pressed', String(paused)); }
    if (visible && !paused && !reduced.matches && !document.hidden && !destroyed) frame = requestAnimationFrame(draw);
  }

  const resizeObserver = new ResizeObserver(() => { isMobile = mobile.matches; measure(); });
  resizeObserver.observe(element);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(element);
  tracks.forEach((track, i) => {
    const col = track.parentElement;
    col.addEventListener('pointerenter', () => { hovered[i] = true; }, { signal: abort.signal });
    col.addEventListener('pointerleave', () => { hovered[i] = false; }, { signal: abort.signal });
  });
  element.addEventListener('pointermove', e => {
    if (isMobile || reduced.matches || paused || e.pointerType === 'touch') return;
    const r = element.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width - .5) * config.parallax * 8;
    pointer.y = -((e.clientY - r.top) / r.height - .5) * config.parallax * 8;
  }, { signal: abort.signal });
  element.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; }, { signal: abort.signal });
  button?.addEventListener('click', () => { paused = !paused; sync(); }, { signal: abort.signal });
  reduced.addEventListener('change', sync, { signal: abort.signal });
  document.addEventListener('visibilitychange', sync, { signal: abort.signal });
  measure();
  sync();
  return {
    destroy() {
      destroyed = true; cancelAnimationFrame(frame);
      observer.disconnect(); resizeObserver.disconnect(); abort.abort();
      element.replaceChildren(...original);
    }
  };
}
