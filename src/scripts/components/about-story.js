/**
 * Componentes de Nosotros:
 * - Pestañas accesibles ([data-tabs]): flechas, Inicio/Fin.
 * - Línea de tiempo ([data-timeline]): la línea se llena con el scroll y
 *   cada hito se marca al alcanzarlo.
 * - Inclinación con inercia ([data-tilt]): solo con mouse y sin «reducir
 *   movimiento».
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

export function initTabs(root) {
  const tabs = [...root.querySelectorAll('[data-tab]')];
  const panels = [...root.querySelectorAll('[data-tab-panel]')];
  const select = (index, focus) => {
    const active = (index + tabs.length) % tabs.length;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === active));
      tab.tabIndex = i === active ? 0 : -1;
      panels[i].hidden = i !== active;
    });
    if (focus) tabs[active].focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', event => {
      const current = tabs.indexOf(event.currentTarget);
      const keys = { ArrowDown: current + 1, ArrowRight: current + 1, ArrowUp: current - 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      select(keys[event.key], true);
    });
  });
}

export function initTimeline(root) {
  const items = [...root.querySelectorAll('.timeline__item')];
  const list = root.querySelector('.timeline');
  if (!list || !items.length) return;
  if (reduced) {
    list.closest('[data-timeline]').style.setProperty('--progress', '1');
    items.forEach(item => item.classList.add('is-reached'));
    return;
  }
  let frame = 0;
  const update = () => {
    frame = 0;
    const rect = list.getBoundingClientRect();
    const vertical = getComputedStyle(list).gridTemplateColumns.split(' ').length === 1;
    // Horizontal: avanza mientras la sección recorre la parte media de la
    // pantalla. Vertical: sigue la línea a la altura del 70 % de la pantalla.
    const progress = vertical
      ? (innerHeight * 0.7 - rect.top) / rect.height
      : (innerHeight * 0.85 - rect.top) / (innerHeight * 0.6);
    const value = Math.min(1, Math.max(0, progress));
    root.style.setProperty('--progress', value.toFixed(3));
    items.forEach((item, i) => {
      const at = vertical ? (item.offsetTop + 24) / list.offsetHeight : (i + 0.15) / items.length;
      item.classList.toggle('is-reached', value >= at);
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  update();
}

export function initTilt(card) {
  if (!fine || reduced) return;
  const state = { x: 0, y: 0, tx: 0, ty: 0 };
  let frame = 0;
  const step = () => {
    state.x += (state.tx - state.x) * 0.1;
    state.y += (state.ty - state.y) * 0.1;
    card.style.transform = `rotateX(${state.x.toFixed(2)}deg) rotateY(${state.y.toFixed(2)}deg)`;
    frame = Math.abs(state.tx - state.x) + Math.abs(state.ty - state.y) > 0.01 ? requestAnimationFrame(step) : 0;
  };
  const kick = () => { if (!frame) frame = requestAnimationFrame(step); };
  card.addEventListener('pointermove', event => {
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    state.ty = (px - 0.5) * 8;
    state.tx = -(py - 0.5) * 6;
    card.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`);
    card.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`);
    card.classList.add('is-tilting');
    kick();
  });
  card.addEventListener('pointerleave', () => {
    state.tx = 0; state.ty = 0;
    card.classList.remove('is-tilting');
    kick();
  });
}
