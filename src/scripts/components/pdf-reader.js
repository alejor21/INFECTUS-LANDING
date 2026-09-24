/** Lazy reading pages plus the untouched native PDF. No client PDF renderer required. */
export function initPdfReader(root) {
  const stage = root.querySelector('.pdf-stage');
  const placeholder = root.querySelector('.pdf-placeholder');
  const status = root.querySelector('[data-pdf-status]');
  const retry = root.querySelector('[data-pdf-retry]');
  const nativeLabel = root.dataset.pdfSrc.includes('VACCINE') ? 'PDF original / interactivo' : 'PDF original';
  let frame;
  let timeout;
  let disposed = false;
  let pages;
  let pageIndex = 0;
  let loading = false;
  let controls;
  let image;
  let native = false;
  let imageVersion = 0;
  const abort = new AbortController();
  const setState = (state, message) => {
    root.dataset.state = state;
    stage.setAttribute('aria-busy', String(state === 'loading'));
    status.textContent = message;
  };
  const openNative = () => {
    if (disposed || frame) return;
    setState('loading', 'Abriendo el documento…');
    retry.hidden = true;
    frame = document.createElement('iframe');
    frame.title = root.querySelector('.pdf-toolbar > span').textContent;
    frame.className = 'pdf-frame';
    frame.src = root.dataset.pdfSrc + '#view=FitH';
    frame.addEventListener('load', () => {
      if (disposed || !native) return;
      clearTimeout(timeout);
      placeholder.hidden = true;
      setState('ready', 'Visor abierto.');
    }, { once: true });
    const failed = () => {
      if (disposed || !native) return;
      clearTimeout(timeout);
      frame?.remove();
      frame = null;
      setState('error', 'No pudimos abrir el visor. Reintenta o abre el PDF en otra pestaña.');
      retry.hidden = false;
      retry.textContent = 'Reintentar';
    };
    frame.addEventListener('error', failed, { once: true });
    // Keep a useful escape route if the browser never finishes initializing.
    timeout = window.setTimeout(failed, 25000);
    stage.append(frame);
  };
  const renderPage = () => {
    const page = pages[pageIndex];
    const version = ++imageVersion;
    placeholder.hidden = false;
    retry.hidden = true;
    setState('loading', 'Abriendo página ' + (pageIndex + 1) + '…');
    image?.remove();
    image = document.createElement('img');
    image.className = 'pdf-reading-page';
    image.width = page.width;
    image.height = page.height;
    image.alt = 'Página ' + (pageIndex + 1) + ' de ' + pages.length + '. ' + (page.text?.trim().slice(0,180) || 'Portafolio institucional de Infectus.');
    image.addEventListener('load', () => {
      if (disposed || version !== imageVersion || native) return;
      placeholder.hidden = true;
      setState('ready', 'Página ' + (pageIndex + 1) + ' de ' + pages.length);
    }, {once:true});
    image.addEventListener('error', () => {
      if (disposed || version !== imageVersion) return;
      setState('error', 'La página no se cargó. Reintenta o abre el PDF original.');
      retry.hidden = false;
      retry.textContent = 'Reintentar';
    }, {once:true});
    image.src = root.dataset.preview + '/' + page.src;
    stage.append(image);
    stage.scrollTop = 0;
    controls.querySelector('[data-page-prev]').disabled = pageIndex === 0;
    controls.querySelector('[data-page-next]').disabled = pageIndex === pages.length - 1;
    controls.querySelector('select').value = String(pageIndex);
    controls.querySelector('[data-page-announcement]').textContent = 'Página ' + (pageIndex + 1) + ' de ' + pages.length;
  };
  const load = async () => {
    if (disposed || loading) return;
    if (pages) { renderPage(); return; }
    loading = true;
    observer?.disconnect();
    setState('loading', 'Preparando el documento…');
    retry.hidden = true;
    try {
      const response = await fetch(root.dataset.preview + '/pages.json', {signal:abort.signal});
      if (!response.ok) throw new Error('Document unavailable');
      pages = await response.json();
      if (disposed) return;
      if (!Array.isArray(pages) || !pages.length) throw new Error('Empty document');
      controls = document.createElement('div');
      controls.className = 'pdf-pagination';
      controls.innerHTML = '<button type="button" data-page-prev aria-label="Página anterior">←</button><label>Página <select aria-label="Elegir página"></select></label><button type="button" data-page-next aria-label="Página siguiente">→</button><button type="button" data-pdf-zoom aria-pressed="false">Ampliar</button><button type="button" data-pdf-mode>PDF original / interactivo</button><span class="visually-hidden" role="status" data-page-announcement></span>';
      const select = controls.querySelector('select');
      controls.querySelector('[data-pdf-mode]').textContent = nativeLabel;
      controls.querySelector('[data-pdf-zoom]').addEventListener('click', event => {
        const zoomed = stage.classList.toggle('is-zoomed');
        event.currentTarget.setAttribute('aria-pressed', String(zoomed));
        event.currentTarget.textContent = zoomed ? 'Ajustar' : 'Ampliar';
      }, {signal:abort.signal});
      pages.forEach((_, index) => select.add(new Option(String(index+1) + ' / ' + pages.length, String(index))));
      select.addEventListener('change', () => {pageIndex = Number(select.value); renderPage();}, {signal:abort.signal});
      controls.querySelector('[data-page-prev]').addEventListener('click', () => {pageIndex--; renderPage();}, {signal:abort.signal});
      controls.querySelector('[data-page-next]').addEventListener('click', () => {pageIndex++; renderPage();}, {signal:abort.signal});
      controls.querySelector('[data-pdf-mode]').addEventListener('click', event => {
        native = !native;
        stage.classList.toggle('is-native', native);
        controls.querySelectorAll('[data-page-prev],[data-page-next],[data-pdf-zoom],label').forEach(element => element.hidden = native);
        event.currentTarget.textContent = native ? 'Volver a lectura' : nativeLabel;
        if (native) { image.hidden = true; placeholder.hidden = false; openNative(); }
        else { clearTimeout(timeout); frame?.remove(); frame = null; renderPage(); }
      }, {signal:abort.signal});
      root.querySelector('.pdf-toolbar').after(controls);
      renderPage();
    } catch (error) {
      if (disposed) return;
      pages = undefined;
      setState('error', 'No pudimos cargar la lectura. Reintenta o abre el PDF en otra pestaña.');
      retry.hidden = false;
      retry.textContent = 'Reintentar';
    } finally { loading = false; }
  };
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) load();
  }, { rootMargin: '160px 0px' }) : null;
  const retryLoad = () => native ? openNative() : load();
  retry.addEventListener('click', retryLoad);
  if (observer) observer.observe(root);
  else load();
  return { destroy() {
    disposed = true;
    clearTimeout(timeout);
    abort.abort();
    observer?.disconnect();
    retry.removeEventListener('click', retryLoad);
    frame?.remove();
  }};
}
