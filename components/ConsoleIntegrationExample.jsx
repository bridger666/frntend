/**
 * Console Integration Example
 * 
 * Shows how to integrate WorkflowPreview into your existing chat console.
 * This example demonstrates both inline and modal approaches.
 */

import React, { useState } from 'react';
import WorkflowPreview from './WorkflowPreview';

// ============================================================================
// EXAMPLE: Chat Message Component with Workflow Preview
// ============================================================================

const ChatMessage = ({ message }) => {
  const [showWorkflow, setShowWorkflow] = useState(false);
  
  // Check if message contains workflow blueprint
  const hasWorkflow = message.blueprint && 
                      message.blueprint.nodes && 
                      message.blueprint.nodes.length > 0;

  return (
    <div className="message-bubble ai-message">
      {/* Message Avatar */}
      <div className="message-avatar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>

      {/* Message Content */}
      <div className="message-content">
        <div className="message-text">
          {/* Render message text (markdown, etc.) */}
          <p>{message.response || message.text}</p>
          
          {/* Show workflow button if blueprint exists */}
          {hasWorkflow && (
            <button
              onClick={() => setShowWorkflow(true)}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #07d197 0%, #06b380 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#1a0b2e',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <span>🔄</span>
              View Workflow Preview
            </button>
          )}
        </div>
        
        <div className="message-timestamp">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Workflow Preview Modal */}
      {hasWorkflow && (
        <WorkflowPreview
          blueprint={message.blueprint}
          isOpen={showWorkflow}
          onClose={() => setShowWorkflow(false)}
        />
      )}
    </div>
  );
};

// ============================================================================
// EXAMPLE: Console Component
// ============================================================================

const ConsoleExample = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      role: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call your API
      const response = await fetch('http://localhost:8081/api/console/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: { tier: 'enterprise', user_id: 'demo_user' }
        }),
      });

      const data = await response.json();

      // Add AI response with blueprint
      const aiMessage = {
        role: 'assistant',
        text: data.response,
        blueprint: data.blueprint, // This is the key part!
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="console-container">
      {/* Messages */}
      <div className="thread-messages">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}
        
        {isLoading && (
          <div className="typing-indicator">
            <div className="typing-grid">
              {/* Your existing typing animation */}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="console-input-bar">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask me anything..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ConsoleExample;

// ============================================================================
// ALTERNATIVE: Inline Workflow Preview (No Modal)
// ============================================================================

export const InlineWorkflowPreview = ({ blueprint }) => {
  if (!blueprint || !blueprint.nodes || blueprint.nodes.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: '1rem',
        height: '400px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#0f0820',
      }}
    >
      <WorkflowPreview
        blueprint={blueprint}
        isOpen={true}
        onClose={() => {}} // No close for inline
        className="inline-preview"
      />
    </div>
  );
};
