/**
 * ARIA Skill Client
 * Routes all skill-driven actions through the universal skill handler.
 *
 * Endpoint: POST http://43.156.108.96:5678/webhook/zeroclaw-skill-handler-V2
 *
 * Auth: No Basic Auth required — the VPS Bridge handles auth at the bridge layer.
 * Internal flows (n8n → bridge) use: x-internal-token: aivory-internal-2026
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Universal skill handler endpoint (n8n webhook)
const N8N_SKILL_HANDLER_URL = "http://43.156.108.96:5678/webhook/zeroclaw-skill-handler-V2";

// ============================================================================
// CORE API CALL
// ============================================================================

/**
 * Call the universal skill handler with a standard envelope.
 *
 * @param {string} skill - Skill ID (see INTERNAL_SKILLS.md)
 * @param {object} payload - Skill-specific payload
 * @param {object} [meta] - Optional meta overrides (org_id, user_id, session_id, source)
 * @returns {Promise<object>} Standard skill response envelope
 */
async function callSkillHandler(skill, payload = {}, meta = {}) {
    const body = {
        skill,
        context: {
            org_id:     meta.org_id     || (typeof ConsoleState !== 'undefined' && ConsoleState.orgId)     || 'default',
            user_id:    meta.user_id    || (typeof ConsoleState !== 'undefined' && ConsoleState.userId)    || 'anonymous',
            session_id: meta.session_id || (typeof ConsoleState !== 'undefined' && ConsoleState.sessionId) || `session-${Date.now()}`,
            payload
        },
        meta: {
            source:       meta.source       || 'console',
            trace_id:     meta.trace_id     || `trace-${Date.now()}`,
            requested_by: meta.requested_by || meta.source || 'console'
        }
    };

    try {
        const res = await fetch(N8N_SKILL_HANDLER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`Skill handler error ${res.status}: ${text || res.statusText}`);
        }

        return await res.json();
    } catch (error) {
        console.error('[SkillClient] Request failed:', error);
        throw error;
    }
}

// ============================================================================
// SKILL-SPECIFIC HELPERS
// ============================================================================

/**
 * Send console chat message via skill handler
 * @param {string} userMessage - User's message
 * @param {Array}  history     - Conversation history [{role, content}]
 * @param {object} metaOverrides - Additional metadata
 * @returns {Promise<object>} { reply, model, intent }
 */
async function sendConsoleMessage(userMessage, history = [], metaOverrides = {}) {
    const data = await callSkillHandler(
        'console_chat',
        { message: userMessage, history: history || [] },
        { source: 'aivory-console', ...metaOverrides }
    );

    if (data.status === 'error') {
        throw new Error(data.message || 'Skill handler returned an error');
    }

    const result = data.result || data;
    return {
        reply:  result.reply  ?? result.response ?? '',
        model:  result.model  ?? result.model_used ?? 'unknown',
        intent: result.intent ?? 'general'
    };
}

/**
 * Run diagnostic analysis via skill handler
 * @param {string} userMessage - Diagnostic query or context
 * @param {Array}  history     - Conversation history
 * @param {object} metaOverrides - Additional metadata
 * @returns {Promise<object>} Diagnostic result
 */
async function runDiagnostic(userMessage, history = [], metaOverrides = {}) {
    const data = await callSkillHandler(
        'deep_diagnostic',
        { message: userMessage, history: history || [] },
        { source: 'diagnostic-panel', ...metaOverrides }
    );

    if (data.status === 'error') {
        throw new Error(data.message || 'Diagnostic skill returned an error');
    }

    return data.result || data;
}

/**
 * Generate AI System Blueprint via skill handler
 * @param {string} userPrompt    - Blueprint generation prompt
 * @param {object} metaOverrides - Additional metadata
 * @returns {Promise<object>} Blueprint/workflow object
 */
async function generateBlueprint(userPrompt, metaOverrides = {}) {
    const data = await callSkillHandler(
        'generate_blueprint',
        { prompt: userPrompt },
        { source: 'blueprint-panel', ...metaOverrides }
    );

    if (data.status === 'error') {
        throw new Error(data.message || 'Blueprint skill returned an error');
    }

    const result = data.result || data;
    return result.workflow || result.schema || result.blueprint || result;
}

// ============================================================================
// CONNECTION TEST
// ============================================================================

/**
 * Test connection to the universal skill handler
 * @returns {Promise<boolean>} True if connection successful
 */
async function testSkillHandlerConnection() {
    try {
        const data = await callSkillHandler(
            'console_chat',
            { message: 'ping', history: [] },
            { source: 'connection-test' }
        );

        if (data.status === 'ok' || data.result || data.reply) {
            console.log('✅ Skill handler connection successful');
            return true;
        } else {
            console.warn('⚠️ Skill handler returned unexpected shape:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Skill handler connection failed:', error.message);
        console.error('Endpoint:', N8N_SKILL_HANDLER_URL);
        return false;
    }
}

// Run connection test when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => testSkillHandlerConnection(), 1000);
    });
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
    window.AriaClient = {
        callSkillHandler,
        sendConsoleMessage,
        runDiagnostic,
        generateBlueprint,
        testSkillHandlerConnection,
        // Legacy aliases for backward compatibility
        callAria:              callSkillHandler,
        testAriaConnection:    testSkillHandlerConnection,
    };
}
