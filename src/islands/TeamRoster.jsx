import { useState } from 'react';
import { approvedProfiles } from '../data/team.js';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';

/**
 * TeamSpotlight — roster institucional de INFECTUS.
 *
 * En lugar de seis tarjetas iguales, una lista de integrantes gobierna un área
 * protagonista que muestra el perfil completo. Solo se publican los perfiles
 * aprobados; si un perfil no tiene retrato oficial, se usa un monograma neutro.
 *
 * No se agrupa por unidad de negocio porque la institución no ha asignado a
 * estas personas a INFECTUS Vaccine, Lab o Research.
 */

/**
 * Monograma del nombre y el primer apellido. En los nombres compuestos que usa
 * el equipo, el primer apellido es el penúltimo bloque ("Angélica María Ojeda
 * Enríquez" → AO); con dos bloques se toma el último.
 */
const initials = name => {
  const parts = name.split(/\s+/).filter(Boolean);
  const surname = parts.length >= 3 ? parts[parts.length - 2] : parts[parts.length - 1];
  return `${parts[0][0]}${surname[0]}`;
};

function Portrait({ profile }) {
  if (profile.photo) {
    return <img className="spotlight__photo" src={profile.photo} alt={profile.name} loading="lazy" width="640" height="800" />;
  }
  return <span className="spotlight__monogram" aria-hidden="true">{initials(profile.name)}</span>;
}

export default function TeamRoster() {
  const profiles = approvedProfiles.filter(profile => profile.name && profile.role);
  const [activeId, setActiveId] = useState(profiles[0]?.id);

  if (!profiles.length) {
    return (
      <p className="team-roster__status" role="status">
        Los perfiles del equipo se publicarán una vez la institución confirme su información.
      </p>
    );
  }

  const active = profiles.find(profile => profile.id === activeId) ?? profiles[0];

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div className="spotlight">
          <div className="spotlight__index" role="group" aria-label="Integrantes del equipo">
            <p className="spotlight__count">{profiles.length} profesionales</p>
            <ul className="spotlight__list">
              {profiles.map((profile, index) => {
                const isActive = profile.id === active.id;
                return (
                  <li key={profile.id}>
                    <button
                      type="button"
                      className="spotlight__entry"
                      aria-pressed={isActive}
                      aria-controls="spotlight-panel"
                      onClick={() => setActiveId(profile.id)}
                      onFocus={() => setActiveId(profile.id)}
                    >
                      <span className="spotlight__entry-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                      <span className="spotlight__avatar" aria-hidden="true">
                        {profile.photo
                          ? <img src={profile.photo} alt="" loading="lazy" width="80" height="100" />
                          : initials(profile.name)}
                      </span>
                      <span className="spotlight__entry-body">
                        <strong>{profile.name}</strong>
                        <span>{profile.role}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <m.article
            id="spotlight-panel"
            className="spotlight__panel"
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            aria-live="polite"
          >
            <div className="spotlight__portrait">
              <Portrait profile={active} />
            </div>
            <div className="spotlight__body">
              <p className="spotlight__role">{active.role}</p>
              <h3 className="spotlight__name">{active.name}</h3>
              <p className="spotlight__credentials">{active.credentials}</p>
              <p className="spotlight__summary">{active.summary}</p>
              {active.bio?.map((paragraph, position) => (
                <p key={position} className="spotlight__bio">{paragraph}</p>
              ))}
            </div>
          </m.article>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
