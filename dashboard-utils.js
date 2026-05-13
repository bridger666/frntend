/**
 * AIVORY Dashboard - Utility Functions
 * Shared utilities for dashboard pages
 */

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Format ISO timestamp for display
 * @param {string} isoString - ISO 8601 timestamp
 * @returns {string} Formatted timestamp (e.g., "Feb 26, 2026 14:30:45")
 */
function formatTimestamp(isoString) {
    const date = new Date(isoString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    return date.toLocaleString('en-US', options);
}

/**
 * Get relative time for tooltip
 * @param {string} isoString - ISO 8601 timestamp
 * @returns {string} Relative time (e.g., "2 hours ago")
 */
function getRelativeTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Truncate error message
 * @param {string} error - Error message
 * @param {number} maxLength - Maximum length (default: 60)
 * @returns {string} Truncated error
 */
function truncateError(error, maxLength = 60) {
    if (!error) return '';
    if (error.length <= maxLength) return error;
    return error.substring(0, maxLength - 3) + '...';
}


// ============================================================================
// FILTERING & SORTING
// ============================================================================

/**
 * Filter executions by status
 * @param {Array} executions - Array of execution objects
 * @param {string} status - Status filter ('all', 'success', 'failed')
 * @returns {Array} Filtered executions
 */
function filterExecutions(executions, status) {
    if (status === 'all') return executions;
    return executions.filter(e => e.status === status);
}

/**
 * Filter executions by time range
 * @param {Array} executions - Array of execution objects
 * @param {string} range - Time range ('today', '7days', '30days')
 * @returns {Array} Filtered executions
 */
function filterByTimeRange(executions, range) {
    const now = new Date();
    let cutoff;
    
    switch(range) {
        case 'today':
            cutoff = new Date(now.setHours(0, 0, 0, 0));
            break;
        case '7days':
            cutoff = new Date(now - 7 * 86400000);
            break;
        case '30days':
            cutoff = new Date(now - 30 * 86400000);
            break;
        default:
            return executions;
    }
    
    return executions.filter(e => new Date(e.timestamp) >= cutoff);
}

/**
 * Calculate stats from executions
 * @param {Array} executions - Array of execution objects
 * @returns {Object} Stats object with total, successRate, failed, avgDuration
 */
function calculateStats(executions) {
    const total = executions.length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const success = total - failed;
    const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : 0;
    
    const durations = executions
        .map(e => parseFloat(e.duration))
        .filter(d => !isNaN(d));
    const avgDuration = durations.length > 0 ?
        (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1) :
        0;
    
    return {
        total,
        successRate,
        failed,
        avgDuration: `${avgDuration}s`
    };
}
