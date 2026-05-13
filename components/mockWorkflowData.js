/**
 * Mock Workflow Data
 * 
 * Example blueprint structures for testing the WorkflowPreview component.
 * These match the expected format from your AI backend.
 */

// ============================================================================
// SIMPLE LINEAR WORKFLOW
// ============================================================================

export const simpleWorkflow = {
  nodes: [
    {
      id: '1',
      label: 'Webhook Trigger',
      type: 'webhook',
      description: 'Receives incoming data',
    },
    {
      id: '2',
      label: 'AI Agent',
      type: 'ai_agent',
      description: 'Processes with GPT-4',
    },
    {
      id: '3',
      label: 'CRM Push',
      type: 'crm_push',
      description: 'Updates Salesforce',
    },
  ],
  edges: [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      label: 'Raw Data',
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      label: 'Enriched Data',
    },
  ],
};

// ============================================================================
// COMPLEX BRANCHING WORKFLOW
// ============================================================================

export const complexWorkflow = {
  nodes: [
    {
      id: 'webhook-1',
      label: 'Form Submission',
      type: 'webhook',
      description: 'Customer inquiry form',
    },
    {
      id: 'ai-1',
      label: 'Intent Classifier',
      type: 'ai_agent',
      description: 'Categorizes inquiry type',
    },
    {
      id: 'db-1',
      label: 'Check Database',
      type: 'database',
      description: 'Look up customer history',
    },
    {
      id: 'ai-2',
      label: 'Response Generator',
      type: 'ai_agent',
      description: 'Creates personalized response',
    },
    {
      id: 'email-1',
      label: 'Send Email',
      type: 'email',
      description: 'Automated reply',
    },
    {
      id: 'crm-1',
      label: 'Update CRM',
      type: 'crm_push',
      description: 'Log interaction',
    },
  ],
  edges: [
    { id: 'e1', source: 'webhook-1', target: 'ai-1', label: 'Form Data' },
    { id: 'e2', source: 'ai-1', target: 'db-1', label: 'Customer ID' },
    { id: 'e3', source: 'db-1', target: 'ai-2', label: 'History' },
    { id: 'e4', source: 'ai-2', target: 'email-1', label: 'Response' },
    { id: 'e5', source: 'ai-2', target: 'crm-1', label: 'Log Entry' },
  ],
};

// ============================================================================
// PARALLEL PROCESSING WORKFLOW
// ============================================================================

export const parallelWorkflow = {
  nodes: [
    {
      id: 'start',
      label: 'Data Ingestion',
      type: 'webhook',
      description: 'Batch data upload',
    },
    {
      id: 'process-1',
      label: 'Sentiment Analysis',
      type: 'ai_agent',
      description: 'Analyze customer feedback',
    },
    {
      id: 'process-2',
      label: 'Entity Extraction',
      type: 'ai_agent',
      description: 'Extract key information',
    },
    {
      id: 'process-3',
      label: 'Category Tagging',
      type: 'ai_agent',
      description: 'Auto-categorize content',
    },
    {
      id: 'merge',
      label: 'Merge Results',
      type: 'database',
      description: 'Combine all analyses',
    },
    {
      id: 'output',
      label: 'Generate Report',
      type: 'email',
      description: 'Send summary email',
    },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'process-1' },
    { id: 'e2', source: 'start', target: 'process-2' },
    { id: 'e3', source: 'start', target: 'process-3' },
    { id: 'e4', source: 'process-1', target: 'merge' },
    { id: 'e5', source: 'process-2', target: 'merge' },
    { id: 'e6', source: 'process-3', target: 'merge' },
    { id: 'e7', source: 'merge', target: 'output' },
  ],
};

// ============================================================================
// FULL AI RESPONSE MOCK (as returned from backend)
// ============================================================================

export const mockAIResponse = {
  response: `I've designed a customer support automation workflow for you. 

This workflow will:
1. Receive customer inquiries via webhook
2. Use AI to classify the intent and urgency
3. Check your database for customer history
4. Generate a personalized response
5. Send automated email and update your CRM

The workflow processes approximately 100 requests per hour with 95% accuracy.`,
  
  blueprint: complexWorkflow,
  
  score: 87,
  
  diagnosis: 'High-value automation opportunity',
  
  workflows: [
    {
      name: 'Customer Support Automation',
      status: 'ready',
      estimated_savings: '$15,000/month',
    },
  ],
  
  reasoning: {
    tokens: 1250,
    confidence: 0.92,
    cost: 5,
  },
  
  credits_remaining: 1995,
};

// ============================================================================
// EDGE CASES FOR TESTING
// ============================================================================

// Empty workflow
export const emptyWorkflow = {
  nodes: [],
  edges: [],
};

// Single node (no connections)
export const singleNodeWorkflow = {
  nodes: [
    {
      id: '1',
      label: 'Standalone Task',
      type: 'ai_agent',
    },
  ],
  edges: [],
};

// Invalid structure (for error handling)
export const invalidWorkflow = {
  // Missing nodes array
  edges: [
    { id: 'e1', source: '1', target: '2' },
  ],
};

// Workflow with custom node types
export const customTypesWorkflow = {
  nodes: [
    {
      id: '1',
      label: 'Custom Trigger',
      type: 'custom_webhook',
      description: 'Special webhook handler',
    },
    {
      id: '2',
      label: 'ML Model',
      type: 'machine_learning',
      description: 'TensorFlow inference',
    },
    {
      id: '3',
      label: 'Slack Notification',
      type: 'slack',
      description: 'Send to #alerts channel',
    },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
  ],
};

// ============================================================================
// HELPER FUNCTION: Generate Random Workflow
// ============================================================================

export const generateRandomWorkflow = (nodeCount = 5) => {
  const types = ['webhook', 'ai_agent', 'database', 'email', 'crm_push'];
  const nodes = [];
  const edges = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `node-${i}`,
      label: `Step ${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      description: `Process step ${i + 1}`,
    });

    if (i > 0) {
      edges.push({
        id: `edge-${i}`,
        source: `node-${i - 1}`,
        target: `node-${i}`,
        label: `Data ${i}`,
      });
    }
  }

  return { nodes, edges };
};
