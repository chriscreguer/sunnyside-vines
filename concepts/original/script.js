// GSAP Parallax Scrolling Effect
class GSAPParallaxController {
    constructor() {
        this.layers = {
            bg: { element: document.getElementById('bg-layer'), speed: 0.1 },
            haze: { element: document.getElementById('haze-layer'), speed: 0.4 },
            hill1: { element: document.getElementById('hill1-layer'), speed: 0.8 },
            hill2: { element: document.getElementById('hill2-layer'), speed: 1.2 }
        };
        
        this.isMobile = this.checkMobileDevice();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }
    
    // Check if device is mobile or has limited performance
    checkMobileDevice() {
        return window.innerWidth <= 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Initialize GSAP parallax effect
    init() {
        if (this.isMobile || this.isReducedMotion) {
            // Disable parallax on mobile and for users who prefer reduced motion
            this.disableParallax();
            return;
        }
        
        // Register ScrollTrigger and ScrollSmoother plugins
        gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
        
        // Initialize ScrollSmoother for smooth scroll jacking
        this.smoother = ScrollSmoother.create({
            wrapper: "#smooth-wrapper",
            content: "#smooth-content",
            smooth: 1.5, // Smoothness level (higher = smoother)
            effects: true, // Enable data-speed effects
            smoothTouch: 0.1, // Smooth on touch devices
            normalizeScroll: true, // Normalize scroll across browsers
            ignoreMobileResize: true // Ignore mobile resize events
        });
        
        // Set initial positions for rising parallax effect
        Object.keys(this.layers).forEach(key => {
            const layer = this.layers[key];
            if (layer.element) {
                // Reverse the logic: foreground layers start hidden below, background stays visible
                let initialOffset = 0; // Background starts normal
                
                if (key === 'bg') {
                    initialOffset = 0; // Background stays in place, most visible initially
                }
                if (key === 'haze') {
                    initialOffset = 43 * layer.speed; // Start partially hidden, will rise up
                }
                if (key === 'hill1') {
                    initialOffset = 36 * layer.speed; // Start moderately hidden below
                }
                if (key === 'hill2') {
                    initialOffset = 98 * layer.speed; // Start hidden but not too far below
                }
                
                gsap.set(layer.element, { yPercent: initialOffset });
                
                // Adjust movement range based on layer to ensure hill2 defines the end
                let movementRange = 120;
                if (key === 'hill2') {
                    movementRange = 100; // Reduce range for hill2 to prevent over-movement
                } else if (key === 'hill1') {
                    movementRange = 110; // Slightly reduce for hill1
                }
                
                gsap.to(layer.element, {
                    yPercent: initialOffset - (movementRange * layer.speed), // Negative movement = rising up
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".hero",
                        start: "top bottom",
                        end: "bottom bottom", // Stop when hero bottom hits viewport bottom
                        scrub: true
                    }
                });
            }
        });
        
        // Handle resize events
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    
    // Handle window resize
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = this.checkMobileDevice();
        
        // Refresh ScrollTrigger on resize
        ScrollTrigger.refresh();
        
        // If switching between mobile and desktop, reinitialize
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                this.disableParallax();
            } else {
                this.enableParallax();
            }
        }
    }
    
    // Disable parallax effect
    disableParallax() {
        if (this.smoother) {
            this.smoother.kill();
            this.smoother = null;
        }
        ScrollTrigger.killAll();
        
        Object.keys(this.layers).forEach(key => {
            const layer = this.layers[key];
            if (layer.element) {
                gsap.set(layer.element, { clearProps: "all" });
            }
        });
    }
    
    // Enable parallax effect
    enableParallax() {
        this.init();
    }
}

// Smooth scrolling for any anchor links
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        // Add smooth scrolling to any anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleClick.bind(this));
        });
    }
    
    handleClick(e) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Hero button interaction
class HeroInteractions {
    constructor() {
        this.heroButton = document.querySelector('.hero-button');
        this.init();
    }
    
    init() {
        if (this.heroButton) {
            this.heroButton.addEventListener('click', this.handleButtonClick.bind(this));
        }
    }
    
