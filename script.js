// Concept 1 JavaScript - No Animations Version
class Concept1Controller {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupButtonInteraction();
    }
    
    setupButtonInteraction() {
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Scroll to image section
                const imageSection = document.querySelector('.image-section');
                if (imageSection) {
                    imageSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Concept1Controller();
});

// Handle window resize for responsive adjustments
window.addEventListener('resize', () => {
    // Refresh any size-dependent calculations if needed
    console.log('Window resized - concept 1');
});