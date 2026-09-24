/**
 * Perfiles institucionales aprobados de INFECTUS.
 *
 * Contrato: { id, name, role, credentials, summary, bio[], photo }
 * - `credentials`: formación académica tal y como la entrega la institución.
 * - `summary`: resumen corto para la tarjeta (2–3 líneas).
 * - `bio`: párrafos del perfil extendido; se muestran al desplegar la tarjeta.
 * - `photo`: ruta a una imagen local en /images/team/. Mientras sea `null`, la
 *   tarjeta muestra un monograma neutro. Para publicar una fotografía autorizada
 *   basta con sustituir `null` por su ruta, sin tocar el componente.
 *
 * No añadir personas que la institución no haya aprobado.
 */
export const approvedProfiles = [
  {
    id: 'david-forero',
    name: 'David A. Forero Peña',
    role: 'Gerente',
    credentials: 'Médico Internista · Infectólogo · Docente universitario',
    summary:
      'Médico internista, infectólogo y docente universitario con amplia experiencia en el manejo de enfermedades infecciosas.',
    bio: [
      'Combina la práctica clínica con la investigación en enfermedades tropicales, VIH y epidemiología de eventos transmisibles.',
      'En el entorno hospitalario se ha desempeñado como coordinador de Programas de Control y Prevención de Infecciones. Su experiencia incluye decisiones terapéuticas basadas en evidencia, contención de la resistencia bacteriana y seguridad del paciente.',
      'Como Gerente de INFECTUS lidera la visión estratégica de la organización y la transformación de la evidencia médica en soluciones sostenibles orientadas a la excelencia clínica y la seguridad del paciente.',
    ],
    photo: null,
  },
  {
    id: 'paola-tulcan',
    name: 'Paola Tulcán Moncayo',
    role: 'Subgerente de Servicios de Salud',
    credentials: 'Médica · Magíster en Epidemiología · Especialista en Gerencia y Auditoría de la Calidad en Salud (c)',
    summary:
      'Integra criterio clínico, epidemiología, administración y aseguramiento de la calidad asistencial en el abordaje de las enfermedades transmisibles.',
    bio: [
      'Su experiencia reúne el trabajo con enfermedades transmisibles, el criterio clínico, la epidemiología, la administración y el aseguramiento de la calidad asistencial.',
      'Como Médico PROA trabaja en la optimización de antibióticos, la contención de la resistencia bacteriana, la auditoría del riesgo clínico y los estándares de acreditación.',
    ],
    photo: null,
  },
  {
    id: 'natalia-gallego',
    name: 'Natalia S. Gallego Eraso',
    role: 'Subgerente de Gestión Integral de Salud',
    credentials: 'Enfermera · Magíster en Administración en Salud · Magíster en Epidemiología',
    summary:
      'Articula la gestión clínica con la dirección estratégica a partir de la investigación clínica y aplicada y del diseño de modelos de atención.',
    bio: [
      'Su experiencia abarca la investigación clínica y aplicada, el diseño de modelos de atención y la articulación entre la gestión clínica y la dirección estratégica.',
      'Trabaja en Programas de IAAS, aseguramiento de la calidad, estrategias epidemiológicas, educación, optimización de procesos, gestión de brotes y decisiones basadas en evidencia científica.',
    ],
    photo: null,
  },
  {
    id: 'magda-forero',
    name: 'Magda A. Forero Peña',
    role: 'Médico Epidemióloga',
    credentials: 'Médica · Especialista en Epidemiología',
    summary:
      'Experiencia clínica en hospitalización, consulta prioritaria, consulta externa y atención domiciliaria de pacientes crónicos y paliativos.',
    bio: [
      'Su trayectoria clínica incluye hospitalización, consulta prioritaria, consulta externa y atención domiciliaria de pacientes crónicos y paliativos.',
      'En INFECTUS trabaja en el diseño, el análisis y la monitorización de indicadores PROA, algoritmos terapéuticos, perfiles de morbilidad, resistencia bacteriana, guías de práctica clínica, toma de decisiones y seguridad del paciente en IPS.',
    ],
    photo: null,
  },
  {
    id: 'angelica-ojeda',
    name: 'Angélica María Ojeda Enríquez',
    role: 'Médica PROA',
    credentials: 'Médica General · Especialista en Gerencia y Auditoría de la Calidad en Salud (c)',
    summary:
      'Experiencia en instituciones de mediana y alta complejidad, paciente crítico, urgencias de tercer nivel y Atención Primaria en Salud.',
    bio: [
      'Ha trabajado en instituciones de mediana y alta complejidad, con paciente crítico, urgencias de tercer nivel, Equipos Básicos de Salud y Atención Primaria en Salud.',
      'En PROA se ocupa de la vigilancia activa, la auditoría de terapias antimicrobianas, la contención de la resistencia bacteriana, la calidad asistencial y la seguridad del paciente.',
    ],
    photo: null,
  },
  {
    id: 'daniel-lopez',
    name: 'Daniel Felipe López Herrera',
    role: 'Médico PROA',
    credentials: 'Médico General',
    summary:
      'Experiencia en el diseño, la implementación y la evaluación de programas PROA en instituciones de mediana y alta complejidad.',
    bio: [
      'Su experiencia comprende el diseño, la implementación y la evaluación de programas PROA en instituciones de mediana y alta complejidad, además de la auditoría de calidad asistencial y la asesoría técnica.',
      'Trabaja en enfermedades transmisibles, articulación con comités IAAS, decisiones clínicas basadas en evidencia y salud pública territorial.',
    ],
    photo: null,
  },
];
