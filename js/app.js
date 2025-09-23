import { generateHTML, gsapDemos } from './htmlGenerator.js'
import { preloadImages } from './utils.js'

// GSAP is loaded globally via script tags

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
      duration: 0.6,
      ease: "power3.out",
      stagger: {
        amount: 1.2,
        from: "random"
      }
    })
    timeline.to(this.dom, {
      scale: 1,
      duration: 1.2,
      ease: "power3.inOut",
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

    // Calculate infinite scroll parameters
    this.gridWidth = this.grid.offsetWidth
    this.basePatternWidth = this.gridWidth / 5 // Since we repeat the pattern 5 times
    this.resetThreshold = this.basePatternWidth * 2 // Reset when we've scrolled 2 pattern widths

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
    // Hover circle behind image showing the GSAP demo title
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
        // push the label slightly below the center
        Object.assign(label.style, {
          transform: 'translateY(160px)',
          display: 'block'
        });
        circle.appendChild(label);

        // Insert as first child so image (which is later in DOM) stays above
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

    // Set initial states for animations
    gsap.set(this.titles, { opacity: 0, y: 50 })
    gsap.set(this.texts, { opacity: 0, y: 30 })

    this.products.forEach(product => {
      product.addEventListener("click", (e) => {
        e.stopPropagation()
        this.showDemo(product)
      })
    })

    this.dom.addEventListener("click", (e) => {
      if (this.SHOW_DETAILS) this.hideDemo()
    })
  }

  showDemo(product) {
    if (this.SHOW_DETAILS) return
    this.SHOW_DETAILS = true
    this.details.classList.add("--is-showing")
    this.dom.classList.add("--is-details-showing")

    gsap.to(this.dom, {
      x: "-50vw",
      duration: 1.2,
      ease: "power3.inOut",
    })

    gsap.to(this.details, {
      x: 0,
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
      
      // Setup demo buttons immediately
      this.setupDemoButtons(product.dataset.id)
    }
  }

  hideDemo() {
    this.SHOW_DETAILS = false

    this.dom.classList.remove("--is-details-showing")

    gsap.to(this.dom, {
      x: 0,
      duration: 1.2,
      delay: .3,
      ease: "power3.inOut",
      onComplete: () => {
        this.details.classList.remove("--is-showing")
      }
    })

    gsap.to(this.details, {
      x: "50vw",
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

  runDemo(demoId) {
    console.log("Running demo for ID:", demoId, typeof demoId)
    
    // Find the currently visible demo box (the one that's shown in the details panel)
    const visibleDemoContainer = document.querySelector('.details__texts [data-text]:not([style*="opacity: 0"])')
    const demoBox = visibleDemoContainer ? visibleDemoContainer.querySelector('.demo-box') : null
    
    console.log('Visible demo container:', visibleDemoContainer)
    console.log('Demo box found:', demoBox)
    
    if (!demoBox) {
      console.error('No visible demo box found')
      return
    }

    // Execute the specific animation based on demo ID
    const id = parseInt(demoId)
    console.log('Parsed ID:', id)
    
    switch(id) {
      case 1: // Scale
        console.log('Running scale animation')
        gsap.to(demoBox, { scale: 1.5, duration: 1 })
        break
      case 2: // Rotation
        console.log('Running rotation animation')
        gsap.to(demoBox, { rotation: 360, duration: 2 })
        break
      case 3: // Position
        console.log('Running position animation')
        gsap.to(demoBox, { x: 100, y: 50, duration: 1.5 })
        break
      case 4: // Opacity
        console.log('Running opacity animation')
        gsap.to(demoBox, { opacity: 0.3, duration: 1 })
        break
      case 5: // Color
        console.log('Running color animation')
        gsap.to(demoBox, { backgroundColor: "#ff6b6b", duration: 1 })
        break
      case 6: // Multiple properties
        console.log('Running multiple properties animation')
        gsap.to(demoBox, { scale: 0.8, rotation: 180, x: 50, duration: 2 })
        break
      case 7: // Easing
        console.log('Running easing animation')
        gsap.to(demoBox, { y: 100, duration: 1, ease: "bounce.out" })
        break
      default:
        console.error('Unknown demo ID:', id)
    }
  }

  resetDemo(demoId) {
    console.log("Resetting demo for ID:", demoId)
    
    // Find the currently visible demo box
    const visibleDemoContainer = document.querySelector('.details__texts [data-text]:not([style*="opacity: 0"])')
    const demoBox = visibleDemoContainer ? visibleDemoContainer.querySelector('.demo-box') : null
    
    if (demoBox) {
      console.log('Resetting demo box:', demoBox)
      gsap.set(demoBox, { 
        scale: 1, 
        rotation: 0, 
        x: 0, 
        y: 0, 
        opacity: 1, 
        backgroundColor: "#333" 
      })
    } else {
      console.error('No visible demo box found for reset')
    }
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
      duration: 1.2,
      ease: "power3.inOut",
    })

    gsap.to(this.cross, {
      scale: 1,
      duration: 0.4,
      delay: .5,
      ease: "power2.out"
    })
  }

  unFlipProduct() {
    if (!this.currentProduct || !this.originalParent) return

    gsap.to(this.cross, {
      scale: 0,
      duration: 0.4,
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
      duration: 1.2,
      delay: .3,
      ease: "power3.inOut",
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

preloadImages('.grid img').then(() => {
  grid.init()
  document.body.classList.remove('loading')
})
