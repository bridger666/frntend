/**
 * AIVORY AI Console - Unified ARIA Module
 * Single source of truth for ARIA agent behavior
 */

class ARIAAgent {
    constructor(config) {
        this.config = {
            tier: config.tier || 'enterprise',
            userId: config.userId || 'demo_user',
            has_snapshot: config.has_snapshot || false,
            has_blueprint: config.has_blueprint || false,
            credits: config.credits || 0
        };
        
        this.systemPrompt = null;
        this.conversationHistory = [];
        this.currentLanguage = 'en';
        this.isInitialized = false;
    }
    
    async initialize() {
        await this.loadSystemPrompt();
        this.restoreConversation();
        this.isInitialized = true;
        console.log('ARIA Agent initialized');
    }
    
    async loadSystemPrompt() {
        try {
            const response = await fetch('http://localhost:8081/api/console/prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tier: this.config.tier,
                    has_snapshot: this.config.has_snapshot,
                    has_blueprint: this.config.has_blueprint
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.systemPrompt = data.prompt;
            } else {
                this.systemPrompt = this.getFallbackPrompt();
            }
        } catch (error) {
            console.warn('Failed to load ARIA prompt, using fallback');
            this.systemPrompt = this.getFallbackPrompt();
        }
    }
    
    detectLanguage(message) {
        const indonesianPatterns = /\b(saya|anda|dengan|untuk|dari|yang|ini|itu|bisa|mau|ingin|tolong|bantu)\b/i;
        if (indonesianPatterns.test(message)) return 'id';
        
        const arabicPattern = /[\u0600-\u06FF]/;
        if (arabicPattern.test(message)) return 'ar';
        
        return 'en';
    }
    
    async sendMessage(message, options = {}) {
        const language = this.detectLanguage(message);
        this.currentLanguage = language;

        const payload = {
            message: message,
            files: options.files || [],
            workflow: options.workflow || null,
            context: {
                tier: this.config.tier,
                user_id: this.config.userId,
                has_snapshot: this.config.has_snapshot,
                has_blueprint: this.config.has_blueprint,
                language: language,
                conversation_history: this.conversationHistory.slice(-10)
            }
        };

        try {
            const response = await this.callBackendEndpoint(payload);
            this.conversationHistory.push({
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            });
            this.conversationHistory.push({
                role: 'assistant',
                content: response.response,
                timestamp: new Date().toISOString(),
                reasoning: response.reasoning
            });
            return response;
        } catch (error) {
            console.warn('Backend failed, trying skill handler:', error.message);
            return await this.callSkillHandlerFallback(payload);
        }
    }

    async callBackendEndpoint(payload) {
        const response = await fetch('http://localhost:8081/api/console/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Backend error ${response.status}`);
        return await response.json();
    }

    /**
     * Fallback: route through the universal skill handler when the local backend
     * is unavailable. Uses the standard skill envelope.
     */
    async callSkillHandlerFallback(payload) {
        const SKILL_HANDLER_URL = 'http://43.156.108.96:5678/webhook/zeroclaw-skill-handler-V2';

        const body = {
            skill: 'console_chat',
            context: {
                org_id:     this.config.userId || 'default',
                user_id:    this.config.userId || 'anonymous',
                session_id: `session-${Date.now()}`,
                payload: {
                    message: payload.message,
                    history: payload.context.conversation_history || []
                }
            },
            meta: {
                source:       'console',
                trace_id:     `trace-${Date.now()}`,
                requested_by: 'console-aria'
            }
        };

        const response = await fetch(SKILL_HANDLER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error(`Skill handler error: ${response.status}`);

        const data = await response.json();

        if (data.status === 'error') {
            throw new Error(data.message || 'Skill handler returned an error');
        }

        const result = data.result || data;
        const reply = result.reply ?? result.response ?? '';

        this.conversationHistory.push({
            role: 'user',
            content: payload.message,
            timestamp: new Date().toISOString()
        });
        this.conversationHistory.push({
            role: 'assistant',
            content: reply,
            timestamp: new Date().toISOString()
        });

        return {
            response: reply,
            reasoning: {
                model:      result.model ?? result.model_used ?? 'unknown',
                tokens:     reply.split(' ').length * 2,
                confidence: 0.85,
                cost:       1
            },
            credits_remaining: this.config.credits - 1
        };
    }
    
    streamText(container, text, onComplete) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            container.innerHTML = this.renderMarkdown(text);
            if (onComplete) onComplete();
            return;
        }
        
        let index = 0;
        const charsPerFrame = 2;
        const frameDelay = 20;
        let accumulatedText = '';
        
        const addNextChars = () => {
            if (index < text.length) {
                const nextChars = text.slice(index, index + charsPerFrame);
                accumulatedText += nextChars;
                index += charsPerFrame;
                container.innerHTML = this.renderMarkdown(accumulatedText);
                setTimeout(addNextChars, frameDelay);
            } else {
                container.innerHTML = this.renderMarkdown(text);
                if (onComplete) onComplete();
            }
        };
        
        addNextChars();
    }
    
    renderMarkdown(text) {
        if (typeof marked === 'undefined') {
            return this.escapeHtml(text).replace(/\n/g, '<br>');
        }
        text = this.stripEmojis(text);
        return marked.parse(text);
    }
    
    stripEmojis(text) {
        return text.replace(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]/gu, '').trim();
    }
    
    saveConversation() {
        try {
            const messagesToStore = this.conversationHistory.slice(-50);
            localStorage.setItem('aria_conversation', JSON.stringify(messagesToStore));
        } catch (error) {
            console.error('Error saving conversation:', error);
        }
    }
    
    restoreConversation() {
        try {
            const stored = localStorage.getItem('aria_conversation');
            if (stored) {
                this.conversationHistory = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error restoring conversation:', error);
        }
    }
    
    clearConversation() {
        this.conversationHistory = [];
        localStorage.removeItem('aria_conversation');
    }
    
    getFallbackPrompt() {
        return `# ARIA PROTOCOL v2.0
You are ARIA – Aivory Reasoning & Intelligence Assistant.
Multilingual: EN/ID/AR. Business-centric. Aivory-focused solutions.`;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

window.ARIAAgent = ARIAAgent;
