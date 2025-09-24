

// GSAP Dmo data
const gsapDemos = [
  { 
    id: 1, 
    image: 'img-1.png', 
    title: 'Scale Animation', 
    code: 'gsap.to(".demo-box", { scale: 1.5, duration: 1 })',
    description: 'Escala un elemento al 150% de su tamaño original en 1 segundo.'
  },
  { 
    id: 2, 
    image: 'img-2.png', 
    title: 'Rotation Animation', 
    code: 'gsap.to(".demo-box", { rotation: 360, duration: 2 })',
    description: 'Rota un elemento 360 grados (una vuelta completa) en 2 segundos.'
  },
  { 
    id: 3, 
    image: 'img-3.png', 
    title: 'Position Animation', 
    code: 'gsap.to(".demo-box", { x: 100, y: 50, duration: 1.5 })',
    description: 'Mueve un elemento 100px a la derecha y 50px hacia abajo en 1.5 segundos.'
  },
  { 
    id: 4, 
    image: 'img-4.png', 
    title: 'Opacity Animation', 
    code: 'gsap.to(".demo-box", { opacity: 0.3, duration: 1 })',
    description: 'Cambia la opacidad de un elemento al 30% en 1 segundo.'
  },
  { 
    id: 5, 
    image: 'img-5.png', 
    title: 'Color Animation', 
    code: 'gsap.to(".demo-box", { backgroundColor: "#ff6b6b", duration: 1 })',
    description: 'Cambia el color de fondo de un elemento a rojo en 1 segundo.'
  },
  { 
    id: 6, 
    image: 'img-6.png', 
    title: 'Multiple Properties', 
    code: 'gsap.to(".demo-box", { scale: 0.8, rotation: 180, x: 50, duration: 2 })',
    description: 'Anima múltiples propiedades simultáneamente: escala, rotación y posición.'
  },
  { 
    id: 7, 
    image: 'img-7.png', 
    title: 'Easing Animation', 
    code: 'gsap.to(".demo-box", { y: 100, duration: 1, ease: "bounce.out" })',
    description: 'Mueve un elemento hacia abajo con un efecto de rebote al final.'
  }
];

// Base grid layout pattern 
const baseGridLayout = [
  [3, 7, 1, 5, 2], // Column 1
  [4, 6, 3, 7, 1], // Column 2
  [5, 2, 4, 6, 1], // Column 3
  [3, 5, 1, 6, 2], // Column 4
  [4, 6, 3, 5, 1], // Column 5
  [5, 6, 2, 1, 4], // Column 6
  [3, 4, 1, 2, 6], // Column 7
  [5, 2, 4, 6, 1], // Column 8
  [3, 5, 1, 6, 2], // Column 9
  [4, 6, 3, 5, 1]  // Column 10
];

// Genero una grid infiita repitiendo la base 
function generateInfiniteLayout(repetitions = 20) {
  const infiniteLayout = [];
  for (let i = 0; i < repetitions; i++) {
    infiniteLayout.push(...baseGridLayout);
  }
  return infiniteLayout;
}

const gridLayout = generateInfiniteLayout();

//Genero un producto
function createProductElement(productId) {
  return `
    <div class="product">
      <div data-id="${productId}">
        <img src="./public/img-${productId}.png" />
      </div>
    </div>
  `;
}

//Genero una columna de productos
function createColumn(productIds) {
  const products = productIds.map(id => createProductElement(id)).join('');
  return `
    <div class="column">
      ${products}
    </div>
  `;
}

//Genero la grid compelta

function createGrid() {
  const columns = gridLayout.map(columnIds => createColumn(columnIds)).join('');
  return `
    <div class="container">
      <div class="grid">
        ${columns}
      </div>
    </div>
  `;
}

//seccion Demo de GSAP

function createDetails() {
  const titles = gsapDemos.map(demo => 
    `<p data-title="${demo.id}" data-text>${demo.title}</p>`
  ).join('');

  const descriptions = gsapDemos.map(demo => 
    `<div data-desc="${demo.id}" data-text>
      <h3>${demo.title}</h3>
      <div class="demo-container">
        <div class="demo-box" id="demo-box-${demo.id}"></div>
      </div>
      <div class="code-block">
        <code>${demo.code}</code>
      </div>
      <p class="demo-description">${demo.description}</p>
      <button class="run-demo-btn" data-demo-id="${demo.id}" onclick="window.gridInstance.runDemo(this, ${demo.id})">Ejecutar Animación</button>
      <button class="reset-demo-btn" data-demo-id="${demo.id}" onclick="window.gridInstance.resetDemo(this, ${demo.id})">Reset</button>
    </div>`
  ).join('');

  return `
    <div class="details">
      <div class="details__title">
        ${titles}
      </div>
      <div class="details__body">
        <div class="details__thumb"></div>
        <div class="details__texts">
          ${descriptions}
        </div>
      </div>
    </div>
  `;
}

/**
 * Generates the cross/close button
 */
function createCross() {
  return `
    <div class="cross">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18" stroke="#313131" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M6 6L18 18" stroke="#313131" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  `;
}

/**
 * Generates and injects all HTML content into the main element
 */
function generateHTML() {
  const main = document.querySelector('main');
  if (!main) return;

  // Create header
  const header = `
    <header class="frame">
      <h1 class="frame__title">
        Tobias Arraiza 
        <a href="https://tympanus.net/codrops/demos/?tag=gsap">#GSAP</a>
      </h1>
    </header>
  `;

  // Combine all elements
  const content = header + createGrid() + createDetails() + createCross();
  
  main.innerHTML = content;
}

// Export for use in other modules
export { generateHTML, gsapDemos };

