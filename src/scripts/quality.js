/**
 * Small device heuristic shared by every ambient effect.
 * Resolved once per page load: tier decisions here must stay cheap and stable.
 */
const coarsePointer = matchMedia('(pointer: coarse)').matches;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = navigator.connection?.saveData === true;
const cores = navigator.hardwareConcurrency || 8;
const density = window.devicePixelRatio || 1;
const narrow = window.innerWidth < 768;

const resolveTier = () => {
  if (reducedMotion || saveData || cores <= 4) return 'low';
  if (narrow || coarsePointer || (cores <= 6 && density > 2)) return 'balanced';
  return 'high';
};

export const qualityTier = resolveTier();
export const isLowTier = qualityTier === 'low';
export const prefersReducedMotion = reducedMotion;

/** Pick a value for the active tier, falling back to the nearest richer definition. */
export const byTier = ({ low, balanced, high }) => {
  if (qualityTier === 'low') return low ?? balanced ?? high;
  if (qualityTier === 'balanced') return balanced ?? high ?? low;
  return high ?? balanced ?? low;
};

document.documentElement.dataset.performance = qualityTier;
