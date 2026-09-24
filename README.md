# Infectus Website

## Stack

- Vite 5
- HTML5 multipágina
- CSS Vanilla
- JavaScript Vanilla ES Modules

## Requisitos

- Node.js compatible con Vite 5
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Estructura

- `src/styles/`: tokens, base, layout, componentes y estilos de página.
- `src/scripts/`: navegación, acordeón y formulario.
- `frames/`: material fuente del experimento visual anterior; no forma parte de la experiencia activa.
- `assets/`: recursos entregados que aún deben clasificarse para su uso posterior.
- Raíz: cinco páginas HTML de producción y la configuración multipágina de Vite.

## Arquitectura

El sitio usa Vite como compilador de una aplicación HTML multipágina. Los patrones compartidos se centralizan en CSS y módulos JavaScript nativos; el markup de header y footer se mantiene explícito por página para evitar incorporar tooling de plantillas antes de que sea necesario.

## Estado del proyecto

El sitio está en proceso de renovación. La Fase 1 sanea la arquitectura técnica; el contenido institucional, identidad gráfica y diseño definitivo se trabajarán en fases posteriores.
