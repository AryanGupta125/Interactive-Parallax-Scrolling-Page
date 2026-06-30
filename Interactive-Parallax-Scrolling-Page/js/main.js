/**
 * ===================================================================
 * STELLAR PARALLAX — Main JavaScript
 * An immersive parallax scrolling experience
 * ===================================================================
 */

(function () {
    'use strict';

    // ─── Configuration ─────────────────────────────────────────────
    const CONFIG = {
        parallaxIntensity: 0.5,
        smoothScrolling: true,
        particleCount: 50,
        starCount: 120,
        bubbleCount: 20,
        journeyParticleCount: 15,
        cursorGlow: true,
        tiltIntensity: 8,
        counterDuration: 2000,
    };

    // ─── Feature Detection ─────────────────────────────────────────
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const supportsIntersectionObserver = 'IntersectionObserver' in window;

    // ─── State ─────────────────────────────────────────────────────
    let scrollY = window.scrollY;
    let targetScrollY = window.scrollY;
    let mouseX = 0;
    let mouseY = 0;
    let ticking = false;

    // ─── DOM References ────────────────────────────────────────────
    const elements = {};

    function cacheDOMElements() {
        elements.scrollProgress = document.getElementById('scrollProgress');
        elements.mainNav = document.getElementById('mainNav');
        elements.navToggle = document.getElementById('navToggle');
        elements.navLinks = document.getElementById('navLinks');
        elements.cursorGlow = document.getElementById('cursorGlow');
        elements.heroStars = document.getElementById('heroStars');
        elements.journeyParticles = document.getElementById('journeyParticles');
        elements.oceanBubbles = document.getElementById('oceanBubbles');
        elements.depthFill = document.getElementById('depthFill');
        elements.parallaxLayers = document.querySelectorAll('.parallax-layer');
        elements.scrollRevealElements = document.querySelectorAll('.scroll-reveal');
        elements.revealTextElements = document.querySelectorAll('.reveal-text');
        elements.navLinkElements = document.querySelectorAll('.nav__link');
        elements.sections = document.querySelectorAll('.section');
        elements.tiltCards = document.querySelectorAll('[data-tilt]');
        elements.cardShines = document.querySelectorAll('.discover__card-shine');
        elements.statNumbers = document.querySelectorAll('.contact__stat-number');
    }

    // ─── Initialization ────────────────────────────────────────────
    function init() {
        cacheDOMElements();

        if (!prefersReducedMotion) {
            generateStars();
            generateJourneyParticles();
            generateBubbles();
            initParallax();
            initCursorGlow();
            initTiltCards();
            startAnimationLoop();
        }

        initScrollReveal();
        initNavigation();
        initSmoothScroll();
        initCounters();

        // Trigger initial reveal for hero elements
        requestAnimationFrame(() => {
            document.querySelectorAll('.hero .reveal-text').forEach((el) => {
                el.classList.add('revealed');
            });
        });
    }

    // ─── Star Generation ───────────────────────────────────────────
    function generateStars() {
        if (!elements.heroStars) return;

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < CONFIG.starCount; i++) {
            const star = document.createElement('div');
            star.className = 'hero__star';
            star.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                width: ${Math.random() * 2 + 1}px;
                height: ${Math.random() * 2 + 1}px;
                --duration: ${Math.random() * 4 + 2}s;
                --delay: ${Math.random() * 4}s;
                --min-opacity: ${Math.random() * 0.3 + 0.1};
            `;
            fragment.appendChild(star);
        }

        elements.heroStars.appendChild(fragment);
    }

    // ─── Journey Particles ─────────────────────────────────────────
    function generateJourneyParticles() {
        if (!elements.journeyParticles) return;

        const fragment = document.createDocumentFragment();
        const colors = ['rgba(108, 99, 255, 0.4)', 'rgba(0, 212, 255, 0.3)', 'rgba(255, 107, 157, 0.3)'];

        for (let i = 0; i < CONFIG.journeyParticleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'journey__particle';
            particle.style.cssText = `
                left: ${Math.random() * 100}%;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                --duration: ${Math.random() * 10 + 8}s;
                --delay: ${Math.random() * 10}s;
                --drift: ${(Math.random() - 0.5) * 60}px;
                width: ${Math.random() * 3 + 2}px;
                height: ${Math.random() * 3 + 2}px;
            `;
            fragment.appendChild(particle);
        }

        elements.journeyParticles.appendChild(fragment);
    }

    // ─── Ocean Bubbles ─────────────────────────────────────────────
    function generateBubbles() {
        if (!elements.oceanBubbles) return;

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < CONFIG.bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'ocean__bubble';
            const size = Math.random() * 15 + 5;
            bubble.style.cssText = `
                left: ${Math.random() * 100}%;
                bottom: -${size}px;
                width: ${size}px;
                height: ${size}px;
                --duration: ${Math.random() * 8 + 6}s;
                --delay: ${Math.random() * 10}s;
                --drift: ${(Math.random() - 0.5) * 40}px;
            `;
            fragment.appendChild(bubble);
        }

        elements.oceanBubbles.appendChild(fragment);
    }

    // ─── Parallax Engine ───────────────────────────────────────────
    function initParallax() {
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    function onScroll() {
        targetScrollY = window.scrollY;

        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateScroll);
        }
    }

    function updateScroll() {
        if (CONFIG.smoothScrolling) {
            scrollY += (targetScrollY - scrollY) * 0.1;
            if (Math.abs(targetScrollY - scrollY) > 0.5) {
                requestAnimationFrame(updateScroll);
            } else {
                scrollY = targetScrollY;
                ticking = false;
            }
        } else {
            scrollY = targetScrollY;
            ticking = false;
        }

        updateParallaxLayers();
        updateScrollProgress();
        updateNavState();
        updateActiveNavLink();
        updateDepthMeter();
    }

    function updateParallaxLayers() {
        elements.parallaxLayers.forEach((layer) => {
            const speed = parseFloat(layer.dataset.speed) || 0.1;
            const section = layer.closest('.section');

            if (!section) {
                layer.style.transform = `translate3d(0, ${scrollY * speed * CONFIG.parallaxIntensity}px, 0)`;
                return;
            }

            const rect = section.getBoundingClientRect();
            const sectionMiddle = rect.top + rect.height / 2;
            const viewportMiddle = window.innerHeight / 2;
            const offset = (sectionMiddle - viewportMiddle) * speed * CONFIG.parallaxIntensity;

            // Only apply parallax if section is somewhat visible
            if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
                layer.style.transform = `translate3d(0, ${offset}px, 0)`;
            }
        });
    }

    function updateScrollProgress() {
        if (!elements.scrollProgress) return;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (targetScrollY / docHeight) * 100 : 0;
        elements.scrollProgress.style.width = `${progress}%`;
        elements.scrollProgress.setAttribute('aria-valuenow', Math.round(progress));
    }

    function updateNavState() {
        if (!elements.mainNav) return;
        elements.mainNav.classList.toggle('scrolled', targetScrollY > 50);
    }

    function updateActiveNavLink() {
        let current = '';

        elements.sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.4) {
                current = section.id;
            }
        });

        if (current) {
            elements.navLinkElements.forEach((link) => {
                link.classList.toggle('active', link.dataset.section === current);
            });
        }
    }

    function updateDepthMeter() {
        if (!elements.depthFill) return;

        const oceanSection = document.getElementById('ocean');
        if (!oceanSection) return;

        const rect = oceanSection.getBoundingClientRect();
        const sectionProgress = Math.max(0, Math.min(1,
            (window.innerHeight - rect.top) / (rect.height + window.innerHeight)
        ));

        // Check if depth meter is horizontal (mobile) or vertical
        const isHorizontal = window.innerWidth <= 1024;
        if (isHorizontal) {
            elements.depthFill.style.width = `${sectionProgress * 100}%`;
            elements.depthFill.style.height = '100%';
        } else {
            elements.depthFill.style.height = `${sectionProgress * 100}%`;
        }
    }

    // ─── Animation Loop ────────────────────────────────────────────
    function startAnimationLoop() {
        function loop() {
            // Smooth scroll interpolation (runs independently)
            if (CONFIG.smoothScrolling && Math.abs(targetScrollY - scrollY) > 0.5) {
                scrollY += (targetScrollY - scrollY) * 0.1;
                updateParallaxLayers();
            }

            requestAnimationFrame(loop);
        }

        // Only start the continuous loop if smooth scrolling is enabled
        if (CONFIG.smoothScrolling) {
            // The main loop handles smooth parallax updates
            // Other updates are handled by the scroll event
        }
    }

    // ─── Cursor Glow ───────────────────────────────────────────────
    function initCursorGlow() {
        if (isTouchDevice || !CONFIG.cursorGlow || !elements.cursorGlow) return;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            elements.cursorGlow.style.transform = `translate(${mouseX - 150}px, ${mouseY - 150}px)`;
            elements.cursorGlow.classList.add('active');
        });

        document.addEventListener('mouseleave', () => {
            elements.cursorGlow.classList.remove('active');
        });
    }

    // ─── Scroll Reveal (Intersection Observer) ─────────────────────
    function initScrollReveal() {
        if (!supportsIntersectionObserver) {
            // Fallback: show everything
            document.querySelectorAll('.scroll-reveal, .reveal-text').forEach((el) => {
                el.classList.add('revealed');
            });
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px',
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Don't unobserve — allows re-entry if desired
                    // For one-shot: observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        elements.scrollRevealElements.forEach((el) => observer.observe(el));
        elements.revealTextElements.forEach((el) => {
            // Skip hero text — those are revealed on load
            if (!el.closest('.hero')) {
                observer.observe(el);
            }
        });
    }

    // ─── Navigation ────────────────────────────────────────────────
    function initNavigation() {
        if (elements.navToggle && elements.navLinks) {
            elements.navToggle.addEventListener('click', () => {
                const isOpen = elements.navLinks.classList.toggle('open');
                elements.navToggle.classList.toggle('active');
                elements.navToggle.setAttribute('aria-expanded', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            });

            // Close mobile nav on link click
            elements.navLinkElements.forEach((link) => {
                link.addEventListener('click', () => {
                    elements.navLinks.classList.remove('open');
                    elements.navToggle.classList.remove('active');
                    elements.navToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                });
            });
        }

        // Close mobile nav on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.navLinks?.classList.contains('open')) {
                elements.navLinks.classList.remove('open');
                elements.navToggle.classList.remove('active');
                elements.navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                elements.navToggle.focus();
            }
        });

        // Initial nav state
        updateNavState();
        updateActiveNavLink();

        // Listen to scroll for nav updates when reduced motion
        if (prefersReducedMotion) {
            window.addEventListener('scroll', () => {
                targetScrollY = window.scrollY;
                updateScrollProgress();
                updateNavState();
                updateActiveNavLink();
                updateDepthMeter();
            }, { passive: true });
        }
    }

    // ─── Smooth Scroll ─────────────────────────────────────────────
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;

                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // ─── Tilt Cards ────────────────────────────────────────────────
    function initTiltCards() {
        if (isTouchDevice || prefersReducedMotion) return;

        elements.tiltCards.forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -CONFIG.tiltIntensity;
                const rotateY = ((x - centerX) / centerX) * CONFIG.tiltIntensity;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

                // Update shine effect
                const shine = card.querySelector('.discover__card-shine, .gallery__card-shine');
                if (shine) {
                    const percentX = (x / rect.width) * 100;
                    const percentY = (y / rect.height) * 100;
                    shine.style.setProperty('--mouse-x', `${percentX}%`);
                    shine.style.setProperty('--mouse-y', `${percentY}%`);
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ─── Counter Animation ─────────────────────────────────────────
    function initCounters() {
        if (!supportsIntersectionObserver) {
            elements.statNumbers.forEach((el) => {
                el.textContent = el.dataset.count;
            });
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        elements.statNumbers.forEach((el) => observer.observe(el));
    }

    function animateCounter(element) {
        const target = parseInt(element.dataset.count, 10);
        const duration = CONFIG.counterDuration;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ─── Start ─────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();