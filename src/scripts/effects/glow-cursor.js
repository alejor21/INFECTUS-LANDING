import { Mesh, Program, Renderer, Triangle } from 'ogl';

const MAX_POINTS = 40;

const VERTEX_SHADER = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAGMENT_SHADER = `
precision highp float;
#define MAX_POINTS 40
uniform vec2 uResolution;
uniform vec2 uPoints[MAX_POINTS];
uniform float uPointCount;
uniform vec3 uColor;
uniform vec3 uSecondaryColor;
uniform float uTrailWidth;
uniform float uTaper;
uniform float uGlowIntensity;
uniform float uGlowSpread;
uniform float uHotspot;
uniform float uBrightness;
uniform float uOpacity;
uniform float uPulseSpeed;
uniform float uNoiseStrength;
uniform float uTime;
uniform float uFade;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float grain(vec2 p, float time) { return hash(floor(p) + floor(time * 18.0)) * 2.0 - 1.0; }

void main() {
  vec2 pixel = vUv * uResolution;
  float denominator = max(uPointCount - 1.0, 1.0);
  float strongest = 0.0;
  float coreStrength = 0.0;
  float weight = 0.0;
  vec3 colorSum = vec3(0.0);

  for (int i = 0; i < MAX_POINTS - 1; i++) {
    float index = float(i);
    float active = 1.0 - step(uPointCount - 1.0, index);
    vec2 start = uPoints[i];
    vec2 end = uPoints[i + 1];
    vec2 segment = end - start;
    vec2 toPixel = pixel - start;
    float along = clamp(dot(toPixel, segment) / max(dot(segment, segment), 0.0001), 0.0, 1.0);
    float progress = clamp((index + along) / denominator, 0.0, 1.0);
    float life = pow(max(1.0 - progress, 0.0), mix(0.6, 1.25, uTaper));
    float width = uTrailWidth * mix(1.0, 0.22, pow(progress, mix(0.6, 1.5, uTaper)));
    float distanceToTrail = length(toPixel - segment * along);
    float falloff = max(width * (0.85 + uGlowSpread * 1.25), 0.5);
    float halo = min(1.0, (falloff * falloff) / (distanceToTrail * distanceToTrail + falloff * falloff));
    float core = exp(-pow(distanceToTrail / max(width, 0.5), 2.0) * 2.7);
    float pulse = 1.0 + sin(uTime * uPulseSpeed * 3.0 - progress * 10.0) * 0.12;
    float intensity = (core + halo * uGlowIntensity * 0.46) * life * pulse * active;
    strongest = max(strongest, intensity);
    coreStrength = max(coreStrength, core * life * active);
    colorSum += mix(uColor, uSecondaryColor, progress) * intensity;
    weight += intensity;
  }

  float alpha = clamp(strongest * uOpacity * uFade, 0.0, 1.0);
  if (alpha < 0.001) discard;
  vec3 color = colorSum / max(weight, 0.0001);
  color = mix(color, vec3(1.0), smoothstep(0.35, 1.0, coreStrength) * uHotspot);
  float noise = grain(pixel, uTime) * uNoiseStrength;
  float light = clamp(strongest * uBrightness * (1.0 + noise), 0.0, 1.0);
  gl_FragColor = vec4(color * light, alpha);
}
`;

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

