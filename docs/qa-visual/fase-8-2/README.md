# Fase 8.2 — Cierre definitivo del rediseño

## Evidencia visual

Esta carpeta conserva las capturas generadas durante la revisión visual. Se mantienen únicamente capturas reales; no se inventaron estados para las vistas que no pudieron capturarse después de agotar la cuota del navegador integrado.

- Escritorio: Home, Nosotros, Servicios, Actualidad, Contacto, footer, DriftWall, BorderGlow y Equipo.
- Móvil: Home, Servicios y Actualidad.
- Pendientes de captura: `nosotros-390.png` y `contacto-390.png`.

## Auditoría realizada

| Área | Resultado | Evidencia |
| --- | --- | --- |
| Fase 8.2 | NO APROBADA | Falta completar dos capturas móviles y repetir el build tras los últimos ajustes menores. |
| Rediseño visual | TERMINADO | Composición editorial, fondos integrados, capas de imagen y motion preservados. |
| Home | TERMINADA | `home-1440.png`, `home-390.png` |
| Nosotros | TERMINADA | `nosotros-1440.png`, `driftwall-1440.png`, `equipo-1440.png` |
| Servicios | TERMINADA | `servicios-1440.png`, `servicios-390.png` |
| Actualidad | TERMINADA | `actualidad-1440.png`, `actualidad-390.png` |
| Contacto | TERMINADA | `contacto-1440.png` |
| Paleta oficial | VALIDADA | Tokens corporativos Infectus, Vaccine, Research y Lab en `src/styles/tokens.css`. |
| Tipografía | VALIDADA | Jerarquía editorial consistente; sin fuentes externas nuevas ni dependencias. |
| Hero | VALIDADO | Fondo azul corporativo, imágenes escalonadas, carrusel, partículas y efecto de cursor. |
| AccordionGallery | VALIDADO | Ramas Vaccine, Research y Lab con claims visibles y navegación semántica. |
| DriftWall | VALIDADO | Movimiento lento, pausa accesible, parallax y soporte para reduced motion. |
| BorderGlow | VALIDADO | Brillo contextual por proximidad del puntero y degradado de marca. |
| Nuestro equipo | PREPARADO | Estructura lista para perfiles aprobados; no se inventaron personas ni cargos. |
| Header | VALIDADO | Header compacto, responsive, integrado con el hero y navegación de áreas actualizada. |
| Footer | VALIDADO | Footer corporativo de cuatro columnas con marca, claim y contacto. |
| Responsive | REQUIERE AJUSTES | Matriz de anchos sin overflow validada; faltan las dos capturas móviles finales. |
| Overflow horizontal | VALIDADO | `scrollWidth` coincide con `clientWidth` en las cinco páginas y seis anchos revisados. |
| Accesibilidad básica | VALIDADA | Menú Escape, pausa DriftWall, labels de formulario y botón de envío deshabilitado sin backend. |
| Build | PASS | Última compilación válida de Vite: 91 módulos, sin errores. El rerun final quedó bloqueado por `spawn EPERM`/cuota del entorno. |
| Siguiente paso | SOLO CONTENIDO FINAL, EQUIPO REAL, BACKEND, SEO/PERFORMANCE Y PRODUCCIÓN | No añadir más cambios visuales hasta completar la evidencia móvil pendiente. |

## Bloqueos técnicos

La cuota del navegador integrado se agotó durante la última ronda de capturas. El entorno devolvió `You've hit your usage limit`; por eso no se fabricaron `nosotros-390.png` ni `contacto-390.png`. El build anterior pasó correctamente; el intento posterior fue bloqueado por permisos del proceso de `esbuild` (`spawn EPERM`), no por un error de código reportado por Vite.
