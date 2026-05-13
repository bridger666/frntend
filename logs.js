// ============================================================================
// EXECUTION LOGS PAGE - Phase 2 Enhancements
// ============================================================================

// Global state
let allExecutions = [];
let filteredExecutions = [];
let displayedExecutions = [];
let currentTimeRange = '30days';
let currentStatusFilter = 'all';
let currentPage = 0;
const ITEMS_PER_PAGE = 10;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Load mock data
    if (typeof generateMockExecutions === 'function') {
        allExecutions = generateMockExecutions(127);
    } else {
        console.error('Mock data generator not loaded');
        allExecutions = [];
    }
    
    // Initialize filters
    filteredExecutions = allExecutions;
    
    // Render initial state
    updateStats();
    updateFilterCounts();
    renderExecutionsTable();
    
    // Set up event listeners
    setupEventListeners();
    
    // Restore saved filters from sessionStorage
    restoreFilters();
});

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    // Time range buttons
    document.querySelectorAll('.time-range-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const range = this.dataset.range;
            selectTimeRange(range);
        });
    });
    
    // Status filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const status = this.dataset.status;
            selectStatusFilter(status);
        });
    });
    
    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMore);
    }
}

// ============================================================================
// TIME RANGE FILTERING
// ============================================================================

function selectTimeRange(range) {
    currentTimeRange = range;
    currentPage = 0;
    
    // Update button states
    document.querySelectorAll('.time-range-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.range === range);
    });
    
    // Filter executions
    applyFilters();
    
    // Save to sessionStorage
    sessionStorage.setItem('logs_time_range', range);
}

function filterByTimeRange(executions, range) {
    if (typeof filterByTimeRange === 'undefined' && typeof window.filterByTimeRange === 'function') {
        return window.filterByTimeRange(executions, range);
    }
    
    const now = new Date();
    const ranges = {
        'today': 1,
        '7days': 7,
        '30days': 30
    };
    
    const days = ranges[range] || 30;
    const cutoff = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return executions.filter(exec => new Date(exec.timestamp) >= cutoff);
}

// ============================================================================
// STATUS FILTERING
// ============================================================================

function selectStatusFilter(status) {
    currentStatusFilter = status;
    currentPage = 0;
    
    // Update tab states
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.status === status);
    });
    
    // Filter executions
    applyFilters();
    
    // Save to sessionStorage
    sessionStorage.setItem('logs_status_filter', status);
}

function filterByStatus(executions, status) {
    if (status === 'all') return executions;
    return executions.filter(exec => exec.status === status);
}

// ============================================================================
// APPLY FILTERS
// ============================================================================

function applyFilters() {
    // Apply time range filter
    let filtered = filterByTimeRange(allExecutions, currentTimeRange);
    
    // Apply status filter
    filtered = filterByStatus(filtered, currentStatusFilter);
    
    filteredExecutions = filtered;
    displayedExecutions = [];
    currentPage = 0;
    
    // Update UI
    updateStats();
    updateFilterCounts();
    renderExecutionsTable();
}

// ============================================================================
// STATS CALCULATION
// ============================================================================

function updateStats() {
    const stats = calculateStats(filteredExecutions);
    
    // Update stat cards
    document.getElementById('totalExecutions').textContent = stats.total;
    document.getElementById('successRate').textContent = stats.successRate + '%';
    document.getElementById('failedExecutions').textContent = stats.failed;
    document.getElementById('avgDuration').textContent = stats.avgDuration + 's';
    
    // Update subtitles
    const rangeText = {
        'today': 'Today',
        '7days': 'Last 7 days',
        '30days': 'Last 30 days'
    }[currentTimeRange] || 'Last 30 days';
    
    document.querySelectorAll('.stat-subtitle').forEach((el, index) => {
        if (index === 0) el.textContent = rangeText;
        if (index === 1) el.textContent = stats.successful + ' successful';
        if (index === 2) el.textContent = stats.failed > 0 ? 'Needs attention' : 'All good';
    });
}

function calculateStats(executions) {
    if (typeof window.calculateStats === 'function') {
        return window.calculateStats(executions);
    }
    
    const total = executions.length;
    const successful = executions.filter(e => e.status === 'success').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;
    
    const totalDuration = executions.reduce((sum, e) => {
        const duration = parseFloat(e.duration);
        return sum + (isNaN(duration) ? 0 : duration);
    }, 0);
    const avgDuration = total > 0 ? (totalDuration / total).toFixed(1) : '0.0';
    
    return { total, successful, failed, successRate, avgDuration };
}

// ============================================================================
// FILTER COUNTS
// ============================================================================

function updateFilterCounts() {
    const allCount = filteredExecutions.length;
    const successCount = filteredExecutions.filter(e => e.status === 'success').length;
    const failedCount = filteredExecutions.filter(e => e.status === 'failed').length;
    
    document.getElementById('countAll').textContent = allCount;
    document.getElementById('countSuccess').textContent = successCount;
    document.getElementById('countFailed').textContent = failedCount;
}

// ============================================================================
// TABLE RENDERING
// ============================================================================