const hexToRgb = hex => {
  const value = (hex || '#082D5B').replace('#', '').trim();
  const normalized = value.length === 3 ? value.split('').map(character => character + character).join('') : value;
  const parsed = Number.parseInt(normalized, 16);
  return [((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255];
};

export const initGlowCursor = (container, options = {}) => {
  if (!container || !window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const config = {
    color: getComputedStyle(container).getPropertyValue('--infectus-light').trim(), secondaryColor: getComputedStyle(container).getPropertyValue('--infectus-secondary').trim(), trailLength: 30, trailWidth: 7,
    trailTaper: 0.8, followSpeed: 0.125, glowIntensity: 1.72, glowSpread: 1.06,
    hotspot: 0.41, brightness: 1.14, opacity: 0.48, pulseSpeed: 0.58, noiseStrength: 0.02,
    idleTimeout: 700, fadeDuration: 900, maxDevicePixelRatio: 1.5, ...options
  };

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-glow__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.append(canvas);

  let renderer;
  let program;
  let mesh;
  let resizeObserver;
  let intersectionObserver;
  let frameId = 0;
  let destroyed = false;
  let isVisible = true;
  let isPointerInside = false;
  let initialized = false;
  let fade = 0;
  let lastInput = performance.now();
  let lastFrame = performance.now();
  const points = Array.from({ length: MAX_POINTS }, () => ({ x: 0, y: 0 }));
  const pointData = Array(MAX_POINTS * 2).fill(0);
  const target = { x: 0, y: 0 };
  const head = { x: 0, y: 0 };

  try {
    renderer = new Renderer({ canvas, alpha: true, dpr: Math.min(window.devicePixelRatio || 1, config.maxDevicePixelRatio) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uResolution: { value: [1, 1] }, uPoints: { value: pointData }, uPointCount: { value: config.trailLength },
        uColor: { value: hexToRgb(config.color) }, uSecondaryColor: { value: hexToRgb(config.secondaryColor) },
        uTrailWidth: { value: config.trailWidth }, uTaper: { value: config.trailTaper }, uGlowIntensity: { value: config.glowIntensity },
        uGlowSpread: { value: config.glowSpread }, uHotspot: { value: config.hotspot }, uBrightness: { value: config.brightness },
        uOpacity: { value: config.opacity }, uPulseSpeed: { value: config.pulseSpeed }, uNoiseStrength: { value: config.noiseStrength },
        uTime: { value: 0 }, uFade: { value: 0 }
      }, transparent: true, depthTest: false, depthWrite: false
    });
    mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  } catch {
    canvas.remove();
    return null;
  }

  const resize = () => {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height);
    program.uniforms.uResolution.value = [width, height];
  };

  const updatePointer = event => {
    const rect = container.getBoundingClientRect();
    const x = clamp(event.clientX - rect.left, 0, rect.width);
    const y = clamp(rect.height - (event.clientY - rect.top), 0, rect.height);
    if (!initialized) {
      points.forEach(point => { point.x = x; point.y = y; });
      head.x = x; head.y = y; initialized = true;
    }
    target.x = x; target.y = y; isPointerInside = true; lastInput = performance.now();
  };

  const updateFade = now => {
    const idle = !isPointerInside || now - lastInput > config.idleTimeout;
    const targetFade = initialized && !idle ? 1 : 0;
    fade += (targetFade - fade) * Math.min(1, 116 / config.fadeDuration);
  };

  const render = now => {
    if (destroyed || !isVisible || document.hidden) return;
    const delta = Math.min((now - lastFrame) / 16.667, 3);
    lastFrame = now;
    if (initialized) {
      const follow = 1 - Math.pow(1 - clamp(config.followSpeed, 0.01, 0.99), delta);
      const chain = 1 - Math.pow(1 - clamp(0.28 + config.followSpeed * 0.35, 0.08, 0.92), delta);
      head.x += (target.x - head.x) * follow; head.y += (target.y - head.y) * follow;
      points[0] = { ...head };
      for (let index = 1; index < MAX_POINTS; index += 1) {
        points[index].x += (points[index - 1].x - points[index].x) * chain;
        points[index].y += (points[index - 1].y - points[index].y) * chain;
      }
      points.forEach((point, index) => { pointData[index * 2] = point.x; pointData[index * 2 + 1] = point.y; });
    }
    updateFade(now);
    program.uniforms.uTime.value = now * 0.001;
    program.uniforms.uFade.value = fade;
    renderer.render({ scene: mesh });
    frameId = requestAnimationFrame(render);
  };

  const resume = () => {
    if (!destroyed && isVisible && !document.hidden && !frameId) { lastFrame = performance.now(); frameId = requestAnimationFrame(render); }
  };
  const pause = () => { cancelAnimationFrame(frameId); frameId = 0; };
  const onVisibilityChange = () => { if (document.hidden) pause(); else resume(); };
  const onPointerLeave = () => { isPointerInside = false; lastInput = performance.now(); };

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  intersectionObserver = new IntersectionObserver(([entry]) => { isVisible = entry.isIntersecting; if (isVisible) resume(); else pause(); }, { threshold: 0.02 });
  intersectionObserver.observe(container);
  container.addEventListener('pointermove', updatePointer);
  container.addEventListener('pointerenter', updatePointer);
  container.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('visibilitychange', onVisibilityChange);
  resize();
  resume();

  return {
    destroy() {
      destroyed = true; pause(); resizeObserver.disconnect(); intersectionObserver.disconnect();
      container.removeEventListener('pointermove', updatePointer); container.removeEventListener('pointerenter', updatePointer);
      container.removeEventListener('pointerleave', onPointerLeave); document.removeEventListener('visibilitychange', onVisibilityChange);
      mesh.geometry.remove(); program.remove(); canvas.remove();
    }
  };
};
