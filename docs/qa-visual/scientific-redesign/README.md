# Cierre visual científico

La ejecución final integra tres recursos científicos vectoriales ligeros y el asset 3D de jeringa disponible en `assets/Syringe_assembles_fills_202603241639.mp4`.

## Implementado

- Home con ramas enlazadas a `vaccine.html`, `research.html` y `labs.html`, partículas y composición editorial azul.
- Servicios con hero de vial 3D, narrativa de servicios y portafolio institucional embebido.
- Actualidad con hero molecular, biblioteca editorial y estados preparados para contenido aprobado.
- Equipo con hero fotográfico, filtros por área y slots sin nombres inventados.
- Vaccine con identidad turquesa, logo correcto, vial 3D, video 3D de jeringa y PDF de vacunación.
- Research con identidad azul, logo correcto y doble hélice editorial.
- Labs con identidad azul-cian, logo correcto y objeto de placa/pipeta.

## PDF

Los dos PDF originales se conservan íntegros en `public/pdfs/`. La página muestra una vista paginada lazy de cada documento, con zoom, selección de página, lectura dentro de la web y acceso al PDF original para mantener enlaces y campos interactivos.

## Verificación

- Layout comprobado en 390, 768 y 1920 px para las páginas de contenido (incluidas las tres ramas científicas); la matriz automatizada cubre diez HTML.
- Sin overflow horizontal.
- Un H1 por página.
- Enlaces locales revisados: 0 rutas rotas.
- `node --check` pasado para los módulos JavaScript modificados.
- `git diff --check` pasado; solo reporta conversión normal de finales de línea CRLF.
- La última compilación de Vite pasó antes del último ajuste del video; el rerun posterior quedó bloqueado por la cuota de ejecución del entorno.
- La captura visual posterior al último ajuste del video no pudo repetirse porque el navegador integrado alcanzó su cuota; no se intentó rodear ese bloqueo.
