/**
 * AIVORY AI CONSOLE - PREMIUM REDESIGN
 * JavaScript handler for message submission, history, and streaming
 */

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const ConsoleState = {
    messages: [],
    isTyping: false,
    userId: 'demo_user',
    tier: 'enterprise'
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initConsole();
    initHighlightJS();
});

function initConsole() {
    // Restore conversation from localStorage
    restoreConversation();
    
    // Setup event listeners
    setupEventListeners();
    
    // Auto-resize textarea
    autoResizeTextarea();
}

function initHighlightJS() {
    if (typeof hljs !== 'undefined') {
        hljs.configure({
            languages: ['javascript', 'python', 'html', 'css', 'json', 'bash', 'sql']
        });
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    // Send button click
    sendBtn.addEventListener('click', handleSend);
    
    // Enter to send, Shift+Enter for new line
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    
    // Auto-resize textarea as user types
    input.addEventListener('input', autoResizeTextarea);
}

function autoResizeTextarea() {
    const input = document.getElementById('chatInput');
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 200) + 'px';
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

async function handleSend() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message || ConsoleState.isTyping) {
        return;
    }
    
    // Clear input immediately
    input.value = '';
    input.style.height = 'auto';
    
    // Hide empty state
    hideEmptyState();
    
    // Add user message to UI
    addMessage('user', message);
    
    // Save conversation
    saveConversation();
    
    // Scroll to bottom
    scrollToBottom();
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate AI response (replace with actual API call)
    await simulateAIResponse(message);
}

function addMessage(role, content, shouldStream = false) {
    const messageListInner = document.getElementById('messageListInner');
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${role}`;
    
    // Avatar
    const avatarHTML = role === 'user' 
        ? `<div class="message-avatar">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
               <circle cx="12" cy="7" r="4"/>
             </svg>
           </div>`
        : `<div class="message-avatar">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M12 2L2 7l10 5 10-5-10-5z"/>
               <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
             </svg>
           </div>`;
    
    // Timestamp
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        ${avatarHTML}
        <div class="message-content">
            <div class="message-text" data-content="${escapeHtml(content)}"></div>
            <div class="message-timestamp">${timestamp}</div>
        </div>
    `;
    
    messageListInner.appendChild(messageDiv);
    
    // Render content
    const textContainer = messageDiv.querySelector('.message-text');
    if (role === 'assistant' && shouldStream) {
        streamText(textContainer, content);
    } else {
        textContainer.innerHTML = renderMarkdown(content);
        highlightCode();
    }
    
    // Store in state
    ConsoleState.messages.push({
        role,
        content,
        timestamp: new Date().toISOString()
    });
    
    // Scroll to bottom
    scrollToBottom();
}

// ============================================================================
// STREAMING TEXT
// ============================================================================

function streamText(container, text) {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        container.innerHTML = renderMarkdown(text);
        highlightCode();
        return;
    }
    
    let index = 0;
    const charsPerFrame = 3;
    const frameDelay = 15;
    let accumulatedText = '';
    
    function addNextChars() {
        if (index < text.length) {
            const nextChars = text.slice(index, index + charsPerFrame);
            accumulatedText += nextChars;
            index += charsPerFrame;
            
            container.innerHTML = renderMarkdown(accumulatedText);
            highlightCode();
            scrollToBottom();
            
            setTimeout(addNextChars, frameDelay);
        } else {
            container.innerHTML = renderMarkdown(text);
            highlightCode();
            scrollToBottom();
        }
    }
    
    addNextChars();
}

// ============================================================================
// MARKDOWN RENDERING
// ============================================================================

function renderMarkdown(text) {
    if (typeof marked === 'undefined') {
        return escapeHtml(text).replace(/\n/g, '<br>');
    }
    
    // Strip emojis for clean professional look
    text = stripEmojis(text);
    
    // Configure marked
    marked.setOptions({
        breaks: true,
        gfm: true,
        highlight: function(code, lang) {
            if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (e) {
                    console.error('Highlight error:', e);
                }
            }
            return escapeHtml(code);
        }
    });
    
    return marked.parse(text);
}

function stripEmojis(text) {
    // Remove all emojis for clean professional aesthetic
    return text.replace(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]/gu, '').trim();
}

