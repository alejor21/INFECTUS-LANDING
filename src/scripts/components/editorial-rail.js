/**
 * Tab strip for the editorial formats on Actualidad.
 * Formats describe the sections themselves: no publication, author or date
 * is fabricated here. Published entries will follow the schema documented in
 * the page markup.
 */
export function initEditorialRail(root) {
  if (!root) return null;
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  if (!tabs.length || tabs.length !== panels.length) return null;

  const abort = new AbortController();

  const select = (index, { focus = false } = {}) => {
    tabs.forEach((tab, current) => {
      const isActive = current === index;
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      panels[current].hidden = !isActive;
      panels[current].classList.toggle('is-active', isActive);
    });
    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index), { signal: abort.signal });
    tab.addEventListener('keydown', event => {
      const lastIndex = tabs.length - 1;
      let next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index === lastIndex ? 0 : index + 1;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index === 0 ? lastIndex : index - 1;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = lastIndex;
      if (next === null) return;
      event.preventDefault();
      select(next, { focus: true });
    }, { signal: abort.signal });
  });

  select(0);
  return { destroy() { abort.abort(); } };
}