function renderExecutionsTable() {
    const tbody = document.getElementById('executionsTableBody');
    if (!tbody) return;
    
    // Calculate items to display
    const startIndex = 0;
    const endIndex = (currentPage + 1) * ITEMS_PER_PAGE;
    displayedExecutions = filteredExecutions.slice(startIndex, endIndex);
    
    // Clear table
    tbody.innerHTML = '';
    
    // Render rows
    if (displayedExecutions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">
                    No executions found for the selected filters
                </td>
            </tr>
        `;
        updateLoadMoreButton();
        return;
    }
    
    displayedExecutions.forEach(execution => {
        const row = createExecutionRow(execution);
        tbody.appendChild(row);
    });
    
    updateLoadMoreButton();
}

function createExecutionRow(execution) {
    const row = document.createElement('tr');
    
    // Status column with inline error
    const statusCell = document.createElement('td');
    if (execution.status === 'failed') {
        statusCell.innerHTML = `
            <div class="status-with-error">
                <div class="status-indicator">
                    <span class="status-dot failed"></span>
                    Failed
                </div>
                <div class="error-reason" title="${execution.error || 'Unknown error'}">${truncateError(execution.error || 'Unknown error', 50)}</div>
            </div>
        `;
    } else {
        statusCell.innerHTML = `
            <div class="status-indicator">
                <span class="status-dot success"></span>
                Success
            </div>
        `;
    }
    row.appendChild(statusCell);
    
    // Workflow column
    const workflowCell = document.createElement('td');
    workflowCell.textContent = execution.workflow_name;
    row.appendChild(workflowCell);
    
    // Timestamp column with tooltip
    const timestampCell = document.createElement('td');
    timestampCell.className = 'timestamp-cell';
    timestampCell.textContent = formatTimestamp(execution.timestamp);
    timestampCell.title = getRelativeTime(execution.timestamp);
    row.appendChild(timestampCell);
    
    // Duration column
    const durationCell = document.createElement('td');
    durationCell.style.color = 'rgba(255,255,255,0.7)';
    durationCell.textContent = execution.duration + 's';
    row.appendChild(durationCell);
    
    // Actions column
    const actionsCell = document.createElement('td');
    if (execution.status === 'failed') {
        actionsCell.innerHTML = `
            <button class="cta-button secondary" style="width: auto; padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="analyzeFailure('${execution.id}')">
                Analyze
            </button>
        `;
    } else {
        actionsCell.innerHTML = `
            <button class="cta-button secondary" style="width: auto; padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="viewLog('${execution.id}')">
                View
            </button>
        `;
    }
    row.appendChild(actionsCell);
    
    return row;
}

// ============================================================================
// PAGINATION
// ============================================================================

function loadMore() {
    currentPage++;
    renderExecutionsTable();
}

function updateLoadMoreButton() {
    const btn = document.getElementById('loadMoreBtn');
    if (!btn) return;
    
    const remaining = filteredExecutions.length - displayedExecutions.length;
    
    if (remaining > 0) {
        btn.disabled = false;
        btn.textContent = `Load More (${remaining} remaining)`;
    } else {
        btn.disabled = true;
        btn.textContent = 'All executions loaded';
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatTimestamp(isoString) {
    if (typeof window.formatTimestamp === 'function') {
        return window.formatTimestamp(isoString);
    }
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

function getRelativeTime(isoString) {
    if (typeof window.getRelativeTime === 'function') {
        return window.getRelativeTime(isoString);
    }
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function truncateError(error, maxLength) {
    if (typeof window.truncateError === 'function') {
        return window.truncateError(error, maxLength);
    }
    if (!error) return '';
    if (error.length <= maxLength) return error;
    return error.substring(0, maxLength) + '...';
}

// ============================================================================
// SESSION STORAGE
// ============================================================================

function restoreFilters() {
    const savedTimeRange = sessionStorage.getItem('logs_time_range');
    const savedStatusFilter = sessionStorage.getItem('logs_status_filter');
    
    if (savedTimeRange && savedTimeRange !== currentTimeRange) {
        selectTimeRange(savedTimeRange);
    }
    
    if (savedStatusFilter && savedStatusFilter !== currentStatusFilter) {
        selectStatusFilter(savedStatusFilter);
    }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

function viewLog(executionId) {
    console.log('View log:', executionId);
    alert(`Viewing execution log: ${executionId}\n\nThis would open a detailed log view.`);
}

function analyzeFailure(executionId) {
    const execution = allExecutions.find(e => e.id === executionId);
    if (execution && execution.error) {
        askConsole(`Why did execution ${executionId} fail? Error: ${execution.error}`);
    } else {
        askConsole(`Analyze failed execution ${executionId}`);
    }
}

function askConsole(query) {
    // Store query in sessionStorage for console to pick up
    sessionStorage.setItem('console_prefill_query', query);
    // Navigate to Next.js console
    window.location.href = 'http://localhost:3000/console';
}

// Make functions globally available
window.viewLog = viewLog;
window.analyzeFailure = analyzeFailure;
window.askConsole = askConsole;
