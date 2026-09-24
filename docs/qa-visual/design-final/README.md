# QA visual — Fase D1 (cierre de diseño)

Las cuatro páginas rediseñadas se revisaron en navegador a 1440, 1024, 768, 390 y 375 px:

- `modelo-de-negocio.html`
- `servicios.html`
- `equipo.html`
- `blog.html`

Y se comprobó que Home y Nosotros siguen renderizando igual que antes de esta fase.

## Resultado

| Página | 1440 | 1024 | 768 | 390 | 375 |
|---|---|---|---|---|---|
| Nuestro modelo | OK | OK | OK | OK | OK |
| Servicios | OK | OK | OK | OK | OK |
| Nuestro equipo | OK | OK | OK | OK | OK |
| Actualidad | OK | OK | OK | OK | OK |

«OK» = cero desbordamiento de documento, cero hijos excediendo el viewport,
un único H1, cero imágenes rotas y composición recompuesta (no ocultada) en móvil.

## Sobre los archivos de captura

Este entorno devuelve las capturas del panel de navegador al agente como imagen
en la conversación; no las escribe en disco, de modo que esta carpeta no contiene
PNG. Además, el panel introduce artefactos al capturar contenido por debajo del
pliegue, así que la validación de maquetado se hizo midiendo geometría y estilos
computados en la página, que sí es fiable, y las capturas se usaron para juzgar
la dirección de arte de cada hero.

Para generar los PNG de referencia hace falta un runner headless
(Playwright/Puppeteer), que no se instaló porque la fase D1 prohíbe añadir
dependencias.
