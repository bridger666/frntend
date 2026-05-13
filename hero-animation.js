// ============================================================================
// AIVORY HERO BACKGROUND ANIMATION
// Hybrid: Star Flicker + Runway Sequencing
// ============================================================================

class AivoryHeroAnimation {
    constructor(config = {}) {
        // Configuration - LED Chase style
        this.chaseDuration = config.chaseDuration || 2000; // Duration of one chase sequence
        this.chaseInterval = config.chaseInterval || 3000; // Time between chase sequences
        this.lightsPerChase = config.lightsPerChase || 8; // Number of lights in chase wave
        this.fadeInDuration = config.fadeInDuration || 150;
        this.fadeOutDuration = config.fadeOutDuration || 300;
        this.randomChaseChance = config.randomChaseChance || 0.3; // 30% chance of random chase
        
        // State
        this.elements = [];
        this.activeLights = new Set();
        this.isRunning = false;
        this.chaseTimeout = null;
        
        this.init();
    }
    
    init() {
        // Find all group elements in the SVG
        const svg = document.querySelector('.hero svg');
        if (!svg) {
            console.warn('Hero SVG not found');
            return;
        }
        
        // Get all groups (Group_3 through Group_35)
        const groups = svg.querySelectorAll('[id^="Group_"]');
        
        // Initialize all elements with opacity 0 and store references
        groups.forEach((group, index) => {
            group.style.opacity = '0';
            group.style.transition = 'opacity 0.2s ease';
            
            this.elements.push({
                element: group,
                index: index,
                isActive: false,
                timeout: null,
                x: this.getGroupX(group)
            });
        });
        
        // Sort elements by X position for runway effect
        this.elements.sort((a, b) => a.x - b.x);
        
        console.log(`Aivory Animation: Initialized ${this.elements.length} light elements`);
    }
    
    getGroupX(group) {
        // Get the X position from the first rect in the group
        const rect = group.querySelector('rect');
        if (rect) {
            const transform = rect.getAttribute('transform');
            const match = transform.match(/translate\(([0-9.]+)/);
            return match ? parseFloat(match[1]) : 0;
        }
        return 0;
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        // Start LED chase sequences
        this.scheduleChase();
        
        console.log('Aivory Animation: Started LED Chase');
    }
    
    stop() {
        this.isRunning = false;
        
        // Clear timeout
        if (this.chaseTimeout) clearTimeout(this.chaseTimeout);
        
        // Reset all elements
        this.elements.forEach(item => {
            item.element.style.opacity = '0';
            item.isActive = false;
        });
        
        this.activeLights.clear();
        
        console.log('Aivory Animation: Stopped');
    }
    
    scheduleChase() {
        if (!this.isRunning) return;
        
        // Always use sequential chase from left to right
        this.sequentialChase();
        
        // Schedule next chase
        this.chaseTimeout = setTimeout(() => {
            this.scheduleChase();
        }, this.chaseInterval);
    }
    
    sequentialChase() {
        // LED chase from left to right
        const totalElements = this.elements.length;
        const stepDelay = this.chaseDuration / totalElements;
        
        this.elements.forEach((item, i) => {
            setTimeout(() => {
                if (!this.isRunning) return;
                this.lightUp(item);
            }, i * stepDelay);
        });
    }
    
    randomChase() {
        // Random order chase
        const shuffled = [...this.elements].sort(() => Math.random() - 0.5);
        const stepDelay = this.chaseDuration / shuffled.length;
        
        shuffled.forEach((item, i) => {
            setTimeout(() => {
                if (!this.isRunning) return;
                this.lightUp(item);
            }, i * stepDelay);
        });
    }
    
    lightUp(item) {
        if (!this.isRunning || item.isActive) return;
        
        item.isActive = true;
        this.activeLights.add(item.index);
        
        // Fade in
        item.element.style.transition = `opacity ${this.fadeInDuration}ms ease`;
        item.element.style.opacity = '1';
        
        // Schedule fade out
        setTimeout(() => {
            if (!this.isRunning) return;
            
            item.element.style.transition = `opacity ${this.fadeOutDuration}ms ease`;
            item.element.style.opacity = '0';
            
            setTimeout(() => {
                item.isActive = false;
                this.activeLights.delete(item.index);
            }, this.fadeOutDuration);
            
        }, this.fadeInDuration + 200);
    }
    
    random(min, max) {
        return Math.random() * (max - min) + min;
    }
}

// Initialize animation when DOM is ready
let aivoryAnimation = null;

function initAivoryAnimation() {
    // Wait a bit for SVG to be fully loaded
    setTimeout(() => {
        aivoryAnimation = new AivoryHeroAnimation({
            chaseDuration: 2000,
            chaseInterval: 3000,
            lightsPerChase: 8,
            fadeInDuration: 150,
            fadeOutDuration: 300,
            randomChaseChance: 0.3
        });
        
        aivoryAnimation.start();
    }, 500);
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAivoryAnimation);
} else {
    initAivoryAnimation();
}

// Export for manual control if needed
window.AivoryHeroAnimation = AivoryHeroAnimation;
window.aivoryAnimation = aivoryAnimation;
