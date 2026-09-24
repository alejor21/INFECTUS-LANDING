/**
 * Mounts React islands only when their host element approaches the viewport.
 * React and Framer Motion stay out of the critical path: nothing is fetched
 * until an island is actually about to be seen.
 */
const registry = {
  'team-roster': () => import('../islands/mount-team-roster.jsx'),
};

const MARGIN = 400;

export function initIslands() {
  const hosts = [...document.querySelectorAll('[data-island]')].filter(host => registry[host.dataset.island]);
  if (!hosts.length) return;

  const mount = host => {
    if (host.dataset.islandState) return;
    host.dataset.islandState = 'loading';
    registry[host.dataset.island]()
      .then(({ default: mountIsland }) => {
        mountIsland(host);
        host.dataset.islandState = 'ready';
      })
      .catch(() => {
        host.dataset.islandState = 'failed';
        const fallback = host.querySelector('[data-island-placeholder]');
        if (fallback) fallback.textContent = 'Los perfiles del equipo se publicarán próximamente. Puedes conocer nuestras áreas más abajo.';
      });
  };

  const isNear = host => {
    const rect = host.getBoundingClientRect();
    return rect.top < window.innerHeight + MARGIN && rect.bottom > -MARGIN;
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      mount(entry.target);
    });
  }, { rootMargin: `${MARGIN}px 0px` });

  hosts.forEach(host => {
    // Synchronous proximity check first: an island already in reach must not
    // depend on the observer's first callback, which never arrives while the
    // document is not being rendered.
    if (isNear(host)) {
      observer.unobserve(host);
      mount(host);
      return;
    }
    observer.observe(host);
  });
}
