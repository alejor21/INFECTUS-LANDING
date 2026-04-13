/**
 * AETHERIS CLINICAL - INFECTUS ENGINE
 * ============================================
 * Scroll control, Canvas logic, GSAP animations
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    totalFrames: 192,
    framePath: (index) => `/frames/frame_${index.toString().padStart(4, '0')}.webp`,
    
    // Canvas dimensions (target logic)
    targetWidth: 1920,
    targetHeight: 1080,
    
    // Tweak to hide watermark (1.0 = native, 1.05 = slight zoom)
    imageScale: 1.05, 
    
    // Canvas Scroll Range
    canvasEndPercent: 100, // The frame animation finishes at 100% of the page scroll
    
    // Hero Exit Scroll Range
    heroEndPercent: 15, 
};

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    loader: document.getElementById('loader'),
    loaderProgress: document.getElementById('loader-progress'),
    loaderPercent: document.getElementById('loader-percent'),
    
    header: document.getElementById('header'),
    hero: document.getElementById('hero'),
    
    canvas: document.getElementById('product-canvas'),
    ctx: null, // Will be initialized
    
    scrollContainer: document.getElementById('scroll-container'),
    overlay: document.getElementById('overlay'),
    
    marqueeWrap: document.getElementById('marquee'),
    marqueeText: document.querySelector('.marquee-text'),
    
    sections: document.querySelectorAll('.content-section'),
    statCounters: document.querySelectorAll('.counter')
};

// ============================================
// INITIALIZATION
// ============================================
let lenis;
const images = [];
let currentFrame = 0;

function init() {
    gsap.registerPlugin(ScrollTrigger);
    
    // 1. Init Smooth Scroll
    initLenis();
    
    // 2. Init Canvas context
    if (elements.canvas) {
        elements.ctx = elements.canvas.getContext('2d');
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }
    
    // 3. Preload frames
    preloadFrames();
}

function initLenis() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        orientation: 'vertical',
        gestureOrientation: 'vertical'
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

// ============================================
// PRELOADING LOGIC
// ============================================
function preloadFrames() {
    let loadedCount = 0;
    const initialBatchSize = 10;
    
    // Function to load a single frame
    const loadImage = (index) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = CONFIG.framePath(index);
            img.onload = () => {
                images[index] = img;
                loadedCount++;
                
                // Update Loader UI
                const p = Math.floor((loadedCount / CONFIG.totalFrames) * 100);
                if (elements.loaderProgress) elements.loaderProgress.style.width = p + '%';
                if (elements.loaderPercent) elements.loaderPercent.innerText = p + '%';
                
                // Render first frame immediately when ready
                if (index === 1 && elements.ctx) {
                    currentFrame = 1;
                    drawFrame(1);
                }
                
                // Hide loader when first batch is ready
                if (loadedCount === initialBatchSize) {
                    hideLoader();
                    buildScrollTriggers();
                }
                resolve();
            };
            img.onerror = () => {
                console.warn(`Frame ${index} failed to load.`);
                resolve(); // resolve anyway to not block
            };
        });
    };

    // Load sequentially to respect network constraints
    const loadSequentially = async () => {
        for (let i = 1; i <= CONFIG.totalFrames; i++) {
            await loadImage(i);
        }
    };

    loadSequentially();
}

function hideLoader() {
    setTimeout(() => {
        if (elements.loader) {
            elements.loader.classList.add('hidden');
        }
        animateHeroEntrance();
    }, 500);
}

function animateHeroEntrance() {
    const tl = gsap.timeline();
    
    tl.fromTo('#hero-title', 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    )
    .fromTo('#hero-subtitle', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.6'
    );
}

// ============================================
// CANVAS RENDERING
// ============================================
function resizeCanvas() {
    if (!elements.canvas) return;
    elements.canvas.width = window.innerWidth * window.devicePixelRatio;
    elements.canvas.height = window.innerHeight * window.devicePixelRatio;
    drawFrame(currentFrame);
}

function drawFrame(index) {
    if (!elements.ctx || !images[index]) return;
    
    const img = images[index];
    const canvas = elements.canvas;
    const ctx = elements.ctx;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fit to cover logic with scaling (removes watermark)
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height) * CONFIG.imageScale;
    
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
}

// ============================================
// SCROLL TRIGGERS CHOREOGRAPHY
// ============================================
function buildScrollTriggers() {
    
    // 1. Old Hero Reveal Clip Path REMOVED (Hero is now part of sections loop)

    // 2. Canvas Frame Scrub
    if (elements.canvas) {
        const frameObj = { frame: 1 };
        gsap.to(frameObj, {
            frame: CONFIG.totalFrames - 1,
            snap: 'frame',
            ease: 'none',
            scrollTrigger: {
                trigger: elements.scrollContainer,
                start: 'top top',
                end: `${CONFIG.canvasEndPercent}% top`,
                scrub: 0.5, // Smooth scrubbing
            },
            onUpdate: () => {
                const nextFrame = Math.round(frameObj.frame);
                if (nextFrame !== currentFrame) {
                    currentFrame = nextFrame;
                    requestAnimationFrame(() => drawFrame(currentFrame));
                }
            }
        });
    }

    // 3. Stats Overlay Logic
    if (elements.overlay) {
        gsap.timeline({
            scrollTrigger: {
                trigger: elements.scrollContainer,
                start: '20% top',
                end: '38% top',
                scrub: true
            }
        })
        .to(elements.overlay, { opacity: 1, pointerEvents: 'auto', ease: 'power2.out', duration: 0.3 })
        .to(elements.overlay, { opacity: 0, pointerEvents: 'none', ease: 'power2.in', duration: 0.3 }, '+=0.4');
    }

    // 4. Marquee Horizontal Scroll
    if (elements.marqueeWrap && elements.marqueeText) {
        gsap.fromTo(elements.marqueeWrap, 
            { opacity: 0 }, 
            { opacity: 1, duration: 0.5, scrollTrigger: { trigger: elements.scrollContainer, start: '38% top', toggleActions: 'play none none reverse'} }
        );
        
        gsap.to(elements.marqueeText, {
            xPercent: -50,
            ease: 'none',
            scrollTrigger: {
                trigger: elements.scrollContainer,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1
            }
        });
    }

    // 5. Sections Liquid Glass Logic
    elements.sections.forEach(section => {
        const enterParam = parseFloat(section.getAttribute('data-enter'));
        const leaveParam = parseFloat(section.getAttribute('data-leave'));
        
        const glassPanel = section.querySelector('.glass-panel');
        if (!glassPanel) return;

        const animType = glassPanel.getAttribute('data-animation') || 'fade-up';
        
        // Custom exit logic for the newly moved Hero section
        if (section.id === 'hero') {
            gsap.set(section, { autoAlpha: 1 });
            gsap.set(glassPanel, { y: 0, x: 0, scale: 1 });
            
            gsap.timeline({
                scrollTrigger: {
                    trigger: elements.scrollContainer,
                    start: `${enterParam}% top`,
                    end: `${leaveParam}% top`,
                    scrub: 1,
                }
            })
            .to(section, { autoAlpha: 0, duration: 1, ease: 'power2.inOut' })
            .to(glassPanel, { y: -100, duration: 1, ease: 'power2.inOut' }, '<');
            
            return; // Skip the rest of the generic panel logic
        }

        // Generic Initial State
        gsap.set(section, { autoAlpha: 0 });
        let fromState = {};
        let toState = {};
        
        if (animType === 'fade-up') {
            fromState = { y: 100 }; // Entra desde abajo
            toState = { y: -100 };  // Se va por arriba
        } else {
            fromState = { y: 60 };
            toState = { y: -60 };
        }
        
        gsap.set(glassPanel, fromState);

        // Build ScrollTrigger logic per section based on percentages
        gsap.timeline({
            scrollTrigger: {
                trigger: elements.scrollContainer,
                start: `${enterParam}% top`,
                end: `${leaveParam}% top`,
                scrub: 1,
            }
        })
        // Enters screen
        .to(section, { autoAlpha: 1, duration: 0.2, ease: 'none' })
        .to(glassPanel, { x: 0, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }, '<')
        // Leaves screen
        .to(section, { autoAlpha: 0, duration: 0.2, ease: 'none' }, '+=0.5')
        .to(glassPanel, { ...toState, duration: 0.3, ease: 'power2.in' }, '<');
    });

    // 6. Stat Counters Initialization
    elements.statCounters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const statItem = counter.closest('.stat-item');
        const enterParam = parseFloat(statItem.getAttribute('data-enter'));

        ScrollTrigger.create({
            trigger: elements.scrollContainer,
            start: `${enterParam}% top`,
            once: true,
            onEnter: () => {
                gsap.to(counter, {
                    innerText: target,
                    duration: 2,
                    snap: { innerText: 1 },
                    ease: "power2.out",
                    onUpdate: function() {
                        counter.innerHTML = Math.ceil(counter.innerText).toLocaleString('en-US');
                    }
                });
            }
        });
    });
}

// Boot
window.addEventListener('DOMContentLoaded', init);