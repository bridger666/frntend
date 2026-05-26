/**
 * Holographic Wave Mesh Animation (Composio Style)
 * Always looping, continuous wave animation.
 */
class LEDHeroBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        this.points = [];
        this.animationFrame = null;

        // Configuration
        this.config = {
            cols: 50,
            rows: 30,
            spacingX: 80,
            spacingZ: 80,
            centerFadeRadius: 0.28,
            centerFadeStrength: 0.1,
            waveSpeed: 0.015,
            waveHeight: 120,
            fov: 600,
            baseY: 250, // Move grid down
            colors: {
                cyan: [0, 229, 158],   // Aivory Accent #00e59e
                purple: [123, 123, 255], // Soft purple/blue
                dark: [5, 5, 5]
            }
        };

        this.init();
    }

    init() {
        if (!this.setupCanvas()) {
            setTimeout(() => this.init(), 100);
            return;
        }

        this.createGrid();
        this.startAnimation();

        window.addEventListener('resize', () => {
            if (this.setupCanvas()) {
                this.createGrid();
            }
        });

        console.log('Holographic Wave Mesh initialized');
    }

    setupCanvas() {
        const hero = this.canvas.parentElement;
        if (!hero) return false;

        const rect = hero.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        if (this.canvas.width === 0 || this.canvas.height === 0) return false;
        return true;
    }

    createGrid() {
        this.points = [];
        const { cols, rows, spacingX, spacingZ, baseY } = this.config;

        for (let z = 0; z < rows; z++) {
            for (let x = 0; x < cols; x++) {
                this.points.push({
                    x: (x - cols / 2) * spacingX,
                    z: z * spacingZ + 200, // Start slightly away from camera
                    baseY: baseY,
                    col: x,
                    row: z
                });
            }
        }
    }

    interpolateColor(color1, color2, factor) {
        return [
            Math.round(color1[0] + (color2[0] - color1[0]) * factor),
            Math.round(color1[1] + (color2[1] - color1[1]) * factor),
            Math.round(color1[2] + (color2[2] - color1[2]) * factor)
        ];
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const { fov, waveHeight, colors } = this.config;
        const w = this.canvas.width / 2;
        const h = this.canvas.height / 2 - 100; // Shift up slightly

        // We draw back to front (highest Z first)
        for (let i = this.points.length - 1; i >= 0; i--) {
            const p = this.points[i];

            // Complex wave math combining multiple sine waves for a fluid look
            const wave1 = Math.sin(p.x * 0.005 + this.time);
            const wave2 = Math.cos(p.z * 0.008 + this.time * 1.2);
            const wave3 = Math.sin((p.x + p.z) * 0.004 - this.time * 0.7);

            // Normalize combined wave to roughly -1 to 1
            const waveValue = (wave1 + wave2 + wave3) / 3;

            const heightVariation = waveValue * waveHeight;
            const topY = p.baseY - 80 - Math.max(0, heightVariation);

            const scale = fov / p.z;
            const screenX = w + p.x * scale;
            const screenTopY = h + topY * scale;
            const screenBottomY = h + p.baseY * scale;

            // Frustum culling (skip drawing if off screen)
            if (screenX < -100 || screenX > this.canvas.width + 100) continue;

            // Calculate depth fade
            const maxZ = this.config.rows * this.config.spacingZ;
            const depthAlpha = Math.max(0, 1 - (p.z / maxZ));

            // Color mapping based on wave height
            // waveValue is -1 to 1. Map to 0 to 1
            const t = (waveValue + 1) / 2;
            const color = this.interpolateColor(colors.purple, colors.cyan, t);

            // Draw vertical glowing bar
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, screenBottomY);
            this.ctx.lineTo(screenX, screenTopY);

            // Perspective thickness
            const thickness = Math.max(0.5, scale * 3);
            this.ctx.lineWidth = thickness;
            this.ctx.lineCap = 'round';

            // Highlight peaks with higher opacity
            const highlightAlpha = Math.max(0.13, t * 1.04);
            const finalAlpha = depthAlpha * highlightAlpha;

            const { centerFadeRadius, centerFadeStrength } = this.config;
            const distFromCenter = Math.abs(screenX - this.canvas.width / 2) / (this.canvas.width / 2);
            let centerMask = 1;
            if (distFromCenter < centerFadeRadius) {
                const t = distFromCenter / centerFadeRadius;
                centerMask = centerFadeStrength + (1 - centerFadeStrength) * (0.5 - 0.5 * Math.cos(t * Math.PI));
            }
            const maskedAlpha = finalAlpha * centerMask * 0.3;

            this.ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${maskedAlpha})`;
            this.ctx.stroke();

            // Draw a tiny bright dot at the top of the bar to simulate LED node
            if (t > 0.5) {
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenTopY, thickness * 0.8, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${maskedAlpha * 1.5})`;
                this.ctx.fill();
            }
        }
    }

    animate() {
        this.time += this.config.waveSpeed;
        this.render();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.animate();
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.ledHeroBackground = new LEDHeroBackground('led-hero-bg');
        }, 50);
    });
} else {
    requestAnimationFrame(() => {
        window.ledHeroBackground = new LEDHeroBackground('led-hero-bg');
    });
}
