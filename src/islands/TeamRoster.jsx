import { approvedProfiles } from '../data/team.js';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';

/**
 * Roster institucional de INFECTUS.
 *
 * Solo se publican los perfiles aprobados por la institución. Mientras un perfil
 * no tenga fotografía autorizada, la tarjeta muestra un monograma neutro: el
 * nombre, el cargo y la biografía sí son información oficial y se publican.
 * No se agrupa por unidad de negocio porque la institución no ha asignado a
 * estas personas a INFECTUS Vaccine, Lab o Research.
 */
const reveal = {
  hidden: { opacity: 0, y: 18 },
  visible: index => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] } }),
};

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

function ProfileCard({ profile, index }) {
  return (
    <m.article
      className="roster-slot"
      custom={index}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="roster-slot__portrait">
        <span className="roster-slot__index">{String(index + 1).padStart(2, '0')}</span>
        {profile.photo ? (
          <img className="roster-slot__profile-photo" src={profile.photo} alt={profile.name} loading="lazy" width="480" height="480" />
        ) : (
          <span className="roster-slot__monogram" aria-hidden="true">{initials(profile.name)}</span>
        )}
      </div>
      <div className="roster-slot__body">
        <p className="roster-slot__area">{profile.role}</p>
        <h3 className="roster-slot__name">{profile.name}</h3>
        <p className="roster-slot__track">{profile.credentials}</p>
        <p>{profile.summary}</p>
        {profile.bio?.length ? (
          <details className="roster-slot__detail">
            <summary>Ver perfil completo</summary>
            <div className="roster-slot__detail-body">
              {profile.bio.map((paragraph, position) => (
                <p key={position}>{paragraph}</p>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </m.article>
  );
}

export default function TeamRoster() {
  const profiles = approvedProfiles.filter(profile => profile.name && profile.role);

  if (!profiles.length) {
    return (
      <p className="team-roster__status" role="status">
        Los perfiles del equipo se publicarán una vez la institución confirme su información.
      </p>
    );
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div className="team-roster">
          <p className="team-roster__status" role="status">
            {profiles.length} profesionales en el equipo de INFECTUS.
          </p>
          <div className="team-roster__grid">
            {profiles.map((profile, index) => (
              <ProfileCard key={profile.id} profile={profile} index={index} />
            ))}
          </div>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
