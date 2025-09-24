import { generateHTML, gsapDemos } from './htmlGenerator.js'
import { preloadImages } from './utils.js'

// GSAP app entry

class Grid {
  constructor() {
    this.dom = document.querySelector(".container")
    this.grid = document.querySelector(".grid")
    this.products = [...document.querySelectorAll(".product div")]
    this.details = document.querySelector(".details")
    this.detailsThumb = this.details.querySelector(".details__thumb")
    this.cross = document.querySelector(".cross")
    this.isDragging = false
  }

  init() {
    this.intro()
  }

  intro() {
    this.centerGrid()

    const timeline = gsap.timeline()

    timeline.set(this.dom, { scale: .5 })
    timeline.set(this.products, {
      scale: 0.5,
      opacity: 0,
    })

    timeline.to(this.products, {
      scale: 1,
      opacity: 1,
      duration: 1.2,
      ease: "power2.out",
      stagger: {
        amount: 2.4,
        from: "random"
      }
    })
    timeline.to(this.dom, {
      scale: 1,
      duration: 1.6,
      ease: "power2.inOut",
      onComplete: () => {
        this.setupDraggable()
        this.addEvents()
        this.observeProducts()
        this.handleDetails()
        this.setupHoverEffects()
      }
    })
  }

  centerGrid() {
    const gridWidth = this.grid.offsetWidth
    const gridHeight = this.grid.offsetHeight
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    const centerX = (windowWidth - gridWidth) / 2
    const centerY = (windowHeight - gridHeight) / 2

    gsap.set(this.grid, {
      x: centerX,
      y: centerY
    })
  }

  setupDraggable() {
    this.dom.classList.add("--is-loaded")

    // Calculo el scroll
    this.gridWidth = this.grid.offsetWidth
    this.basePatternWidth = this.gridWidth / 5 // Repito el pattern
    this.resetThreshold = this.basePatternWidth * 2 // Reseteo cuando scrolleo 2 patrones

    this.draggable = Draggable.create(this.grid, {
      type: "x,y",
      bounds: {
        minX: -Infinity,
        maxX: Infinity,
        minY: -(this.grid.offsetHeight - window.innerHeight) - 100,
        maxY: 100
      },
      inertia: true,
      allowEventDefault: true,
      edgeResistance: 0,

      onDragStart: () => {
        this.isDragging = true
        this.grid.classList.add("--is-dragging")
      },

      onDragEnd: () => {
        this.isDragging = false
        this.grid.classList.remove("--is-dragging")
      },

      onDrag: () => {
        this.checkInfiniteScroll()
      }
    })[0]
  }

