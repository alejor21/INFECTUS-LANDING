export function initNavigation() {
  const header = document.querySelector('.site-header');
  const primaryHero = document.querySelector('.home-hero, .about-hero, .services-hero, .contact-hero, .blog-hero, .team-hero');
  if (header) {
    const updateHeader = () => {
      const hasLeftHero = !primaryHero || primaryHero.getBoundingClientRect().bottom <= 0;
      header.classList.toggle('is-hero-active', !hasLeftHero);
      header.classList.toggle('is-scrolled', hasLeftHero);
      header.classList.toggle('is-transparent', !hasLeftHero);
      header.classList.add('is-visible');
      header.classList.remove('is-hidden');
      header.inert = false;
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  const toggle = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('[data-main-nav]');
  if (!toggle || !navigation) return;

  const setOpen = (isOpen) => {
    navigation.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('menu-open', isOpen);
  };

  toggle.addEventListener('click', () => setOpen(!navigation.classList.contains('is-open')));
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) setOpen(false);
  });
}