function highlightCode() {
    if (typeof hljs !== 'undefined') {
        document.querySelectorAll('pre code:not([data-highlighted])').forEach(block => {
            hljs.highlightElement(block);
            block.setAttribute('data-highlighted', 'true');
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// TYPING INDICATOR
// ============================================================================

function showTypingIndicator() {
    ConsoleState.isTyping = true;
    
    const messageListInner = document.getElementById('messageListInner');
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'message message-ai typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    messageListInner.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    ConsoleState.isTyping = false;
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// ============================================================================
// AI RESPONSE SIMULATION
// ============================================================================

async function simulateAIResponse(userMessage) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    hideTypingIndicator();
    
    // Generate mock response based on user message
    let response = generateMockResponse(userMessage);
    
    // Add AI message with streaming
    addMessage('assistant', response, true);
    
    // Save conversation
    saveConversation();
}

function generateMockResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('workflow') || lowerMessage.includes('automation')) {
        return `I can help you with workflow automation. Here are some key capabilities:

1. **Workflow Generation**: Create custom workflows from natural language descriptions
2. **Execution Monitoring**: Track workflow runs and analyze performance
3. **Error Diagnosis**: Identify and resolve workflow failures

Would you like me to help you create a new workflow or analyze an existing one?`;
    }
    
    if (lowerMessage.includes('table') || lowerMessage.includes('data')) {
        return `Here's an example of how data is displayed:

| Metric | Value | Status |
|--------|-------|--------|
| Total Workflows | 12 | Active |
| Success Rate | 94% | Good |
| Avg Response Time | 1.2s | Optimal |

The table above shows key performance indicators for your workflows.`;
    }
    
    if (lowerMessage.includes('code') || lowerMessage.includes('example')) {
        return `Here's a code example:

\`\`\`javascript
async function processWorkflow(data) {
    const result = await analyzeData(data);
    
    if (result.confidence > 0.8) {
        return { status: 'success', data: result };
    }
    
    return { status: 'review_needed', data: result };
}
\`\`\`

This function processes workflow data and returns results based on confidence scores.`;
    }
    
    return `I understand you're asking about "${userMessage}". I'm here to help with:

- Workflow creation and management
- Log analysis and debugging
- System optimization
- AI-powered automation

What specific aspect would you like to explore?`;
}

// ============================================================================
// CONVERSATION PERSISTENCE
// ============================================================================

function saveConversation() {
    try {
        const messagesToStore = ConsoleState.messages.slice(-50);
        localStorage.setItem('aivory_console_messages', JSON.stringify(messagesToStore));
    } catch (error) {
        console.error('Error saving conversation:', error);
    }
}

function restoreConversation() {
    try {
        const stored = localStorage.getItem('aivory_console_messages');
        if (stored) {
            const messages = JSON.parse(stored);
            
            if (messages.length > 0) {
                hideEmptyState();
                
                messages.forEach(msg => {
                    addMessage(msg.role, msg.content, false);
                });
                
                ConsoleState.messages = messages;
            }
        }
    } catch (error) {
        console.error('Error restoring conversation:', error);
    }
}

function clearConversation() {
    if (!confirm('Clear conversation history? This cannot be undone.')) {
        return;
    }
    
    ConsoleState.messages = [];
    localStorage.removeItem('aivory_console_messages');
    
    const messageListInner = document.getElementById('messageListInner');
    messageListInner.innerHTML = '';
    
    showEmptyState();
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.classList.add('hidden');
    }
}

function showEmptyState() {
    const messageListInner = document.getElementById('messageListInner');
    messageListInner.innerHTML = `
        <div class="empty-state" id="emptyState">
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <h2 class="empty-state-title">Start a conversation</h2>
            <p class="empty-state-text">Ask me anything about your workflows, logs, or AI systems.</p>
        </div>
    `;
}

// ============================================================================
// SCROLL BEHAVIOR
// ============================================================================

function scrollToBottom() {
    requestAnimationFrame(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    });
}

// ============================================================================
// MOBILE SIDEBAR TOGGLE
// ============================================================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// Make toggle function available globally
window.toggleSidebar = toggleSidebar;
