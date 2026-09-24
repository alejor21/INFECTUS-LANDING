/**
 * Marks the service currently in view in the sticky side index.
 * A single IntersectionObserver drives it: no scroll listener, no per-frame work.
 */
export function initServicesProgress(nav) {
  if (!nav) return null;
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const panels = links
    .map(link => document.getElementById(decodeURIComponent(link.hash.slice(1))))
    .filter(Boolean);
  if (panels.length !== links.length || !panels.length) return null;

  const setActive = id => {
    links.forEach(link => {
      const isActive = link.hash.slice(1) === id;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const visible = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    const first = panels.find(panel => visible.has(panel));
    if (first) setActive(first.id);
  }, { rootMargin: '-35% 0px -50% 0px', threshold: 0 });

  panels.forEach(panel => observer.observe(panel));
  setActive(panels[0].id);
  return { destroy() { observer.disconnect(); } };
}
