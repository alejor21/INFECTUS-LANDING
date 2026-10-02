/** Filtro por tema de las fuentes de referencia en Actualidad. */
export function initNewsFilter(root) {
  const chips = [...root.querySelectorAll('[data-news-filter]')];
  const items = [...document.querySelectorAll('[data-news-list] [data-topic]')];
  const status = document.querySelector('[data-news-status]');
  if (!chips.length || !items.length) return null;
  const abort = new AbortController();

  const apply = topic => {
    chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.newsFilter === topic)));
    let visible = 0;
    items.forEach(item => {
      const show = topic === 'todas' || item.dataset.topic === topic;
      item.hidden = !show;
      if (show) visible += 1;
    });
    if (status) status.textContent = visible + (visible === 1 ? ' fuente' : ' fuentes');
  };

  chips.forEach(chip => chip.addEventListener('click', () => apply(chip.dataset.newsFilter), { signal: abort.signal }));
  return { destroy() { abort.abort(); } };
}