  addEvents() {
    window.addEventListener("wheel", (e) => {
      e.preventDefault()

      const deltaX = -e.deltaX * 7
      const deltaY = -e.deltaY * 7

      const currentX = gsap.getProperty(this.grid, "x")
      const currentY = gsap.getProperty(this.grid, "y")

      const newX = currentX + deltaX
      const newY = currentY + deltaY

      const bounds = this.draggable.vars.bounds
      const clampedX = newX // No horizontal clamping for infinite scroll
      const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, newY))

      gsap.to(this.grid, {
        x: clampedX,
        y: clampedY,
        duration: 0.3,
        ease: "power3.out",
        onUpdate: () => {
          this.checkInfiniteScroll()
        }
      })
    }, { passive: false })

    window.addEventListener("resize", () => {
      this.updateBounds()
    })

    window.addEventListener("mousemove", (e) => {
      if (this.SHOW_DETAILS) {
        this.handleCursor(e)
      }
    })
  }

  setupHoverEffects() {
    // Hover 
    this.products.forEach((product) => {
      const onEnter = () => {
        if (this.SHOW_DETAILS) return;

        const id = parseInt(product.dataset.id, 10);
        const demo = gsapDemos.find(d => d.id === id);
        const title = demo ? demo.title : '';

        // Ensure positioning context for absolutely positioned overlay
        if (getComputedStyle(product).position === 'static') {
          product.style.position = 'relative';
        }

        // Clean any previous circle (fast re-entries)
        if (product._hoverCircle && product._hoverCircle.parentNode) {
          product._hoverCircle.parentNode.removeChild(product._hoverCircle);
          product._hoverCircle = null;
        }

        const circle = document.createElement('div');
        circle.className = 'hover-circle';

        const size = Math.round(Math.min(product.clientWidth, product.clientHeight) * 1.3);
        Object.assign(circle.style, {
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: size + 'px',
          height: size + 'px',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.99)',
          color: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '12px',
          lineHeight: '1.2',
          fontSize: 'clamp(30px, 1vw, 16px)',
          fontWeight: '600',
          pointerEvents: 'none',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)'
        });

        const label = document.createElement('span');
        label.textContent = title;
        // Bajo la palabra
        Object.assign(label.style, {
          transform: 'translateY(160px)',
          display: 'block'
        });
        circle.appendChild(label);

        if (product.firstChild) {
          product.insertBefore(circle, product.firstChild);
        } else {
          product.appendChild(circle);
        }

        product._hoverCircle = circle;

        gsap.set(circle, { scale: 0.2, opacity: 0 });
        gsap.to(circle, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.7)' });
        const img = product.querySelector('img');
        if (img) {
          gsap.to(img, { scale: 0.92, duration: 0.3, ease: 'power2.out' });
        }
      };

      const onLeave = () => {
        const circle = product._hoverCircle;
        product._hoverCircle = null;
        if (!circle) return;

        gsap.to(circle, {
          scale: 0.2,
          opacity: 0,
          duration: 0.25,
          ease: 'power2.in',
          onComplete: () => {
            if (circle.parentNode) circle.parentNode.removeChild(circle);
          }
        });

        const img = product.querySelector('img');
        if (img) {
          gsap.to(img, { scale: 1, duration: 0.25, ease: 'power2.in' });
        }
      };

      product.addEventListener('mouseenter', onEnter);
      product.addEventListener('mouseleave', onLeave);
    });
  }

  updateBounds() {
    if (this.draggable) {
      this.draggable.vars.bounds = {
        minX: -Infinity,
        maxX: Infinity,
        minY: -(this.grid.offsetHeight - window.innerHeight) - 50,
        maxY: 50
      }
    }
  }

  checkInfiniteScroll() {
    const currentX = gsap.getProperty(this.grid, "x")
    
    // Reset position when scrolled too far in either direction
    if (currentX <= -this.resetThreshold) {
      // Scrolled too far left, reset to right
      gsap.set(this.grid, { x: currentX + this.basePatternWidth })
    } else if (currentX >= this.resetThreshold) {
      // Scrolled too far right, reset to left
      gsap.set(this.grid, { x: currentX - this.basePatternWidth })
    }
  }

  observeProducts() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {

        if (entry.target === this.currentProduct) return

        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
          })
        } else {
          gsap.to(entry.target, {
            opacity: 0,
            scale: 0.5,
            duration: 0.5,
            ease: "power2.in"
          })
        }
      })
    }, {
      root: null,
      threshold: 0.1
    })

    this.products.forEach(product => {
      observer.observe(product)
    })
  }

  handleDetails() {
    this.SHOW_DETAILS = false

    this.titles = this.details.querySelectorAll(".details__title p")
    this.texts = this.details.querySelectorAll(".details__body [data-text]")
    this.closeButton = this.details.querySelector(".close-details")

    // Set initial states for animations
    gsap.set(this.titles, { opacity: 0, y: 50 })
    gsap.set(this.texts, { opacity: 0, y: 30, pointerEvents: 'none' })

    this.products.forEach(product => {
      product.addEventListener("click", (e) => {
        e.stopPropagation()
        this.showDemo(product)
      })
    })

    // Close button click handler
    this.closeButton.addEventListener("click", (e) => {
      e.stopPropagation()
      this.hideDemo()
    })

    // Close when clicking outside the details content
    this.details.addEventListener("click", (e) => {
      if (this.SHOW_DETAILS && e.target === this.details) {
        this.hideDemo()
      }
    })
  }

  showDemo(product) {
    if (this.SHOW_DETAILS) return
    this.SHOW_DETAILS = true
    this.details.classList.add("--is-showing")
    this.dom.classList.add("--is-details-showing")

    gsap.to(this.dom, {
      scale: 0.8,
      y: "-10vh",
      duration: 1.2,
      ease: "power3.inOut",
    })

    gsap.to(this.details, {
      y: 0,
      duration: 1.2,
      ease: "power3.inOut",
    })

    this.flipProduct(product)

    const title = this.details.querySelector(`[data-title="${product.dataset.id}"]`)
    const text = this.details.querySelector(`[data-desc="${product.dataset.id}"]`)

    if (title) {
      gsap.to(title, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        delay: .4,
        ease: "power3.inOut"
      })
    }

    if (text) {
      gsap.to(text, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        delay: .6,
        ease: "power3.inOut"
      })
      // Disable interactions on all code-blocks, enable only the active one
      this.texts.forEach(el => {
        if (el === text) {
          el.style.pointerEvents = 'auto'
        } else {
          el.style.pointerEvents = 'none'
          // Also hide others to ensure stacking doesn't capture clicks
          gsap.set(el, { opacity: 0 })
        }
      })
      
      // Setup demo buttons immediately
      this.setupDemoButtons(product.dataset.id)
    }
  }

  hideDemo() {
    this.SHOW_DETAILS = false

    this.dom.classList.remove("--is-details-showing")

    gsap.to(this.dom, {
      scale: 1,
      y: 0,
      duration: 1.2,
      delay: .3,
      ease: "power3.inOut",
      onComplete: () => {
        this.details.classList.remove("--is-showing")
      }
    })

    gsap.to(this.details, {
      y: "100vh",
      duration: 1.2,
      delay: .3,
      ease: "power3.inOut"
    })

    this.unFlipProduct()

    // Hide all titles and texts
    gsap.to(this.titles, {
      opacity: 0,
      y: 50,
      duration: 0.6,
      ease: "power3.inOut"
    })

    gsap.to(this.texts, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power3.inOut"
    })
  }

  setupDemoButtons(demoId) {
    // Buttons now use onclick handlers directly in HTML - no setup needed
    console.log('Demo buttons ready for:', demoId)
  }

  runDemo(btnElOrId, maybeId) {
    // Support both signatures: runDemo(id) and runDemo(btnEl, id)
    const btnEl = (btnElOrId instanceof Element) ? btnElOrId : null
    const rawId = btnEl && btnEl.dataset && btnEl.dataset.demoId ? btnEl.dataset.demoId : (maybeId ?? btnElOrId)
    const id = parseInt(rawId)
    console.log("Running demo for ID:", id)
    // Find container: prefer from clicked button context
    let container = null
    if (btnEl) {
      container = btnEl.closest('[data-desc]')
    }
    if (!container && this.details) {
      container = this.details.querySelector(`[data-desc="${id}"]`)
    }
    const demoBox = container?.querySelector(`#demo-box-${id}`) || container?.querySelector('.demo-box')
    console.log('Container found:', container)
    console.log('DemoBox found:', demoBox)

    if (!demoBox) {
      console.error('No demo box found for id:', id)
      return
    }

    // Stop any ongoing tweens on this specific box
    gsap.killTweensOf(demoBox)
    // Normalize baseline so each demo starts from the same state
    gsap.set(demoBox, {
      scale: 1,
      rotation: 0,
      x: 0,
      y: 0,
      opacity: 1,
      backgroundColor: "#333"
    })

    // Visual confirmation flash (common to all demos)
    gsap.fromTo(demoBox, { outline: '2px solid #00c853' }, { outline: 'none', duration: 0.4, ease: 'power1.out' })

    // Execute the specific animation based on demo ID
    switch(id) {
      case 1: // Scale
        console.log('Running scale animation')
        gsap.to(demoBox, { scale: 1.6, duration: 0.8, ease: 'power2.out', yoyo: true, repeat: 1 })
        break
      case 2: // Rotation
        console.log('Running rotation animation')
        gsap.to(demoBox, { rotation: 360, duration: 1.2, ease: 'power2.inOut' })
        break
      case 3: // Position
        console.log('Running position animation')
        gsap.to(demoBox, { x: 120, y: 60, duration: 1.0, ease: 'power2.out', yoyo: true, repeat: 1 })
        break
      case 4: // Opacity
        console.log('Running opacity animation')
        gsap.to(demoBox, { opacity: 0.2, duration: 0.6, yoyo: true, repeat: 1, ease: 'power1.inOut' })
        break
      case 5: // Color
        console.log('Running color animation')
        gsap.to(demoBox, { backgroundColor: "#ff6b6b", duration: 0.6, yoyo: true, repeat: 1, ease: 'power1.inOut' })
        break
      case 6: // Multiple properties
        console.log('Running multiple properties animation')
        gsap.to(demoBox, { scale: 0.8, rotation: 180, x: 80, duration: 1.4, ease: 'power2.inOut', yoyo: true, repeat: 1 })
        break
      case 7: // Easing
        console.log('Running easing animation')
        gsap.to(demoBox, { y: 100, duration: 1, ease: "bounce.out" })
        break
      default:
        console.error('Unknown demo ID:', id)
    }
  }

  resetDemo(btnElOrId, maybeId) {
    // Support both signatures: resetDemo(id) and resetDemo(btnEl, id)
    const btnEl = (btnElOrId instanceof Element) ? btnElOrId : null
    const rawId = btnEl && btnEl.dataset && btnEl.dataset.demoId ? btnEl.dataset.demoId : (maybeId ?? btnElOrId)
    console.log("Resetting demo for ID:", rawId)
    const id = parseInt(rawId)
    let container = null
    if (btnEl) {
      container = btnEl.closest('[data-desc]')
    }
    if (!container && this.details) {
      container = this.details.querySelector(`[data-desc="${id}"]`)
    }
    const demoBox = container?.querySelector(`#demo-box-${id}`) || container?.querySelector('.demo-box')

    if (!demoBox) {
      console.error('No demo box found for reset, id:', id)
      return
    }

    console.log('Resetting demo box:', demoBox)
    // Stop any ongoing tweens and reset to clean baseline
    gsap.killTweensOf(demoBox)
    gsap.set(demoBox, { 
      scale: 1, 
      rotation: 0, 
      x: 0, 
      y: 0, 
      opacity: 1, 
      backgroundColor: "#333" 
    })
  }

  flipProduct(product) {
    this.currentProduct = product
    this.originalParent = product.parentNode

    if (this.observer) {
      this.observer.unobserve(product)
    }

    const state = Flip.getState(product)

    this.detailsThumb.appendChild(product)

    Flip.from(state, {
      absolute: true,
      duration: 1.6,
      ease: "power2.inOut",
    })

    gsap.to(this.cross, {
      scale: 1,
      duration: 0.6,
      delay: .6,
      ease: "power2.out"
    })
  }

  unFlipProduct() {
    if (!this.currentProduct || !this.originalParent) return

    gsap.to(this.cross, {
      scale: 0,
      duration: 0.6,
      ease: "power2.out"
    })

    const state = Flip.getState(this.currentProduct)

    const finalRect = this.originalParent.getBoundingClientRect()
    const currentRect = this.currentProduct.getBoundingClientRect()

    gsap.set(this.currentProduct, {
      position: "absolute",
      top: currentRect.top - this.detailsThumb.getBoundingClientRect().top + "px",
      left: currentRect.left - this.detailsThumb.getBoundingClientRect().left + "px",
      width: currentRect.width + "px",
      height: currentRect.height + "px",
      zIndex: 10000,
    })

    gsap.to(this.currentProduct, {
      top: finalRect.top - this.detailsThumb.getBoundingClientRect().top + "px",
      left: finalRect.left - this.detailsThumb.getBoundingClientRect().left + "px",
      width: finalRect.width + "px",
      height: finalRect.height + "px",
      duration: 1.6,
      delay: .4,
      ease: "power2.inOut",
      onComplete: () => {
        this.originalParent.appendChild(this.currentProduct)

        gsap.set(this.currentProduct, {
          position: "",
          top: "",
          left: "",
          width: "",
          height: "",
          zIndex: "",
        })

        this.currentProduct = null
        this.originalParent = null
      },
    })
  }

  handleCursor(e) {
    const x = e.clientX
    const y = e.clientY

    gsap.to(this.cross, {
      x: x - this.cross.offsetWidth / 2,
      y: y - this.cross.offsetHeight / 2,
      duration: 0.4,
      ease: "power2.out"
    })
  }
}

// Generate HTML content first
generateHTML()

// Initialize the grid after HTML is generated
const grid = new Grid()

// Make grid instance globally available for onclick handlers
window.gridInstance = grid

// New preloader timeline (text-based animation)
const preloaderEl = document.getElementById('preloader-animation')
document.body.style.overflow = 'hidden'

const imagesReady = preloadImages('.grid img')
const timelineReady = new Promise((resolve) => {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
  tl.set('.animation', { yPercent: 0, force3D: true })
    .to('.animate', { delay: 3, duration: 0.5, opacity: 0 })
    .to('.animation', { delay: 0.6, duration: 0.9, yPercent: 101, force3D: true, clearProps: 'transform' })
    .add(() => resolve())
})

Promise.all([imagesReady, timelineReady]).then(() => {
  if (preloaderEl) {
    preloaderEl.style.display = 'none'
  }
  document.body.classList.remove('loading')
  document.body.style.overflow = 'auto'
  grid.init()
})
