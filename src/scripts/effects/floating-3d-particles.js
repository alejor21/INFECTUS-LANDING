import { byTier } from '../quality.js';

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

const toRgb = hex => {
  const parsed = Number.parseInt(hex.replace('#', ''), 16);
  return `${(parsed >> 16) & 255}, ${(parsed >> 8) & 255}, ${parsed & 255}`;
};

const createParticle = (width, height, options) => ({
  x: Math.random() * width,
  y: Math.random() * height,
  z: Math.random(),
  size: options.size * (0.55 + Math.random() * 1.25),
  drift: options.drift * (0.45 + Math.random() * 0.9),
  phase: Math.random() * Math.PI * 2,
  opacity: options.opacity * (0.5 + Math.random() * 0.7)
});

export const initFloating3DParticles = (container, options = {}) => {
  if (!container) return null;

  const config = {
    quantity: 132, color: getComputedStyle(container).getPropertyValue('--infectus-primary').trim(), accentColor: getComputedStyle(container).getPropertyValue('--infectus-light').trim(), size: 3.1,
    opacity: 0.27, drift: 0.045, depth: 0.56, connectionDistance: 82,
    maxConnections: 46, maxDevicePixelRatio: 1.5, ...options
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-particles__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.append(canvas);

  const context = canvas.getContext('2d', { alpha: true });
  if (!context) { canvas.remove(); return null; }

  let width = 1;
  let height = 1;
  let particles = [];
  let frameId = 0;
  let visible = true;
  let destroyed = false;
  let lastFrame = performance.now();
  const primary = toRgb(config.color);
  const accent = toRgb(config.accentColor);

  const tierScale = byTier({ low: 0.35, balanced: 0.7, high: 1 });

  const particleCount = () => {
    if (window.innerWidth < 768) return Math.round(config.quantity * 0.24 * tierScale);
    if (window.innerWidth < 1025) return Math.round(config.quantity * 0.62 * tierScale);
    return Math.round(config.quantity * tierScale);
  };

  const project = particle => {
    const perspective = 0.62 + particle.z * config.depth;
    return {
      x: particle.x,
      y: particle.y,
      scale: perspective,
      radius: Math.max(0.7, particle.size * perspective),
      alpha: particle.opacity * (0.48 + particle.z * 0.72)
    };
  };

  const clear = () => context.clearRect(0, 0, width, height);

  const draw = () => {
    clear();
    const projected = particles.map(project);
    let connections = 0;
    context.lineWidth = 0.65;
    const maxDistanceSquared = config.connectionDistance * config.connectionDistance;
    for (let index = 0; index < projected.length && connections < config.maxConnections; index += 1) {
      for (let next = index + 1; next < projected.length && connections < config.maxConnections; next += 1) {
        const dx = projected[index].x - projected[next].x;
        const dy = projected[index].y - projected[next].y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared > maxDistanceSquared) continue;
        const distance = Math.sqrt(distanceSquared);
        const alpha = (1 - distance / config.connectionDistance) * 0.13 * Math.min(projected[index].alpha, projected[next].alpha) / config.opacity;
        context.strokeStyle = `rgba(${primary}, ${alpha})`;
        context.beginPath();
        context.moveTo(projected[index].x, projected[index].y);
        context.lineTo(projected[next].x, projected[next].y);
        context.stroke();
        connections += 1;
      }
    }
    projected.sort((first, second) => first.scale - second.scale).forEach((point, index) => {
      context.beginPath();
      context.fillStyle = `rgba(${index % 9 === 0 ? accent : primary}, ${point.alpha})`;
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fill();
    });
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, config.maxDevicePixelRatio);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: particleCount() }, () => createParticle(width, height, config));
    draw();
  };

  const move = delta => {
    particles.forEach(particle => {
      particle.phase += delta * 0.00055;
      particle.y -= particle.drift * delta;
      particle.x += Math.sin(particle.phase) * particle.drift * delta * 0.33;
      particle.z += Math.sin(particle.phase * 0.65) * delta * 0.000025;
      particle.z = clamp(particle.z, 0.05, 1);
      if (particle.y < -14) { particle.y = height + 14; particle.x = Math.random() * width; }
      if (particle.x < -14) particle.x = width + 14;
      if (particle.x > width + 14) particle.x = -14;
    });
  };

  const canAnimate = () => !destroyed && visible && !document.hidden && !reducedMotion.matches;
  const requestFrame = () => { if (!frameId && canAnimate()) frameId = requestAnimationFrame(render); };
  const render = now => {
    frameId = 0;
    if (!canAnimate()) return;
    const delta = Math.min(now - lastFrame, 32);
    lastFrame = now;
    move(delta);
    draw();
    requestFrame();
  };
  const pause = () => { cancelAnimationFrame(frameId); frameId = 0; };
  const onVisibility = () => { if (document.hidden) pause(); else { lastFrame = performance.now(); requestFrame(); } };
  const onReducedMotion = () => { pause(); if (reducedMotion.matches) draw(); else { lastFrame = performance.now(); requestFrame(); } };

  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) pause(); else { lastFrame = performance.now(); requestFrame(); }
  }, { threshold: 0.02 });
  resizeObserver.observe(canvas);
  intersectionObserver.observe(container);
  document.addEventListener('visibilitychange', onVisibility);
  reducedMotion.addEventListener('change', onReducedMotion);
  resize();
  requestFrame();

  return {
    destroy() {
      destroyed = true;
      pause();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', onReducedMotion);
      canvas.remove();
    }
  };
};
