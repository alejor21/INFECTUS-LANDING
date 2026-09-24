export function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((element) => element.classList.add('is-revealed'));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  elements.forEach((element) => observer.observe(element));
}
