/**
 * AIVORY AI Console - Frontend Application
 * Conversational command interface for AI Operating System
 * Connected to local backend (Sumopod API)
 */

// ============================================================================
// GLOBAL STATE
// ============================================================================

const ConsoleState = {
    tier: 'enterprise', // Will be updated from auth
    credits: 50,
    creditLimit: 2000,
    messages: [],
    uploadedFiles: [],
    attachedWorkflow: null,
    isTyping: false,
    userId: 'demo_user'
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initConsole();
    initHighlightJS();
});

/**
 * Initialize highlight.js with mermaid alias and proper re-highlighting
 */
function initHighlightJS() {
    if (typeof hljs !== 'undefined') {
        // Register mermaid as alias to plaintext to avoid "language not found" errors
        hljs.registerAliases(['mermaid'], { languageName: 'plaintext' });
        
        // Initial highlight of any existing code blocks
        highlightNewBlocks();
    }
}

/**
 * Highlight only new code blocks that haven't been highlighted yet
 * Prevents "Element previously highlighted" errors
 */
function highlightNewBlocks() {
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code:not([data-highlighted])').forEach(block => {
            hljs.highlightElement(block);
        });
    }
}

function initConsole() {
    // Get tier from authenticated user (localStorage) first, then URL or session
    const authTier = localStorage.getItem('aivory_tier');
    const urlParams = new URLSearchParams(window.location.search);
    ConsoleState.tier = authTier || urlParams.get('tier') || sessionStorage.getItem('user_tier') || 'enterprise';
    
    // Set credit limit based on tier
    const tierCredits = {
        'free': 0,
        'foundation': 50,
        'builder': 50,
        'operator': 300,
        'pro': 300,
        'enterprise': 2000,
        'super_admin': 2000
    };
    ConsoleState.creditLimit = tierCredits[ConsoleState.tier] || 2000;
    
    // Restore conversation from localStorage
    restoreConversation();
    
    // Check for prefill query from logs page
    const prefillQuery = sessionStorage.getItem('console_prefill_query');
    if (prefillQuery) {
        const input = document.getElementById('messageInput');
        if (input) {
            input.value = prefillQuery;
            input.focus();
            // Auto-resize textarea
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 200) + 'px';
        }
        // Clear sessionStorage after use
        sessionStorage.removeItem('console_prefill_query');
    }
    
    // Fetch context data (non-blocking)
    fetchContext().catch(err => {
        console.error('Failed to fetch context:', err);
    });
    
    // Setup event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Send button
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    
    // Message input - use new textarea ID
    const input = document.getElementById('chatTextarea');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 180) + 'px';
    });
    
    // + button toggle
    const attachToggle = document.getElementById('attachToggleBtn');
    const attachDropdown = document.getElementById('attachDropdown');
    
    attachToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = attachDropdown.style.display !== 'none';
        attachDropdown.style.display = isOpen ? 'none' : 'block';
        attachToggle.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(45deg)';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        attachDropdown.style.display = 'none';
        attachToggle.style.transform = 'rotate(0deg)';
    });
    
    // File inputs
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('imageInput').addEventListener('change', handleFileUpload);
    document.getElementById('blueprintInput').addEventListener('change', handleFileUpload);
}

// File trigger functions
function triggerFileUpload() {
    document.getElementById('fileInput').click();
    document.getElementById('attachDropdown').style.display = 'none';
}

function triggerImageUpload() {
    document.getElementById('imageInput').click();
    document.getElementById('attachDropdown').style.display = 'none';
}

function triggerBlueprintUpload() {
    document.getElementById('blueprintInput').click();
    document.getElementById('attachDropdown').style.display = 'none';
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * Strip emoji from text
 */
function stripEmoji(text) {
    return text.replace(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]/gu, '').trim();
}

async function sendMessage() {
    const input = document.getElementById('chatTextarea');
    const message = input.value.trim();
    
    if (!message) {
        return;
    }
    
    // Clear input and reset height FIRST
    input.value = '';
    input.style.height = 'auto';
    
    // Check credits
    if (ConsoleState.credits < 1) {
        showInsufficientCreditsModal();
        return;
    }
    
    // Add user message to chat history IMMEDIATELY
    addMessage('user', message, [], null, null, false);
    
    // Save conversation after adding user message
    saveConversation();
    
    // Use the streaming function (it will add the AI response)
    await sendMessageWithSimulatedStreaming(message);
}

