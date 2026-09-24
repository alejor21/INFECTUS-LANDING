/**
 * Reusable, accessible Infectus wordmark. The visual mark is generated from
 * the approved brand asset through CSS, allowing its color field to animate.
 */
export function createHeaderBrand() {
  const link = document.createElement('a');
  link.className = 'header-brand';
  link.href = 'index.html';
  link.setAttribute('aria-label', 'Infectus, inicio');

  const wordmark = document.createElement('span');
  wordmark.className = 'header-brand__wordmark';
  wordmark.setAttribute('aria-hidden', 'true');
  link.append(wordmark);

  return link;
}
