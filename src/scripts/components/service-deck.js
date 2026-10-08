/**
 * Pila 3D de servicios del hero de Inicio. Las tres categorías se apilan en
 * profundidad: la activa al frente y las otras asoman detrás. Pestañas
 * accesibles (flechas, Inicio/Fin), rotación automática que se pausa con el
 * cursor o el foco y se detiene al elegir, e inclinación con inercia que
 * sigue al puntero (solo con mouse y sin «reducir movimiento»).
 */
export function initServiceDeck(root) {
  if (!root) return null;
  const tabs = [...root.querySelectorAll('[data-deck-tab]')];
  const panels = [...root.querySelectorAll('[data-deck-panel]')];
  const stage = root.querySelector('.service-deck__stage');
  const indicator = root.querySelector('.service-deck__indicator');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const abort = new AbortController();
  const { signal } = abort;
  const DURATION = 6500;
  let active = 0;
  let timer = 0;
  let stopped = reduced;

  const placeIndicator = () => {
    const tab = tabs[active];
    if (!indicator || !tab) return;
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
  };

  const select = (index, focus = false) => {
    active = (index + tabs.length) % tabs.length;
    tabs.forEach((tab, i) => {
      const on = i === active;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach((panel, i) => {
      const depth = (i - active + panels.length) % panels.length;
      panel.dataset.depth = String(depth);
      panel.inert = depth !== 0;
      panel.setAttribute('aria-hidden', String(depth !== 0));
      if (depth === 1) panel.querySelector('img')?.removeAttribute('loading');
    });
    placeIndicator();
    if (focus) tabs[active].focus();
    schedule();
  };

  const schedule = () => {
    clearTimeout(timer);
    root.classList.remove('is-playing');
    if (stopped) return;
    void root.offsetWidth; // reinicia la barra de progreso
    root.classList.add('is-playing');
    timer = setTimeout(() => select(active + 1), DURATION);
  };
  const pause = () => { clearTimeout(timer); root.classList.remove('is-playing'); };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { stopped = true; select(i); }, { signal });
    tab.addEventListener('keydown', event => {
      const keys = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: tabs.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      stopped = true;
      select(keys[event.key], true);
    }, { signal });
  });
  root.addEventListener('focusin', pause, { signal });
  root.addEventListener('focusout', event => { if (!root.contains(event.relatedTarget)) schedule(); }, { signal });
  new ResizeObserver(placeIndicator).observe(root);

  // Inclinación con inercia: el objetivo sigue al cursor y el valor real se
  // acerca con interpolación, como un resorte amortiguado.
  let frame = 0;
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  const step = () => {
    tilt.x += (tilt.tx - tilt.x) * 0.12;
    tilt.y += (tilt.ty - tilt.y) * 0.12;
    stage.style.transform = `rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`;
    frame = Math.abs(tilt.tx - tilt.x) + Math.abs(tilt.ty - tilt.y) > 0.01 ? requestAnimationFrame(step) : 0;
  };
  const kick = () => { if (!frame) frame = requestAnimationFrame(step); };
  if (fine && !reduced && stage) {
    root.addEventListener('pointermove', event => {
      const rect = stage.getBoundingClientRect();
      tilt.ty = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
      tilt.tx = -((event.clientY - rect.top) / rect.height - 0.5) * 6;
      kick();
    }, { signal });
  }
  root.addEventListener('pointerenter', pause, { signal });
  root.addEventListener('pointerleave', () => { tilt.tx = 0; tilt.ty = 0; kick(); schedule(); }, { signal });

  select(0);
  return { destroy() { abort.abort(); clearTimeout(timer); cancelAnimationFrame(frame); } };
}
