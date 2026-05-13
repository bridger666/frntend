/**
 * AIVORY AI Console - Zeroclaw Integration
 * Handles message streaming and API communication
 *
 * All skill calls go through the universal skill router:
 *   POST /webhook/zeroclaw-skill-router-V2
 *
 * For console chat, the VPS Bridge /bridge/aira endpoint is used
 * (proxied via the Next.js backend to avoid CORS).
 */

// ============================================================================
// CONSTANTS
// ============================================================================

// VPS Bridge URL — all calls go through the bridge, not directly to Zeroclaw.
// In production this is the deployed VPS; in dev it's localhost:3003.
const VPS_BRIDGE_URL = window.VPS_BRIDGE_URL || 'http://43.156.108.96:3003';

// Universal skill handler endpoint (n8n webhook)
const SKILL_ROUTER_ENDPOINT = `${VPS_BRIDGE_URL}/webhook/zeroclaw-skill-handler-V2`;

// Console chat endpoint (Zeroclaw AIRA via bridge)
const ZEROCLAW_ENDPOINT = `${VPS_BRIDGE_URL}/bridge/aira`;

const AIVORY_SYSTEM_PROMPT = "You are Aivory, a warm and intelligent AI assistant on the Aivory platform. Help paid users with workflow generation, AI readiness assessment, log diagnostics, blueprint execution, and strategic advisory. Always detect and respond in the user's language (English US, English UK, Bahasa Indonesia, Arabic). Keep responses concise and use markdown formatting.";

// ============================================================================
// CONNECTION DIAGNOSTICS
// ============================================================================

// Test connection on page load
async function testZeroclawConnection() {
    try {
        const response = await fetch(ZEROCLAW_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'ping',
                history: [],
                system_prompt: 'Reply with "pong"'
            })
        });
        
        if (response.ok) {
            console.log('✅ Zeroclaw connection successful');
            return true;
        } else {
            console.warn('⚠️ Zeroclaw returned status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Zeroclaw connection failed:', error.message);
        console.error('Endpoint:', ZEROCLAW_ENDPOINT);
        console.error('This could be due to:');
        console.error('  1. CORS policy blocking the request');
        console.error('  2. Network/firewall blocking the connection');
        console.error('  3. Server is temporarily unavailable');
        return false;
    }
}

// Run connection test when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => testZeroclawConnection(), 1000);
    });
}

// ============================================================================
// MESSAGE SENDING WITH ZEROCLAW
// ============================================================================

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
        const response = await fetch(ZEROCLAW_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                history: history,
                system_prompt: AIVORY_SYSTEM_PROMPT
            })
        });
        
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Zeroclaw error ${response.status}: ${errText}`);
        }
        
        const data = await response.json();
        const reply = data.reply || 'No response received.';
        const modelUsed = data.model_used || 'unknown';
        const intent = data.intent || 'general';
        
        // Calculate thinking time
        const thinkingTime = ((Date.now() - startTime) / 1000).toFixed(1);
        
        // Deduct 1 credit per message
        ConsoleState.credits = Math.max(0, ConsoleState.credits - 1);
        updateUI();
        
        // Hide typing indicator BEFORE rendering message
        hideTypingIndicator();
        
        // Auto-detect workflow JSON and trigger via universal skill router (fire and forget)
        const jsonMatch = reply.match(/```json([\s\S]*?)```/);
        if (jsonMatch) {
            try {
                const workflowPayload = JSON.parse(jsonMatch[1].trim());
                if (workflowPayload.trigger === 'aivory_workflow') {
                    console.log('Workflow trigger detected, sending to skill router...');
                    fetch(SKILL_ROUTER_ENDPOINT, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            skill: 'workflow_trigger',
                            context: {
                                org_id: ConsoleState.orgId || 'default',
                                user_id: ConsoleState.userId || 'console-user',
                                session_id: ConsoleState.sessionId || 'console-session',
                                payload: workflowPayload
                            },
                            meta: {
                                source: 'console',
                                trace_id: `trace-${Date.now()}`,
                                requested_by: 'console-streaming'
                            }
                        })
                    }).catch(e => console.warn('Skill router trigger failed:', e));
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
        saveConversation();
        
    } catch (error) {
        hideTypingIndicator();
        console.error('Zeroclaw fetch error:', error);
        addMessage('assistant', `⚠️ Connection error: ${error.message}\n\nUnable to reach Zeroclaw AI service at ${ZEROCLAW_ENDPOINT}. Please check that the Zeroclaw server is running on port 3100.`);
        saveConversation();
    }
}

// ============================================================================
// HELPER FUNCTION
// ============================================================================

function addMessageWithStreaming(role, content, files = [], reasoning = null, blueprint = null, shouldStream = true) {
    // Simply calls the existing addMessage function
    addMessage(role, content, files, reasoning, blueprint, shouldStream);
}

// ============================================================================
// UNIVERSAL SKILL ROUTER — public helper
// ============================================================================

/**
 * Call a ZeroClaw skill via the universal skill router.
 *
 * @param {string} skill  - Skill ID (see INTERNAL_SKILLS.md)
 * @param {object} payload - Skill-specific payload (goes into context.payload)
 * @param {object} [opts]  - Optional overrides: org_id, user_id, session_id, source
 * @returns {Promise<object>} Standard skill response envelope
 *
 * @example
 * const result = await callSkill('free_diagnostic', { answers: [...] });
 * if (result.status === 'ok') { ... result.result ... }
 */
async function callSkill(skill, payload = {}, opts = {}) {
    const orgId     = opts.org_id     || ConsoleState?.orgId     || 'default';
    const userId    = opts.user_id    || ConsoleState?.userId    || 'console-user';
    const sessionId = opts.session_id || ConsoleState?.sessionId || `session-${Date.now()}`;
    const source    = opts.source     || 'console';

    const body = {
        skill,
        context: {
            org_id:     orgId,
            user_id:    userId,
            session_id: sessionId,
            payload
        },
        meta: {
            source,
            trace_id:     `trace-${Date.now()}`,
            requested_by: source
        }
    };

    const response = await fetch(SKILL_ROUTER_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Skill router error ${response.status}: ${errText}`);
    }

    return response.json();
}

// Export for use by other modules (if bundled)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { callSkill, SKILL_ROUTER_ENDPOINT, ZEROCLAW_ENDPOINT };
}
