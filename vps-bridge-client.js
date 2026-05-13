/**
 * VPS Bridge Client for Aivory Console
 * Connects frontend to VPS → PicoClaw → n8n
 * NO LLM KEYS EXPOSED IN FRONTEND
 */

class VPSBridgeClient {
    constructor() {
        // Get config from window or environment
        this.baseUrl = window.VPS_BRIDGE_URL || 'http://43.156.108.96:3001';
        this.apiKey = window.VPS_BRIDGE_API_KEY || '';
        this.sessionId = this.generateSessionId();
        
        if (!this.apiKey) {
            console.warn('⚠️ VPS_BRIDGE_API_KEY not configured');
        }
    }
    
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Send message to VPS bridge
     */
    async chat(message, context = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': this.apiKey
                },
                body: JSON.stringify({
                    message,
                    sessionId: this.sessionId,
                    context
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            // Return the data from PicoClaw
            return {
                response: data.data.diagnosis || data.data.response || JSON.stringify(data.data, null, 2),
                data: data.data,
                requestId: data.requestId
            };
            
        } catch (error) {
            console.error('VPS Bridge error:', error);
            throw error;
        }
    }
    
    /**
     * Get session history
     */
    async getSession() {
        try {
            const response = await fetch(`${this.baseUrl}/api/session/${this.sessionId}`, {
                headers: {
                    'X-Api-Key': this.apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data.data;
            
        } catch (error) {
            console.error('Get session error:', error);
            throw error;
        }
    }
    
    /**
     * Clear session
     */
    async clearSession() {
        try {
            await fetch(`${this.baseUrl}/api/session/${this.sessionId}`, {
                method: 'DELETE',
                headers: {
                    'X-Api-Key': this.apiKey
                }
            });
            
            this.sessionId = this.generateSessionId();
            
        } catch (error) {
            console.error('Clear session error:', error);
            throw error;
        }
    }
    
    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check error:', error);
            return { status: 'error', error: error.message };
        }
    }
    
    /**
     * Check if bridge is configured
     */
    isConfigured() {
        return !!(this.baseUrl && this.apiKey);
    }
}

// Export for use in console.js
window.VPSBridgeClient = VPSBridgeClient;
