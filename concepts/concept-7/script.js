// Concept 7 JavaScript
// Add any interactive functionality here

document.addEventListener('DOMContentLoaded', () => {
    console.log('Concept 7 loaded');
    
    // Navbar scroll functionality
    const navbar = document.getElementById('navbar');
    const hero = document.getElementById('hero');
    
    if (navbar && hero) {
        const heroHeight = hero.offsetHeight;
        
        window.addEventListener('scroll', () => {
            // Show navbar at 50% of hero height
            if (window.scrollY > heroHeight * 0.5) {
                navbar.classList.add('visible');
            } else {
                navbar.classList.remove('visible');
            }
        });
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

