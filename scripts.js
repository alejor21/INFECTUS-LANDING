/**
 * INFECTUS - Premium Medical Landing Page
 * JavaScript for animations and interactivity
 */

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initNav();
    initScrollAnimations();
    initTechTabs();
    initSmoothScroll();
    initFormValidation();
    initCounterAnimations();
});

// ============================================
// NAVIGATION
// ============================================
function initNav() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    // Scroll behavior
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;

        // Add/remove scrolled class
        if (currentScrollY > 50) {
            nav.classList.add('nav--scrolled');
        } else {
            nav.classList.remove('nav--scrolled');
        }

        lastScrollY = currentScrollY;
    });

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('is-open');

            // Animate hamburger icon
            const spans = navToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                span.style.transform = navMenu.classList.contains('is-open')
                    ? getHamburgerTransform(index, true)
                    : '';
            });
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('is-open');
            });
        });
    }
}

function getHamburgerTransform(index, isOpen) {
    if (!isOpen) return '';
    const transforms = [
        'rotate(45deg) translate(5px, 5px)',
        'opacity: 0',
        'rotate(-45deg) translate(5px, -5px)'
    ];
    return transforms[index];
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (!animatedElements.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
}

// ============================================
// TECH TABS
// ============================================
function initTechTabs() {
    const tabs = document.querySelectorAll('.tech-showcase__tab');
    const panels = document.querySelectorAll('.tech-showcase__panel');

    if (!tabs.length || !panels.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            const targetPanel = document.getElementById(`panel-${tabId}`);

            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Add active to current
            this.classList.add('active');
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                const navHeight = document.getElementById('nav').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// FORM VALIDATION
// ============================================
function initFormValidation() {
    const form = document.getElementById('contact-form');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Basic validation
        const errors = validateForm(data);

        if (errors.length === 0) {
            // Show success state
            showFormSuccess();
        } else {
            showFormErrors(errors);
        }
    });
}

function validateForm(data) {
    const errors = [];

    if (!data.nombre || data.nombre.trim().length < 2) {
        errors.push({ field: 'nombre', message: 'Por favor ingrese su nombre' });
    }

    if (!data.institucion || data.institucion.trim().length < 2) {
        errors.push({ field: 'institucion', message: 'Por favor ingrese el nombre de la institución' });
    }

    if (!data.email || !isValidEmail(data.email)) {
        errors.push({ field: 'email', message: 'Por favor ingrese un correo válido' });
    }

    return errors;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showFormErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    document.querySelectorAll('.form-input--error').forEach(el => el.classList.remove('form-input--error'));

    errors.forEach(error => {
        const field = document.getElementById(error.field);
        if (field) {
            field.classList.add('form-input--error');
            const errorEl = document.createElement('span');
            errorEl.className = 'form-error';
            errorEl.textContent = error.message;
            errorEl.style.cssText = 'color: #FF3B30; font-size: 0.75rem; margin-top: 0.25rem; display: block;';
            field.parentNode.appendChild(errorEl);
        }
    });
}

function showFormSuccess() {
    const form = document.getElementById('contact-form');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Disable form
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Solicitud Enviada</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
    submitBtn.style.background = 'var(--color-success)';

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2" style="margin: 0 auto 1rem;">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12l2 2 4-4"/>
            </svg>
            <h3 style="margin-bottom: 0.5rem; font-weight: 600;">¡Solicitud Enviada!</h3>
            <p style="color: #6E6E73;">Nos pondremos en contacto en menos de 24 horas.</p>
        </div>
    `;

    form.innerHTML = '';
    form.appendChild(successMessage);
}

// ============================================
// COUNTER ANIMATIONS
// ============================================
function initCounterAnimations() {
    const counters = document.querySelectorAll('[data-counter]');

    if (!counters.length) return;

    const observerOptions = {
        root: null,
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-counter'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += step;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
}

// ============================================
// PARALLAX EFFECT (Subtle)
// ============================================
function initParallax() {
    const heroVisual = document.querySelector('.hero__visual');

    if (!heroVisual) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;

        heroVisual.style.transform = `translateY(${rate}px)`;
    });
}

// ============================================
// DASHBOARD ANIMATIONS
// ============================================
function initDashboardAnimations() {
    const metricBars = document.querySelectorAll('.dashboard__metric-bar div');

    if (!metricBars.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate bars
                metricBars.forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                });
                observer.disconnect();
            }
        });
    }, { threshold: 0.5 });

    const dashboard = document.querySelector('.hero__dashboard');
    if (dashboard) {
        observer.observe(dashboard);
    }
}

// Initialize dashboard animations on load
document.addEventListener('DOMContentLoaded', initDashboardAnimations);

// ============================================
// UTILITY FUNCTIONS
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================
// Handle keyboard navigation for tabs
document.addEventListener('keydown', function(e) {
    const focusedTab = document.activeElement;

    if (focusedTab && focusedTab.classList.contains('tech-showcase__tab')) {
        const tabs = Array.from(document.querySelectorAll('.tech-showcase__tab'));
        const currentIndex = tabs.indexOf(focusedTab);

        let newIndex;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                newIndex = (currentIndex + 1) % tabs.length;
                tabs[newIndex].focus();
                tabs[newIndex].click();
                e.preventDefault();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                tabs[newIndex].focus();
                tabs[newIndex].click();
                e.preventDefault();
                break;
        }
    }
});

// ============================================
// SCROLL PROGRESS INDICATOR (Optional)
// ============================================
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #0071E3, #00C7BE);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${scrollPercent}%`;
    });
}

// Uncomment to enable scroll progress indicator
// document.addEventListener('DOMContentLoaded', initScrollProgress);