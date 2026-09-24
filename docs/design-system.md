# Infectus Design System

## Design principles

Claridad científica, jerarquía editorial y una sola atención dominante por sección. La interfaz evita glassmorphism masivo, sombras pesadas y movimiento decorativo.

## Brand

Se recibieron un escudo Infectus y dos variantes de wordmark blanco, ubicados en `public/brand/` sin alterar su proporción ni colores. La cuarta rama continúa pendiente.

## Color

Usar tokens semánticos: `--brand-*`, `--surface-*`, `--text-*`, `--border-*` y `--status-*`. Los tokens de marca se tomaron del escudo: navy `#011A41`, azul `#4A97D8` y azul claro `#71B6E5`.

## Typography

Satoshi funciona temporalmente como display y body. Volt no está disponible ni se usa. La escala fluida vive en `tokens.css`.

## Spacing, layout, radius and elevation

Usar escala `--space-*`, contenedores `--container-*`, gutters fluidos y radios `--radius-*`. Las cards usan borde sutil y `--shadow-sm`; `--shadow-md` queda reservado para navegación flotante.

## Buttons, links, cards and forms

Buttons: primary, secondary y ghost. Links de texto usan subrayado. Cards son superficies composables, no decoración. Formularios requieren label superior, foco visible, ayuda y estados de error.

## Iconography

Usar SVG lineal controlado, con grosor consistente. No se añadió librería de iconos ni iconografía por emoji.

## Motion and accessibility

Usar `--duration-*` y `--ease-standard` solo para microinteracciones de transform/opacity/color. `prefers-reduced-motion` reduce transiciones. Mantener foco visible, contraste y objetivos táctiles de al menos 44 px.

## Responsive rules

Diseñar desde 320 px con gutters fluidos; los grids pasan a una columna cuando pierden legibilidad.

## Pending brand decisions

Montserrat y Milker no están presentes aún en el repositorio. Montserrat no puede sustituir la familia temporal Satoshi hasta recibir sus archivos; Milker permanece pendiente de autorización comercial. El header usa `infectus-primary-transparent.png` a 80 px desktop / 66 px mobile de lienzo, que producen una marca visible aproximada de 48 px / 40 px al respetar su transparencia. Labs continúa sin asset oficial.

El hero de Home usa una imagen editorial luminosa de laboratorio con texto independiente a la izquierda. En desktop ocupa el borde derecho de la composición; en móvil pasa a un bloque con borde redondeado. La fotografía se muestra con `object-fit: cover` y sin filtros de color agresivos. Montserrat se integrará localmente cuando sus archivos estén disponibles. Milker permanece pendiente de licencia comercial y no se usa en producción.