    handleButtonClick(e) {
        e.preventDefault();
        
        // Add ripple effect
        this.createRipple(e);
        
        // Scroll to content section
        const contentSection = document.querySelector('.content-section');
        if (contentSection) {
            setTimeout(() => {
                contentSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 150);
        }
    }
    
    createRipple(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        // Add ripple animation if not already defined
        if (!document.querySelector('#ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.monitor();
        }
    }
    
    monitor() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // If FPS drops below 30, consider disabling parallax
            if (this.fps < 30 && window.parallaxController) {
                console.warn('Low FPS detected, consider disabling parallax');
            }
        }
        
        requestAnimationFrame(this.monitor.bind(this));
    }
}

// Navbar Controller
class NavbarController {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.init();
    }
    
    init() {
        if (this.navbar) {
            window.addEventListener('scroll', this.handleScroll.bind(this));
        }
    }
    
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
}

// Mission Text Animation Controller
class MissionTextAnimator {
    constructor() {
        this.missionText = document.querySelector('.mission-text');
        this.words = document.querySelectorAll('.mission-text .word');
        this.init();
    }
    
    init() {
        if (!this.missionText || this.words.length === 0) {
            console.log('Mission text or words not found');
            return;
        }
        
        console.log(`Found ${this.words.length} words to animate`);
        
        // Register ScrollTrigger plugin
        gsap.registerPlugin(ScrollTrigger);
        
        // Create ScrollTrigger for word animations - use the hero section as trigger since mission text moves with parallax
        ScrollTrigger.create({
            trigger: ".hero",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            onUpdate: (self) => {
                // Calculate animation based on how far through the hero section we are
                const progress = self.progress;
                const totalWords = this.words.length;
                
                // Start animating when we're 60% through the hero, finish at 90%
                let animationProgress = 0;
                if (progress > 0.6) {
                    animationProgress = (progress - 0.6) / 0.3; // Maps 0.6-0.9 to 0-1
                    animationProgress = Math.min(animationProgress, 1);
                }
                
                const wordsToAnimate = Math.floor(animationProgress * totalWords);
                
                console.log(`Hero progress: ${progress}, Animation progress: ${animationProgress}, Words to animate: ${wordsToAnimate}`);
                
                // Animate words one by one
                this.words.forEach((word, index) => {
                    if (index <= wordsToAnimate) {
                        word.classList.add('animated');
                    } else {
                        word.classList.remove('animated');
                    }
                });
            }
        });
    }
}

// Spain Map Interactivity
class SpainMapController {
    constructor() {
        this.mapContainer = document.querySelector('.spain-map');
        this.init();
    }
    
    init() {
        if (!this.mapContainer) return;
        
        const cityMarkers = this.mapContainer.querySelectorAll('.city-marker');
        
        // Add click and hover handlers for city markers
        cityMarkers.forEach(marker => {
            marker.addEventListener('click', this.handleCityClick.bind(this));
            marker.addEventListener('mouseenter', this.handleCityHover.bind(this));
            marker.addEventListener('mouseleave', this.handleCityLeave.bind(this));
        });
    }
    
    handleCityClick(event) {
        const cityMarker = event.currentTarget;
        const cityName = cityMarker.getAttribute('data-city');
        console.log(`Clicked on city: ${cityName}`);
        // Add your city-specific functionality here
        // Example: show wine information for this region
    }
    
    handleCityHover(event) {
        const cityMarker = event.currentTarget;
        const cityName = cityMarker.getAttribute('data-city');
        console.log(`Hovering over: ${cityName}`);
        // Add any additional hover effects here if needed
    }
    
    handleCityLeave(event) {
        const cityMarker = event.currentTarget;
        const cityName = cityMarker.getAttribute('data-city');
        console.log(`Left: ${cityName}`);
        // Add any hover leave effects here if needed
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navbar controller
    new NavbarController();
    
    // Initialize GSAP parallax controller
    window.parallaxController = new GSAPParallaxController();
    
    // Initialize mission text animator
    new MissionTextAnimator();
    
    // Initialize Spain map controller
    new SpainMapController();
    
    // Initialize smooth scrolling
    new SmoothScroll();
    
    // Initialize hero interactions
    new HeroInteractions();
    
    // Initialize performance monitoring in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        new PerformanceMonitor();
    }
});

// Handle visibility change to pause/resume parallax
document.addEventListener('visibilitychange', () => {
    if (window.parallaxController) {
        if (document.hidden) {
            window.parallaxController.disableParallax();
        } else if (!window.parallaxController.isMobile && !window.parallaxController.isReducedMotion) {
            window.parallaxController.enableParallax();
        }
    }
});
