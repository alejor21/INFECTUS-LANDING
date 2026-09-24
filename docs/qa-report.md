# QA global — Fase 6

## Alcance y resultado

Se revisaron `index.html`, `acerca-de.html`, `servicios.html`, `contacto.html` y `blog.html` en 1440, 1024, 768, 390, 375 y 1920 px. No se detectó overflow horizontal, enlaces ficticios, errores de consola ni imágenes fallidas tras completar la carga diferida.

## Correcciones aplicadas

- Se retiró `accordion.js` de la carga global: ninguna página pública tenía un acordeón asociado.
- Se actualizó la descripción del hero de Home en `docs/design-system.md` para que refleje el comportamiento actual en escritorio y móvil.

## Coherencia comprobada

- Header: logo, CTA, menú, estado activo y selector de áreas idénticos entre rutas. Home conserva el cambio transparente a sólido al hacer scroll.
- Footer: misma estructura, wordmark, navegación y tres áreas en todas las páginas.
- Diseño: tokens de color, escala tipográfica, gutters, radios y superficies se aplican de forma coherente; los fondos se concentran en Home, Contacto y Actualidad sin sobrecargar el resto.
- Accesibilidad: `lang="es"`, skip link, un único H1 por página, landmarks, foco visible, `aria-current`, menú con Escape y reduced motion están presentes.

## Assets sin referencia pública

No se eliminaron. Los siguientes assets en `public/brand/` no tienen referencia en las cinco páginas públicas: `infectus-mark-shield.png`, `infectus-primary.jpg`, `infectus-research-white.png`, `infectus-vaccine-white.png`, `infectus-wordmark-lowercase-white.png` e `infectus-wordmark-uppercase-white.png`.

## Pendientes para producción

| Prioridad | Pendiente | Acción recomendada |
|---|---|---|
| P1 | Imágenes PNG de producción | Convertir a WebP o AVIF con variantes responsivas. Las 11 imágenes pesan 16,93 MiB en conjunto; la mayor pesa 2,06 MB. |
| P1 | Formulario de contacto | Configurar backend, confirmación y política de tratamiento de datos antes de habilitar envío. |
| P2 | Favicon | Definir y aprobar un favicon de marca. |
| P2 | Tipografía | Integrar archivos autorizados de Montserrat/Milker solo cuando estén disponibles y licenciados. |

## Contenido

Los pendientes editoriales continúan concentrados en `docs/content-pending.md`; no se muestran como notas técnicas al visitante.
