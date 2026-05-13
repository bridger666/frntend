/**
 * AIVORY AI Console - ARIA n8n Integration
 * Handles message streaming and API communication via ARIA webhook
 * 
 * REPLACES: Zenclaw integration
 * CONNECTS TO: n8n ARIA webhook on VPS (43.156.108.96:5678)
 */

// ============================================================================
// MESSAGE SENDING WITH ARIA
// ============================================================================

/**
 * Send message to ARIA n8n webhook with simulated streaming
 * @param {string} userMessage - User's message
 */
async function sendMessageWithSimulatedStreaming(userMessage) {
    // NOTE: User message is already added by sendMessage() function
    // This function only handles the AI response
    
    // Show typing indicator
    showTypingIndicator('Thinking...');
    
    // Track thinking time
    const startTime = Date.now();
    
    // Build history from last 10 messages
    const history = ConsoleState.messages
        .slice(-10)
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));
    
    try {
        // Call ARIA via the client helper
        const data = await window.AriaClient.sendConsoleMessage(userMessage, history, {
            userId: ConsoleState.userId || 'anonymous',
            sessionId: ConsoleState.sessionId || generateSessionId(),
        });
        
        const reply = data.reply || 'No response received.';
        const modelUsed = data.model || 'unknown';
        const intent = data.intent || 'general';
        
        // Calculate thinking time
        const thinkingTime = ((Date.now() - startTime) / 1000).toFixed(1);
        
        // Deduct 1 credit per message
        if (typeof ConsoleState !== 'undefined' && ConsoleState.credits) {
            ConsoleState.credits = Math.max(0, ConsoleState.credits - 1);
            if (typeof updateUI === 'function') {
                updateUI();
            }
        }
        
        // Hide typing indicator BEFORE rendering message
        hideTypingIndicator();
        
        // Auto-detect workflow JSON and handle accordingly
        const jsonMatch = reply.match(/```json([\s\S]*?)```/);
        if (jsonMatch) {
            try {
                const workflowPayload = JSON.parse(jsonMatch[1].trim());
                if (workflowPayload.trigger === 'aivory_workflow') {
                    console.log('Workflow trigger detected in response');
                    // Workflow handling can be added here if needed
                }
            } catch (e) {
                console.warn('Could not parse workflow JSON:', e);
            }
        }
        
        // Add AI response AFTER hiding typing indicator with metadata
        addMessage('assistant', reply, [], {
            tokens: reply.split(' ').length,
            confidence: 0.95,
            cost: 1,
            model: modelUsed,
            intent: intent,
            thinkingTime: thinkingTime
        });
        
        // Save conversation
        if (typeof saveConversation === 'function') {
            saveConversation();
        }
        
    } catch (error) {
        hideTypingIndicator();
        console.error('ARIA fetch error:', error);
        
        // User-friendly error message
        const errorMsg = `⚠️ Connection error: ${error.message}\n\nUnable to reach ARIA AI service. Please check:\n1. n8n server is running on 43.156.108.96:5678\n2. ARIA webhook is active\n3. Network/firewall allows connection`;
        
        addMessage('assistant', errorMsg);
        
        if (typeof saveConversation === 'function') {
            saveConversation();
        }
    }
}

// ============================================================================
// DIAGNOSTIC INTEGRATION
// ============================================================================

/**
 * Run diagnostic via ARIA
 * @param {string} diagnosticQuery - Diagnostic question or context
 * @param {Array} history - Conversation history
 * @returns {Promise<Object>} Diagnostic result
 */
async function runDiagnosticViaAria(diagnosticQuery, history = []) {
    try {
        showTypingIndicator('Running diagnostic...');
        
        const result = await window.AriaClient.runDiagnostic(diagnosticQuery, history, {
            userId: ConsoleState.userId || 'anonymous',
            sessionId: ConsoleState.sessionId || generateSessionId(),
        });
        
        hideTypingIndicator();
        return result;
        
    } catch (error) {
        hideTypingIndicator();
        console.error('Diagnostic error:', error);
        throw error;
    }
}

// ============================================================================
// BLUEPRINT INTEGRATION
// ============================================================================

/**
 * Generate blueprint via ARIA
 * @param {string} blueprintPrompt - Blueprint generation prompt
 * @returns {Promise<Object>} Blueprint/workflow object
 */
async function generateBlueprintViaAria(blueprintPrompt) {
    try {
        showTypingIndicator('Generating blueprint...');
        
        const result = await window.AriaClient.generateBlueprint(blueprintPrompt, {
            userId: ConsoleState.userId || 'anonymous',
            sessionId: ConsoleState.sessionId || generateSessionId(),
        });
        
        hideTypingIndicator();
        return result;
        
    } catch (error) {
        hideTypingIndicator();
        console.error('Blueprint generation error:', error);
        throw error;
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a session ID if not present
 * @returns {string} Session ID
 */
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Legacy compatibility function
 */
function addMessageWithStreaming(role, content, files = [], reasoning = null, blueprint = null, shouldStream = true) {
    // Simply calls the existing addMessage function
    if (typeof addMessage === 'function') {
        addMessage(role, content, files, reasoning, blueprint, shouldStream);
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

console.log('✓ ARIA n8n integration loaded');
console.log('  Endpoint: http://43.156.108.96:5678/webhook/755fcac8');
console.log('  Auth: HTTP Basic (admin)');
