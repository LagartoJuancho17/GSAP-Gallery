# Gallery GSAP — README

## Descripción general
Proyecto de galería interactiva construida con GSAP (GreenSock) que permite:
- Navegación/arrastre de una grilla “infinita”.
- Apertura de un panel de detalles con transiciones fluidas del ítem seleccionado.
- Demos prácticas de animaciones GSAP (scale, rotation, position, opacity, color, multiple properties y easing).
- Preloader animado antes de inicializar la UI.

Arquitectura principal:
- Marcado generado dinámicamente en `js/htmlGenerator.js`.
- Lógica/animaciones en `js/app.js` dentro de la clase `Grid`.
- Carga de GSAP y plugins por CDN en `index.html`.


## Flujo de inicialización
1. `index.html` muestra un preloader (`.animation`).
2. En `js/app.js`, se crea un timeline para el preloader:
   - Oculta `.animate` y desplaza `.animation` fuera de la vista.
   - Quita el `overflow: hidden` y llama a `grid.init()`.
3. `generateHTML()` crea el markup (grilla + detalles + cruz) antes de instanciar `Grid`.
4. `grid.init()` llama a `intro()`.

## Uso de GSAP en detalle

### 1) Preloader (timeline)
Archivo: `js/app.js`
- `gsap.timeline({ defaults: { ease: 'power4.out' } })` para animar `.animation` y luego ocultarla.
- Al finalizar, se habilita el scroll y se inicia la grilla con `grid.init()`.

Simple de varios pasos con delays y callbacks.

### 2) Intro de la grilla (timeline + stagger)
Función: `Grid.intro()` en `js/app.js`.
- `timeline.set(this.dom, { scale: .5 })` y `timeline.set(this.products, { scale: 0.5, opacity: 0 })`.
- `timeline.to(this.products, { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out', stagger: { amount: 2.4, from: 'random' } })`.
- `timeline.to(this.dom, { scale: 1, duration: 1.6, ease: 'power2.inOut', onComplete: (...) })`.

### 3) Centrando la grilla
Función: `Grid.centerGrid()`.
- Cálculo de `centerX/centerY` y `gsap.set(this.grid, { x, y })`.

### 4) Arrastre y scroll infinito (Draggable + wheel)
Funciones: `Grid.setupDraggable()`, `Grid.addEvents()`, `Grid.checkInfiniteScroll()`.
- `Draggable.create(this.grid, { type: 'x,y', inertia: true, bounds: { ... } })`.
- Wheel: `gsap.to(this.grid, { x, y, duration: .3, ease: 'power3.out', onUpdate: checkInfiniteScroll })`.
- Reset horizontal “infinito” con `basePatternWidth` y `resetThreshold` usando `gsap.set(this.grid, { x: ... })` cuando se supera el umbral por izquierda/derecha.

### 5) Aparición por viewport (IntersectionObserver + gsap)
Función: `Grid.observeProducts()`.
- Al entrar: `gsap.to(entry.target, { scale: 1, opacity: 1, duration: .5, ease: 'power2.out' })`.
- Al salir: `gsap.to(entry.target, { opacity: 0, scale: 0.5, duration: .5, ease: 'power2.in' })`.

### 6) Efectos de hover (microinteracciones)
Función: `Grid.setupHoverEffects()`.
- Overlay circular animado con `gsap.set` + `gsap.to` en `mouseenter` / `mouseleave`.
- Imagen hace `scale` suave al entrar/salir.

### 7) Panel de detalles (responsive, x/y)
Funciones: `Grid.handleDetails()`, `Grid.showDemo()`, `Grid.hideDemo()`.
- Estados iniciales con `gsap.set` para títulos y textos (`opacity/y`).
- Mobile: slide vertical desde abajo (`gsap.to(this.details, { y: 0 })`) y leve `scale` en `this.dom`.
- Desktop: split view; `this.dom` se desplaza a `x: '-50vw'` y `this.details` entra con `x: 0`.
- Cierre invierte las animaciones. Manejo de `resize` para mantener posiciones correctas.

Nota: Se adoptó una animación de panel “bottom-to-top” en mobile para ocupar pantalla completa y mejorar UX.

### 8) Flip: transición del producto al panel
Funciones: `Grid.flipProduct()` y `Grid.unFlipProduct()`.
- `const state = Flip.getState(product)` antes de mover el nodo a `.details__thumb`.
- `Flip.from(state, { absolute: true, duration: 1.6, ease: 'power2.inOut' })` para una transición sin “saltos”.
- En el retorno, se normaliza posición/tamaño con `gsap.set`/`gsap.to` y se reanexa al contenedor original.

Beneficio: resolver reparenting con animación fluida sin cálculos manuales tediosos.

### 9) Cursor y cruz de cierre
Funciones: `Grid.handleCursor()` y animaciones de `.cross` en `flipProduct()`/`unFlipProduct()`.
- Seguir cursor: `gsap.to(this.cross, { x, y, duration: .4, ease: 'power2.out' })`.
- Aparición/desaparición con `scale`.

### 10) Demos de GSAP dentro del panel
Datos/UI: `gsapDemos` y markup en `js/htmlGenerator.js`.
Funciones: `Grid.runDemo()` y `Grid.resetDemo()`.
- Antes de animar: `gsap.killTweensOf(demoBox)` y baseline con `gsap.set(...)`.
- Ejecución: `gsap.to(demoBox, { ... })` según el ID (scale, rotation, x/y, opacity, backgroundColor, combinación, easing `bounce.out`).
- Reset: devuelve al estado neutro.

## Utilidades GSAP empleadas
- API: `gsap.set`, `gsap.to`, `gsap.fromTo`, `gsap.timeline`, `gsap.getProperty`, `gsap.killTweensOf`.
- Easing: `power2.*`, `power3.*`, `power4.*`, `bounce.out`.
- Stagger: `stagger: { amount, from: 'random' }` para la intro.
- Plugins: `Draggable` (arrastre/inercia), `Flip` (layout transitions).