/**
 * Show thinking animation (Grok-style pulse)
 */
function showThinkingAnimation() {
    const messagesContainer = document.getElementById('threadMessages');
    const bubble = document.createElement('div');
    bubble.id = 'thinking-bubble';
    bubble.className = 'message-bubble ai-message';
    bubble.innerHTML = `
        <div class="thinking-animation">
            <div class="thinking-dot"></div>
            <div class="thinking-dot"></div>
            <div class="thinking-dot"></div>
        </div>
    `;
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Hide thinking animation
 */
function hideThinkingAnimation() {
    const bubble = document.getElementById('thinking-bubble');
    if (bubble) {
        bubble.remove();
    }
}

function addMessage(role, content, files = [], reasoning = null, blueprint = null, shouldStream = true) {
    // Strip emoji from AI responses
    if (role === 'assistant') {
        content = stripEmoji(content);
    }
    
    const messagesContainer = document.getElementById('threadMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${role}-message`;
    
    const avatarSVG = role === 'user' 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
             <circle cx="12" cy="7" r="4"/>
           </svg>`
        : `<img src="Aivory_console_pic.svg" alt="Aivory AI" width="32" height="32">`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let filesHTML = '';
    if (files.length > 0) {
        filesHTML = '<div class="message-files">' +
            files.map(f => `
                <div class="file-badge">
                    <span class="file-badge-icon">📄</span>
                    <span>${f.filename}</span>
                </div>
            `).join('') +
            '</div>';
    }
    
    // Check if message has workflow blueprint
    const hasWorkflow = blueprint && blueprint.nodes && blueprint.nodes.length > 0;
    let workflowButtonHTML = '';
    if (hasWorkflow && role === 'assistant') {
        workflowButtonHTML = `
            <button class="workflow-preview-btn" style="
                margin-top: 1rem;
                padding: 0.75rem 1.5rem;
                background: linear-gradient(135deg, #07d197 0%, #06b380 100%);
                border: none;
                border-radius: 8px;
                color: #1a0b2e;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                transition: transform 0.2s;
                font-family: 'Inter Tight', sans-serif;
                font-size: 0.875rem;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <span>🔄</span>
                View Workflow Preview
            </button>
        `;
    }
    
    let reasoningHTML = '';
    if (reasoning && ConsoleState.tier !== 'builder') {
        reasoningHTML = `
            <div class="reasoning-panel">
                <div class="reasoning-header" onclick="toggleReasoning(this)">
                    <span class="reasoning-title">Usage Details</span>
                    <span class="reasoning-toggle">▼</span>
                </div>
                <div class="reasoning-content">
                    <div class="reasoning-stat">
                        <span class="reasoning-label">Tokens:</span>
                        <span class="reasoning-value">${reasoning.tokens}</span>
                    </div>
                    <div class="reasoning-stat">
                        <span class="reasoning-label">Confidence:</span>
                        <span class="reasoning-value">${(reasoning.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div class="reasoning-stat">
                        <span class="reasoning-label">Cost:</span>
                        <span class="reasoning-value">${reasoning.cost} credits</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Add thinking time metadata for AI messages (NO model name)
    let metadataHTML = '';
    if (role === 'assistant' && reasoning && reasoning.thinkingTime !== undefined) {
        metadataHTML = `
            <div class="message-metadata" style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.4); margin-top: 0.5rem; font-family: 'Inter Tight', sans-serif;">
                <span>Thinking · ${reasoning.thinkingTime}s</span>
            </div>
        `;
    }
    
    // Create message structure with placeholder for streaming
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatarSVG}</div>
        <div class="message-content">
            <div class="message-text">
                <div class="message-text-content"></div>
                ${filesHTML}
                ${workflowButtonHTML}
            </div>
            <div class="message-timestamp">${timestamp}</div>
            ${metadataHTML}
            ${reasoningHTML}
        </div>
    `;
    
    // Add workflow preview click handler
    if (hasWorkflow) {
        const workflowBtn = messageDiv.querySelector('.workflow-preview-btn');
        if (workflowBtn) {
            workflowBtn.onclick = () => {
                if (typeof window.showWorkflowPreview === 'function') {
                    window.showWorkflowPreview(blueprint);
                } else {
                    console.error('Workflow preview not loaded');
                }
            };
        }
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll the page to show the new message (page-level scroll, not inner container)
    requestAnimationFrame(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    });
    
    // Apply streaming effect for NEW AI messages only
    const textContainer = messageDiv.querySelector('.message-text-content');
    if (role === 'assistant' && shouldStream) {
        // Stream the text with markdown rendering for new messages
        streamText(textContainer, content);
    } else if (role === 'assistant') {
        // Render markdown instantly for restored messages
        textContainer.innerHTML = renderMarkdown(content);
    } else {
        // User messages appear instantly
        textContainer.textContent = content;
    }
    
    // Store in state
    ConsoleState.messages.push({
        role,
        content,
        files,
        reasoning,
        blueprint,
        timestamp: new Date().toISOString()
    });
}

// Streaming text function - character by character reveal with markdown rendering
function streamText(container, text, onComplete) {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Display instantly if user prefers reduced motion
        container.innerHTML = renderMarkdown(text);
        if (onComplete) onComplete();
        return;
    }
    
    let index = 0;
    const charsPerFrame = 2; // Stream 2 characters at a time for smoother feel
    const frameDelay = 20; // ~50 chars per second (2 chars every 40ms)
    let accumulatedText = '';
    
    function addNextChars() {
        if (index < text.length) {
            // Add next batch of characters
            const nextChars = text.slice(index, index + charsPerFrame);
            accumulatedText += nextChars;
            index += charsPerFrame;
            
            // Render markdown progressively so user sees formatted text, not raw markdown
            container.innerHTML = renderMarkdown(accumulatedText);
            
            // Continue streaming
            setTimeout(addNextChars, frameDelay);
        } else {
            // Streaming complete - final render to ensure everything is correct
            container.innerHTML = renderMarkdown(text);
            if (onComplete) onComplete();
        }
    }
    
    // Start streaming
    container.innerHTML = '';
    addNextChars();
}

function toggleReasoning(header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.reasoning-toggle');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        toggle.textContent = '▼';
    } else {
        content.classList.add('expanded');
        toggle.textContent = '▲';
    }
}

function showTypingIndicator(status = 'Thinking...') {
    const indicator = document.getElementById('typingIndicator');
    const statusEl = document.getElementById('typingStatus');
    
    statusEl.textContent = status;
    indicator.style.display = 'flex';
    
    // Scroll to show the typing indicator at the start
    setTimeout(() => {
        indicator.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    ConsoleState.isTyping = true;
}

function hideTypingIndicator() {
    document.getElementById('typingIndicator').style.display = 'none';
    ConsoleState.isTyping = false;
}

// ============================================================================
// FILE UPLOAD
// ============================================================================

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Show filename preview
    const preview = document.createElement('div');
    preview.className = 'file-preview-chip';
    preview.innerHTML = `📎 ${file.name} <span class="remove-file" onclick="this.parentElement.remove()">✕</span>`;
    document.querySelector('.chat-input-bar').insertBefore(preview, document.querySelector('.chat-input-actions'));
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                         'text/csv', 'text/plain', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        showErrorToast('Invalid file type. Only PDF, DOCX, CSV, TXT, PNG, JPG supported.');
        preview.remove();
        return;
    }
    
    // Show uploading status
    showTypingIndicator('Uploading file...');
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tier', ConsoleState.tier);
        
        const response = await fetch('http://localhost:8081/api/console/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add to uploaded files
        ConsoleState.uploadedFiles.push({
            id: data.file_id,
            filename: data.filename,
            size: data.size,
            type: data.type
        });
        
        hideTypingIndicator();
        
    } catch (error) {
        console.error('Upload error:', error);
        hideTypingIndicator();
        showErrorToast('File upload failed. Please try again.');
        preview.remove();
    }
    
    // Reset file input
    event.target.value = '';
}

// ============================================================================
// CONTEXT PANEL
// ============================================================================

async function fetchContext() {
    try {
        const response = await fetch(`http://localhost:8081/api/console/context?tier=${ConsoleState.tier}&user_id=${ConsoleState.userId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch context: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update state
        ConsoleState.credits = data.credits;
        ConsoleState.creditLimit = data.credit_limit;
        
        // Update UI
        updateContextPanel(data);
        
    } catch (error) {
        console.error('Error fetching context:', error);
        console.warn('Context fetch failed, using defaults');
    }
}

function updateContextPanel(data) {
    // DON'T update tier here - tier-sync.js handles it
    // Only update dynamic data (workflows, executions)
    
    // Credits - update state but let tier-sync.js handle display
    ConsoleState.credits = data.credits;
    ConsoleState.creditLimit = data.credit_limit;
    
    // Workflows - with null check
    const contextWorkflows = document.getElementById('contextWorkflows');
    if (contextWorkflows) {
        contextWorkflows.textContent = data.workflows.length;
    }
    
    const workflowList = document.getElementById('workflowList');
    if (workflowList) {
        workflowList.innerHTML = data.workflows.map(w => `
            <div class="workflow-item">
                <span class="workflow-status ${w.status}"></span>
                <span>${w.name}</span>
            </div>
        `).join('');
    }
    
    // Executions - with null check
    const executionList = document.getElementById('executionList');
    if (executionList) {
        executionList.innerHTML = data.executions.map(e => `
            <div class="execution-item">
                <span class="execution-status ${e.status}"></span>
                <div class="execution-info">
                    <div class="execution-name">${e.workflow_name}</div>
                    <div class="execution-time">${formatTimestamp(e.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Update credits display after state is updated
    updateCreditsDisplay();
}

function updateCreditsDisplay() {
    const percentage = (ConsoleState.credits / ConsoleState.creditLimit) * 100;
    
    // Context panel - use "X / Y" format (only update this, let tier-sync handle top bar)
    const contextCredits = document.getElementById('contextCredits');
    if (contextCredits) {
        contextCredits.textContent = `${ConsoleState.credits} / ${ConsoleState.creditLimit}`;
    }
    
    // Credit meter
    const creditMeter = document.getElementById('creditMeterFill');
    if (creditMeter) {
        creditMeter.style.width = `${percentage}%`;
    }
}

function updateUI() {
    // DON'T update tier badges - tier-sync.js handles this
    // This function is now only for updating credits after API calls
    updateCreditsDisplay();
}

// ============================================================================
// CONVERSATION PERSISTENCE
// ============================================================================

function saveConversation() {
    try {
        // Store last 50 messages
        const messagesToStore = ConsoleState.messages.slice(-50);
        localStorage.setItem('console_conversation', JSON.stringify(messagesToStore));
    } catch (error) {
        console.error('Error saving conversation:', error);
    }
}

function restoreConversation() {
    try {
        const stored = localStorage.getItem('console_conversation');
        if (stored) {
            const messages = JSON.parse(stored);
            
            // Clear welcome message
            document.getElementById('threadMessages').innerHTML = '';
            
            // Restore messages WITHOUT streaming effect (instant display)
            messages.forEach(msg => {
                // Use the new streaming function but with shouldStream=false for instant display
                if (typeof addMessageWithStreaming !== 'undefined') {
                    addMessageWithStreaming(msg.role, msg.content, msg.files || [], msg.reasoning, msg.blueprint, false);
                } else {
                    // Fallback to original if streaming not loaded yet
                    addMessage(msg.role, msg.content, msg.files || [], msg.reasoning, msg.blueprint, false);
                }
            });
            
            // Update state
            ConsoleState.messages = messages;
        }
    } catch (error) {
        console.error('Error restoring conversation:', error);
    }
}

function clearConversation() {
    if (!confirm('Clear conversation history? This cannot be undone.')) {
        return;
    }
    
    // Clear state
    ConsoleState.messages = [];
    
    // Clear localStorage
    localStorage.removeItem('console_conversation');
    
    // Clear UI
    const messagesContainer = document.getElementById('threadMessages');
    messagesContainer.innerHTML = `
        <div class="message-bubble ai-message">
            <div class="message-avatar">
                <img src="Aivory_console_pic.svg" alt="Aivory AI" width="32" height="32">
            </div>
            <div class="message-content">
                <div class="message-text">
                    <p>Welcome to Aivory AI Console.</p>
                    <p>I can help you with three things:</p>
                    <ol>
                        <li>Identify your automation gaps (Free Diagnostic — 5 min)</li>
                        <li>Map your full AI system architecture (AI Snapshot, $15)</li>
                        <li>Get a deployment-ready blueprint for your business (AI Blueprint, $79)</li>
                    </ol>
                    <p>What does your business currently struggle to automate?</p>
                </div>
                <div class="message-timestamp">Just now</div>
            </div>
        </div>
    `;
}

// ============================================================================
// WORKFLOW SELECTOR
// ============================================================================

function showWorkflowSelector() {
    // Mock workflow selector (in production, fetch from API)
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    
    modal.innerHTML = `
        <div style="background: #1a0b2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
            <h3 style="margin: 0 0 1rem 0;">Attach Workflow</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="padding: 1rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; cursor: pointer;" onclick="attachWorkflow('wf-123', 'Invoice Processing')">
                    <div style="font-weight: 500;">Invoice Processing</div>
                    <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6);">Active • 127 executions</div>
                </div>
            </div>
            <button onclick="this.closest('.modal').remove()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 9999px; color: white; cursor: pointer; width: 100%;">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function attachWorkflow(workflowId, workflowName) {
    ConsoleState.attachedWorkflow = workflowId;
    
    // Show in attachments
    const container = document.getElementById('inputAttachments');
    const chip = document.createElement('div');
    chip.className = 'attachment-chip';
    chip.innerHTML = `
        <span>⚡ ${workflowName}</span>
        <span class="attachment-remove" onclick="detachWorkflow()">✕</span>
    `;
    container.appendChild(chip);
    
    // Close modal
    document.querySelector('.modal').remove();
}

function detachWorkflow() {
    ConsoleState.attachedWorkflow = null;
    // Attachment chip will be removed by parent
}

// ============================================================================
// MODALS
// ============================================================================

function showInsufficientCreditsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    
    modal.innerHTML = `
        <div style="background: #1a0b2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 2rem; max-width: 400px; width: 90%; text-align: center;">
            <h3 style="margin: 0 0 1rem 0;">⚠️ Insufficient Credits</h3>
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 1.5rem;">You don't have enough credits for this operation.</p>
            <p style="margin-bottom: 1.5rem;">Current balance: <strong>${ConsoleState.credits}</strong> credits</p>
            <button onclick="window.location.href='dashboard-subscription.html'" style="padding: 0.75rem 1.5rem; background: #3c229f; border: none; border-radius: 9999px; color: white; cursor: pointer; margin-right: 0.5rem;">Upgrade Plan</button>
            <button onclick="this.closest('.modal').remove()" style="padding: 0.75rem 1.5rem; background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 9999px; color: white; cursor: pointer;">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showRateLimitModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    
    modal.innerHTML = `
        <div style="background: #1a0b2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 2rem; max-width: 400px; width: 90%; text-align: center;">
            <h3 style="margin: 0 0 1rem 0;">⏱️ Rate Limit Exceeded</h3>
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 1.5rem;">You've reached your rate limit. Please wait a moment before trying again.</p>
            <button onclick="this.closest('.modal').remove()" style="padding: 0.75rem 1.5rem; background: #3c229f; border: none; border-radius: 9999px; color: white; cursor: pointer;">OK</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showErrorToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position: fixed; bottom: 2rem; right: 2rem; background: rgba(255, 68, 68, 0.9); color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 1000; animation: slideIn 0.3s ease-out;';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================================================
// UTILITIES
// ============================================================================

function renderMarkdown(text) {
    if (typeof marked !== 'undefined') {
        // Configure marked with custom renderer for code blocks
        const renderer = new marked.Renderer();
        
        // Override code block rendering to add data-language attribute
        renderer.code = function(code, language) {
            const lang = language || 'plaintext';
            const escapedCode = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
            
            return `<pre data-language="${lang}"><code class="language-${lang}">${escapedCode}</code></pre>`;
        };
        
        marked.setOptions({
            breaks: true,
            gfm: true,
            renderer: renderer
        });
        
        const html = marked.parse(text);
        
        // Highlight NEW code blocks only (prevents re-highlighting errors)
        setTimeout(() => {
            highlightNewBlocks();
        }, 0);
        
        return html;
    }
    
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
}
