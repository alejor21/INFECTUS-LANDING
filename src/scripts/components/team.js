/** Populate only with approved profiles: photo, name, role, area, bio, href (optional). */
export function initTeam(container, profiles = []) {
  const template = document.querySelector('.team-member-template');
  if (!container || !template) return;
  container.replaceChildren();
  for (const profile of profiles) {
    if (!profile.name || !profile.photo || !profile.role) continue;
    const card = template.content.cloneNode(true);
    const img = card.querySelector('img');
    const photo = new URL(profile.photo, location.href);
    if (photo.origin !== location.origin) continue;
    img.src = photo.href; img.alt = profile.name;
    card.querySelector('h3').textContent = profile.name;
    card.querySelector('.team-member__role').textContent = profile.role;
    card.querySelector('.team-member__specialty').textContent = profile.area || '';
    card.querySelector('.team-member__bio').textContent = profile.bio || '';
    const link = card.querySelector('a');
    const href = profile.href && new URL(profile.href, location.href);
    if (href && ['https:', 'http:'].includes(href.protocol)) { link.href = href.href; link.textContent = `Conocer a ${profile.name}`; }
    else link.remove();
    container.append(card);
  }
  container.hidden = !container.children.length;
}
