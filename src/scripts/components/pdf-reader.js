/**
 * Page-by-page PDF reader embedded in the page.
 *
 * Each page is a pre-rendered image (scripts/render-portfolios.py) scaled to fit
 * the stage completely, so a page is always read whole, without scrolling.
 * The PDF's own interactivity is recreated on top of the image from the areas
 * recorded by scripts/extract-pdf-hotspots.py:
 *   - page   → internal link, jumps to another page (with a way back)
 *   - uri    → external link (WhatsApp, email), opens outside the page
 *   - checkbox / text → form fields; their values survive page changes and are
 *     appended to the WhatsApp/email message sent from the same page.
 * Nothing typed here is stored or sent by the site: it only travels inside the
 * message the visitor chooses to open.
 */
const SWIPE_DISTANCE = 48;

export function initPdfReader(root) {
  const stage = root.querySelector('.pdf-stage');
  const placeholder = root.querySelector('.pdf-placeholder');
  const status = root.querySelector('[data-pdf-status]');
  const retry = root.querySelector('[data-pdf-retry]');
  const title = root.dataset.pdfTitle || 'Documento';
  const abort = new AbortController();
  const { signal } = abort;
  const values = new Map();
  const history = [];
  let pages;
  let pageIndex = 0;
  let loading = false;
  let disposed = false;
  let renderVersion = 0;
  let sheet;
  let controls;

  const setState = (state, message) => {
    root.dataset.state = state;
    stage.setAttribute('aria-busy', String(state === 'loading'));
    status.textContent = message;
  };

  /* --- Fit the page inside the stage ------------------------------------- */
  const fit = () => {
    if (!sheet || !pages) return;
    const page = pages[pageIndex];
    const styles = getComputedStyle(stage);
    const width = stage.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    const height = stage.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
    const scale = Math.min(width / page.width, height / page.height);
    sheet.style.width = Math.floor(page.width * scale) + 'px';
    sheet.style.height = Math.floor(page.height * scale) + 'px';
  };
  const resizeObserver = new ResizeObserver(fit);
  resizeObserver.observe(stage);

  /* --- Form summary appended to the outgoing message --------------------- */
  const summary = spots => {
    const lines = [];
    const chosen = spots.filter(spot => spot.type === 'checkbox' && values.get(spot.name)).map(spot => spot.label);
    if (chosen.length) lines.push('Vacunas: ' + chosen.join(', '));
    spots.filter(spot => spot.type === 'text' && values.get(spot.name)?.trim())
      .forEach(spot => lines.push(spot.label + ': ' + values.get(spot.name).trim()));
    return lines.join('\n');
  };
  const withSummary = (href, text) => {
    if (!text) return href;
    try {
      const url = new URL(href);
      // URLSearchParams encodes spaces as "+"; mail clients and WhatsApp expect %20.
      if (url.protocol === 'mailto:') url.searchParams.set('body', text);
      else url.searchParams.set('text', (url.searchParams.get('text') || '') + '\n' + text);
      return url.toString().replace(/\+/g, '%20');
    } catch { return href; }
  };

  /* --- Interactive layer -------------------------------------------------- */
  const place = (element, [left, top, width, height]) => {
    element.style.left = left * 100 + '%';
    element.style.top = top * 100 + '%';
    element.style.width = width * 100 + '%';
    element.style.height = height * 100 + '%';
  };
  const buildSpots = page => {
    const layer = document.createElement('div');
    layer.className = 'pdf-spots';
    const spots = page.spots || [];
    spots.forEach(spot => {
      let element;
      if (spot.type === 'page') {
        element = document.createElement('button');
        element.type = 'button';
        element.className = 'pdf-spot pdf-spot--link';
        element.setAttribute('aria-label', 'Ir a la página ' + (spot.page + 1));
        element.addEventListener('click', () => go(spot.page, { remember: true }));
      } else if (spot.type === 'uri') {
        element = document.createElement('a');
        element.className = 'pdf-spot pdf-spot--link';
        element.href = spot.href;
        element.target = '_blank';
        element.rel = 'noopener';
        const channel = spot.href.startsWith('mailto:') ? 'correo' : spot.href.includes('wa.me') ? 'WhatsApp' : 'enlace externo';
        element.setAttribute('aria-label', 'Escribir por ' + channel + ' (se abre fuera de la página)');
        element.addEventListener('click', () => { element.href = withSummary(spot.href, summary(spots)); });
      } else {
        element = document.createElement('input');
        element.className = 'pdf-spot pdf-spot--field';
        element.name = spot.name;
        element.setAttribute('aria-label', spot.label);
        if (spot.type === 'checkbox') {
          element.type = 'checkbox';
          element.checked = Boolean(values.get(spot.name));
          element.addEventListener('change', () => values.set(spot.name, element.checked));
        } else {
          element.type = 'text';
          element.autocomplete = 'off';
          element.value = values.get(spot.name) || '';
          element.addEventListener('input', () => values.set(spot.name, element.value));
        }
      }
      place(element, spot.box);
      layer.append(element);
    });
    return layer;
  };

  /* --- Rendering ---------------------------------------------------------- */
  const updateControls = () => {
    controls.querySelector('[data-page-prev]').disabled = pageIndex === 0;
    controls.querySelector('[data-page-next]').disabled = pageIndex === pages.length - 1;
    controls.querySelector('select').value = String(pageIndex);
    controls.querySelector('[data-page-announcement]').textContent = 'Página ' + (pageIndex + 1) + ' de ' + pages.length;
    const back = controls.querySelector('[data-page-back]');
    back.hidden = !history.length;
    if (history.length) back.textContent = '↩ Volver a la página ' + (history[history.length - 1] + 1);
    root.querySelectorAll('[data-stage-prev]').forEach(button => { button.disabled = pageIndex === 0; });
    root.querySelectorAll('[data-stage-next]').forEach(button => { button.disabled = pageIndex === pages.length - 1; });
  };

  const preload = index => {
    if (index < 0 || index >= pages.length || pages[index].preloaded) return;
    pages[index].preloaded = true;
    const image = new Image();
    image.src = root.dataset.preview + '/' + pages[index].src;
  };

  const render = () => {
    const page = pages[pageIndex];
    const version = ++renderVersion;
    const next = document.createElement('div');
    next.className = 'pdf-sheet';
    const image = document.createElement('img');
    image.className = 'pdf-sheet__page';
    image.width = page.width;
    image.height = page.height;
    image.decoding = 'async';
    image.alt = 'Página ' + (pageIndex + 1) + ' de ' + pages.length + '. ' + (page.text?.replace(/\s+/g, ' ').trim().slice(0, 180) || title);
    next.append(image, buildSpots(page));
    setState('loading', 'Abriendo página ' + (pageIndex + 1) + '…');
    image.addEventListener('load', () => {
      if (disposed || version !== renderVersion) return;
      sheet?.remove();
      sheet = next;
      stage.querySelector('.pdf-stage__viewport').append(sheet);
      fit();
      placeholder.hidden = true;
      setState('ready', 'Página ' + (pageIndex + 1) + ' de ' + pages.length);
      preload(pageIndex + 1);
      preload(pageIndex - 1);
    }, { once: true });
    image.addEventListener('error', () => {
      if (disposed || version !== renderVersion) return;
      placeholder.hidden = false;
      setState('error', 'La página no se cargó. Reintenta o abre el PDF original.');
      retry.hidden = false;
      retry.textContent = 'Reintentar';
    }, { once: true });
    image.src = root.dataset.preview + '/' + page.src;
    updateControls();
  };

  const go = (index, { remember = false } = {}) => {
    if (!pages || index < 0 || index >= pages.length || index === pageIndex) return;
    if (remember) history.push(pageIndex);
    pageIndex = index;
    render();
  };

  const buildControls = () => {
    controls = document.createElement('div');
    controls.className = 'pdf-pagination';
    controls.innerHTML = '<button type="button" data-page-prev aria-label="Página anterior">←</button>'
      + '<label class="pdf-pagination__select"><span class="visually-hidden">Elegir página</span><select></select></label>'
      + '<button type="button" data-page-next aria-label="Página siguiente">→</button>'
      + '<button type="button" class="pdf-pagination__back" data-page-back hidden></button>'
      + '<button type="button" class="pdf-pagination__full" data-pdf-fullscreen>Pantalla completa</button>'
      + '<span class="visually-hidden" role="status" data-page-announcement></span>';
    const select = controls.querySelector('select');
    pages.forEach((_, index) => select.add(new Option('Página ' + (index + 1) + ' de ' + pages.length, String(index))));
    select.addEventListener('change', () => go(Number(select.value)), { signal });
    controls.querySelector('[data-page-prev]').addEventListener('click', () => go(pageIndex - 1), { signal });
    controls.querySelector('[data-page-next]').addEventListener('click', () => go(pageIndex + 1), { signal });
    controls.querySelector('[data-page-back]').addEventListener('click', () => {
      if (!history.length) return;
      pageIndex = history.pop();
      render();
    }, { signal });
    const fullscreen = controls.querySelector('[data-pdf-fullscreen]');
    if (!root.requestFullscreen) fullscreen.hidden = true;
    fullscreen.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else root.requestFullscreen().catch(() => {});
    }, { signal });
    document.addEventListener('fullscreenchange', () => {
      fullscreen.textContent = document.fullscreenElement === root ? 'Salir de pantalla completa' : 'Pantalla completa';
    }, { signal });
    root.querySelector('.pdf-toolbar').after(controls);

    // Large side arrows on the stage itself.
    const viewport = document.createElement('div');
    viewport.className = 'pdf-stage__viewport';
    const arrow = (direction, label) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pdf-stage__arrow pdf-stage__arrow--' + direction;
      button.setAttribute(direction === 'prev' ? 'data-stage-prev' : 'data-stage-next', '');
      button.setAttribute('aria-label', label);
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (direction === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '"/></svg>';
      button.addEventListener('click', () => go(pageIndex + (direction === 'prev' ? -1 : 1)), { signal });
      return button;
    };
    stage.append(arrow('prev', 'Página anterior'), viewport, arrow('next', 'Página siguiente'));
  };

  /* --- Keyboard and swipe ------------------------------------------------- */
  stage.tabIndex = 0;
  stage.addEventListener('keydown', event => {
    if (event.target.matches('input')) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); go(pageIndex + 1); }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); go(pageIndex - 1); }
  }, { signal });
  let swipeStart = null;
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse') swipeStart = { x: event.clientX, y: event.clientY };
  }, { signal });
  stage.addEventListener('pointerup', event => {
    if (!swipeStart) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.5) go(pageIndex + (dx < 0 ? 1 : -1));
  }, { signal });

  /* --- Loading ------------------------------------------------------------ */
  const load = async () => {
    if (disposed || loading) return;
    if (pages) { render(); return; }
    loading = true;
    observer?.disconnect();
    setState('loading', 'Preparando el documento…');
    retry.hidden = true;
    try {
      const response = await fetch(root.dataset.preview + '/pages.json', { signal });
      if (!response.ok) throw new Error('Document unavailable');
      pages = await response.json();
      if (disposed) return;
      if (!Array.isArray(pages) || !pages.length) throw new Error('Empty document');
      buildControls();
      render();
    } catch {
      if (disposed) return;
      pages = undefined;
      setState('error', 'No pudimos cargar el documento. Reintenta o ábrelo en otra pestaña.');
      retry.hidden = false;
      retry.textContent = 'Reintentar';
    } finally { loading = false; }
  };

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) load();
  }, { rootMargin: '240px 0px' }) : null;
  retry.addEventListener('click', load, { signal });
  if (observer) observer.observe(root);
  else load();

  return {
    destroy() {
      disposed = true;
      abort.abort();
      observer?.disconnect();
      resizeObserver.disconnect();
    }
  };
}
