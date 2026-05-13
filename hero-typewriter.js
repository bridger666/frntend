/**
 * Hero Typewriter Animation
 * Animates the hero title with typewriter effect cycling through different messages
 */

class HeroTypewriter {
    constructor(elementId) {
        this.element = document.getElementById(elementId) || document.querySelector('.hero-title');
        if (!this.element) {
            console.error('Typewriter element not found');
            return;
        }

        // Store original text as the base
        this.baseText = "Know what to build before you build it";
        
        // Sentences to cycle through
        this.sentences = [
            "Know what to build before you build it",
            "See the system before you automate it",
            "Clarity first, deploy after",
            "AI that solves your business objective",
            "Understand the process before the solution",
            "Design smarter automation, start with insight",
            "From insight to action, clarity leads the way",
            "Know what to automate before you automate it"
        ];

        // Configuration
        this.config = {
            typingSpeed: 25,        // ms per character when typing
            deletingSpeed: 10,      // ms per character when deleting
            pauseAfterTyping: 2000, // ms to pause after completing a sentence
            pauseBeforeDeleting: 1500, // ms to pause before starting to delete
            cursorBlinkSpeed: 530   // ms for cursor blink
        };

        // State
        this.state = {
            currentSentenceIndex: 0,
            currentText: '',
            isTyping: true,
            isDeleting: false,
            isPaused: false,
            charIndex: 0
        };

        this.cursorVisible = true;
        this.timeoutId = null;
        this.cursorIntervalId = null;

        this.init();
    }

    init() {
        // Start with first sentence
        this.state.currentSentenceIndex = 0;
        this.state.currentText = '';
        this.state.charIndex = 0;
        this.state.isTyping = true;
        
        // Start cursor blink
        this.startCursorBlink();
        
        // Start typing animation
        this.type();
        
        console.log('Hero Typewriter initialized');
        console.log(`Cycling through ${this.sentences.length} sentences`);
    }

    startCursorBlink() {
        this.cursorIntervalId = setInterval(() => {
            this.cursorVisible = !this.cursorVisible;
            this.updateDisplay();
        }, this.config.cursorBlinkSpeed);
    }

    stopCursorBlink() {
        if (this.cursorIntervalId) {
            clearInterval(this.cursorIntervalId);
            this.cursorIntervalId = null;
        }
    }

    updateDisplay() {
        if (!this.element) return;
        
        // Create cursor element
        const cursor = this.cursorVisible ? '<span class="typewriter-cursor">|</span>' : '<span class="typewriter-cursor" style="opacity: 0;">|</span>';
        
        // Update element with current text and cursor
        this.element.innerHTML = this.state.currentText + cursor;
    }

    type() {
        const currentSentence = this.sentences[this.state.currentSentenceIndex];
        
        if (this.state.charIndex < currentSentence.length) {
            // Add next character
            this.state.currentText = currentSentence.substring(0, this.state.charIndex + 1);
            this.state.charIndex++;
            this.updateDisplay();
            
            // Continue typing
            this.timeoutId = setTimeout(() => this.type(), this.config.typingSpeed);
        } else {
            // Finished typing current sentence
            this.state.isTyping = false;
            
            // Pause before deleting
            this.timeoutId = setTimeout(() => this.delete(), this.config.pauseAfterTyping);
        }
    }

    delete() {
        if (this.state.charIndex > 0) {
            // Remove last character
            this.state.charIndex--;
            this.state.currentText = this.sentences[this.state.currentSentenceIndex].substring(0, this.state.charIndex);
            this.updateDisplay();
            
            // Continue deleting
            this.timeoutId = setTimeout(() => this.delete(), this.config.deletingSpeed);
        } else {
            // Finished deleting
            this.state.isDeleting = false;
            
            // Move to next sentence
            this.state.currentSentenceIndex = (this.state.currentSentenceIndex + 1) % this.sentences.length;
            this.state.charIndex = 0;
            this.state.isTyping = true;
            
            // Start typing next sentence after brief pause
            this.timeoutId = setTimeout(() => this.type(), this.config.pauseBeforeDeleting);
        }
    }

    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.stopCursorBlink();
        console.log('Typewriter animation stopped');
    }

    restart() {
        this.stop();
        this.init();
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a brief moment for page to settle
        setTimeout(() => {
            window.heroTypewriter = new HeroTypewriter('hero-title');
        }, 500);
    });
} else {
    setTimeout(() => {
        window.heroTypewriter = new HeroTypewriter('hero-title');
    }, 500);
}
