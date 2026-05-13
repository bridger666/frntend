/**
 * LED Panel Animation System
 * Uses SVG path elements as LED dots with three animation modes:
 * 1. Chasing Light - Sequential wave effect
 * 2. Ripple - Concentric circles from center
 * 3. Reactive Line - Horizontal scanning effect
 */

class LEDPanelAnimation {
    constructor(svgElement) {
        this.svg = svgElement;
        this.dots = [];
        this.currentMode = 0;
        this.animationFrame = null;
        this.isRunning = false;
        
        // Brand colors for LED lights
        this.colors = ['#4b47d6', '#5b5bef', '#75fbc4'];
        
        // Animation timing
        this.modeInterval = 8000; // Switch modes every 8 seconds
        this.lastModeSwitch = Date.now();
        
        this.init();
    }
    
    init() {
        // Get all path elements (LED dots)
        const paths = this.svg.querySelectorAll('path[id^="Path_"]');
        
        // Get SVG dimensions - use getAttribute as fallback
        let svgWidth = 1200;
        let svgHeight = 575;
        
        try {
            const viewBox = this.svg.viewBox.baseVal;
            if (viewBox && viewBox.width > 0) {
                svgWidth = viewBox.width;
                svgHeight = viewBox.height;
            }
        } catch (e) {
            console.log('Using default SVG dimensions');
        }
        
        console.log(`SVG dimensions: ${svgWidth}x${svgHeight}`);
        
        // Calculate grid dimensions (approximate)
        const cols = 60; // Approximate number of columns
        const rows = 30; // Approximate number of rows
        
        paths.forEach((path, index) => {
            // Store original fill
            const originalFill = path.getAttribute('fill');
            
            // Set initial state: invisible
            path.style.opacity = '0';
            path.style.transition = 'opacity 0.3s ease, fill 0.3s ease';
            
            // Calculate position based on index (grid layout)
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = (col / cols) * svgWidth;
            const y = (row / rows) * svgHeight;
            
            this.dots.push({
                element: path,
                index: index,
                x: x,
                y: y,
                originalFill: originalFill,
                isLit: false,
                litTime: 0
            });
        });
        
        console.log(`LED Panel initialized with ${this.dots.length} dots`);
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('Starting LED animation loop');
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        // Turn off all dots
        this.dots.forEach(dot => this.turnOffDot(dot));
    }
    
    animate() {
        if (!this.isRunning) return;
        
        const now = Date.now();
        
        // Switch animation mode periodically
        if (now - this.lastModeSwitch > this.modeInterval) {
            this.currentMode = (this.currentMode + 1) % 3;
            this.lastModeSwitch = now;
            console.log(`Switching to animation mode ${this.currentMode}`);
        }
        
        // Run current animation mode
        switch(this.currentMode) {
            case 0:
                this.chasingLightAnimation(now);
                break;
            case 1:
                this.rippleAnimation(now);
                break;
            case 2:
                this.reactiveLineAnimation(now);
                break;
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    // Mode 1: Chasing Light - Sequential wave effect
    chasingLightAnimation(timestamp) {
        const waveSpeed = 0.01; // Faster wave
        const waveLength = 100; // Wider wave
        const fadeTime = 1500; // Shorter fade time
        
        const wavePosition = (timestamp * waveSpeed) % this.dots.length;
        
        this.dots.forEach((dot, index) => {
            const distance = Math.abs(index - wavePosition);
            
            if (distance < waveLength) {
                // Light up dot
                if (!dot.isLit) {
                    this.lightUpDot(dot);
                    dot.litTime = timestamp;
                }
            }
            
            // Fade out after fadeTime
            if (dot.isLit && timestamp - dot.litTime > fadeTime) {
                this.turnOffDot(dot);
            }
        });
    }
    
    // Mode 2: Ripple - Concentric circles from center
    rippleAnimation(timestamp) {
        const rippleSpeed = 0.1; // Speed of ripple expansion
        const rippleInterval = 3000; // Time between ripples
        const rippleWidth = 80; // Width of ripple ring
        const fadeTime = 2000;
        
        // Calculate SVG center
        const centerX = 600; // Half of 1200
        const centerY = 287.5; // Half of 575
        
        const ripplePhase = (timestamp % rippleInterval) / rippleInterval;
        const rippleRadius = ripplePhase * 600; // Max radius
        
        this.dots.forEach(dot => {
            const dx = dot.x - centerX;
            const dy = dot.y - centerY;
            const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
            
            const distanceFromRipple = Math.abs(distanceFromCenter - rippleRadius);
            
            if (distanceFromRipple < rippleWidth) {
                // Light up dot
                if (!dot.isLit) {
                    this.lightUpDot(dot);
                    dot.litTime = timestamp;
                }
            }
            
            // Fade out after fadeTime
            if (dot.isLit && timestamp - dot.litTime > fadeTime) {
                this.turnOffDot(dot);
            }
        });
    }
    
    // Mode 3: Reactive Line - Horizontal scanning effect
    reactiveLineAnimation(timestamp) {
        const scanSpeed = 0.0008; // Speed of scan line
        const lineHeight = 60; // Height of scan line
        const fadeTime = 2500;
        
        // Get SVG bounds
        const svgHeight = 575;
        
        const scanPosition = ((timestamp * scanSpeed) % 1) * svgHeight;
        
        this.dots.forEach(dot => {
            const distance = Math.abs(dot.y - scanPosition);
            
            if (distance < lineHeight) {
                // Light up dot
                if (!dot.isLit) {
                    this.lightUpDot(dot);
                    dot.litTime = timestamp;
                }
            }
            
            // Fade out after fadeTime
            if (dot.isLit && timestamp - dot.litTime > fadeTime) {
                this.turnOffDot(dot);
            }
        });
    }
    
    lightUpDot(dot) {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        dot.element.setAttribute('fill', color);
        dot.element.style.opacity = '0.9';
        dot.isLit = true;
    }
    
    turnOffDot(dot) {
        dot.element.style.opacity = '0';
        dot.isLit = false;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing LED panel...');
    
    // Load SVG and initialize animation
    const svgPath = 'aivory_new_animation_background.svg';
    
    fetch(svgPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(svgText => {
            console.log('SVG loaded successfully');
            
            // Create container for SVG
            const container = document.createElement('div');
            container.id = 'led-panel-background';
            container.innerHTML = svgText;
            
            // Insert into hero section
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.insertBefore(container, hero.firstChild);
                console.log('SVG container inserted into hero');
                
                // Get SVG element
                const svg = container.querySelector('svg');
                if (svg) {
                    console.log('SVG element found, initializing animation...');
                    
                    // Initialize and start animation
                    const ledPanel = new LEDPanelAnimation(svg);
                    ledPanel.start();
                    
                    console.log('LED Panel animation started successfully');
                    
                    // Test: Light up first 10 dots immediately to verify it works
                    setTimeout(() => {
                        console.log('Testing: lighting up first 10 dots');
                        for (let i = 0; i < Math.min(10, ledPanel.dots.length); i++) {
                            ledPanel.lightUpDot(ledPanel.dots[i]);
                        }
                    }, 1000);
                } else {
                    console.error('SVG element not found in loaded content');
                }
            } else {
                console.error('Hero section not found');
            }
        })
        .catch(error => {
            console.error('Failed to load LED panel SVG:', error);
            console.error('Attempted path:', svgPath);
        });
});
