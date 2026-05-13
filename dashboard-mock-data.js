/**
 * AIVORY Dashboard - Mock Data Generator
 * Generates realistic mock execution data for testing
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const WORKFLOW_NAMES = [
    'Invoice Processing',
    'Customer Onboarding',
    'Data Sync Pipeline',
    'Weekly Report Generator',
    'Email Automation'
];

const ERROR_MESSAGES = [
    'Connection timeout',
    'API rate limit exceeded',
    'Invalid data format',
    'Authentication failed',
    'Resource not found',
    'Database connection lost',
    'Memory limit exceeded',
    'Network unreachable'
];

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

/**
 * Generate realistic mock execution data
 * @param {number} count - Number of executions to generate (default: 127)
 * @returns {Array} Array of execution objects
 */
function generateMockExecutions(count = 127) {
    const executions = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
        // Generate timestamp spanning last 30 days
        const hoursAgo = Math.floor(Math.random() * 720); // 30 days = 720 hours
        const timestamp = new Date(now - hoursAgo * 3600000);
        
        // 5.5% failure rate
        const isFailed = Math.random() < 0.055;
        
        // Random workflow
        const workflow = WORKFLOW_NAMES[Math.floor(Math.random() * WORKFLOW_NAMES.length)];
        
        // Duration: failed = 0.5-2s, success = 1-6s
        const duration = isFailed ? 
            (Math.random() * 1.5 + 0.5).toFixed(1) : 
            (Math.random() * 5 + 1).toFixed(1);
        
        // Random error for failed executions
        const error = isFailed ? 
            ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)] : 
            null;
        
        executions.push({
            id: `exec-${String(i + 1).padStart(3, '0')}`,
            status: isFailed ? 'failed' : 'success',
            workflow_name: workflow,
            timestamp: timestamp.toISOString(),
            duration: duration,
            error: error
        });
    }
    
    // Sort by timestamp descending (newest first)
    return executions.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
}

/**
 * Get mock workflow statistics
 * @returns {Object} Workflow stats
 */
function getMockWorkflowStats() {
    return {
        total: 4,
        active: 2,
        paused: 1,
        failed: 1
    };
}
