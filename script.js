// Concept 6 JavaScript
// Add any interactive functionality here

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sunnyside Vines loaded');

    initScrollReveal();

    // Navbar scroll functionality
    const navbar = document.getElementById('navbar');
    const hero = document.getElementById('hero');
    
    const scrollCue = document.querySelector('.scroll-cue');

    if (navbar && hero) {
        const heroHeight = hero.offsetHeight;

        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;

            // Show navbar at 50% of hero height
            if (scrolled > heroHeight * 0.5) {
                navbar.classList.add('visible');
            } else {
                navbar.classList.remove('visible');
            }

            // Fade out scroll cue
            if (scrollCue) {
                scrollCue.style.opacity = scrolled > 60 ? '0' : '';
            }
        }, { passive: true });
    }
    
    // Hamburger menu functionality
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }
});

// Scroll-triggered reveal animations
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const delay = parseInt(el.dataset.revealDelay, 10) || 0;
            setTimeout(() => el.classList.add('revealed'), delay);
            observer.unobserve(el);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    const revealConfigs = [
        ['.mission-statement', 'reveal', 0],
        ['.icon-1',            'reveal-icon', 100],
        ['.icon-2',            'reveal-icon', 250],
        ['.icon-3',            'reveal-icon', 400],
        ['.producer-heading',  'reveal', 0],
        ['.producer-photos',   'reveal', 120],
        ['.producer-info',     'reveal', 240],
        ['.map-container',     'reveal', 180],
        ['.story-left',        'reveal', 0],
        ['.story-right',       'reveal', 160],
        ['.contact-left',      'reveal', 0],
        ['.contact-right',     'reveal', 160],
    ];

    revealConfigs.forEach(([selector, className, delay]) => {
        const el = document.querySelector(selector);
        if (!el) return;
        el.classList.add(className);
        el.dataset.revealDelay = delay;
        observer.observe(el);
    });
}

// Copy email function
function copyEmail() {
    const email = 'info@sunnysidevines.com';
    navigator.clipboard.writeText(email).then(() => {
        const button = document.querySelector('.copy-button');
        const svg = button.querySelector('svg');
        const originalHTML = button.innerHTML;
        
        // Show checkmark
        button.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8L6 11L13 4" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
        }, 2000);
    });
}

