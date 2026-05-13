/**
 * Workflow Failed Alert System
 * Shows red banner at top of dashboard + console if any workflow has status: failed
 * Red badge on Workflows nav item
 */

const WorkflowAlertManager = {
    failedWorkflows: [],
    
    /**
     * Check for failed workflows
     */
    async checkFailedWorkflows() {
        try {
            // Ensure API_BASE_URL is set
            if (!window.API_BASE_URL) {
                const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                window.API_BASE_URL = isDev ? 'http://localhost:8081' : window.location.origin;
            }
            
            const userId = AuthManager.getUserId() || 'GrandMasterRCH';
            const response = await fetch(`${window.API_BASE_URL}/api/v1/workflows/list?user_id=${userId}`);
            
            if (!response.ok) {
                return;
            }
            
            const workflows = await response.json();
            this.failedWorkflows = workflows.filter(w => w.status === 'failed');
            
            if (this.failedWorkflows.length > 0) {
                this.showFailedAlert();
                this.addNavBadge();
            } else {
                this.hideFailedAlert();
                this.removeNavBadge();
            }
            
        } catch (error) {
            console.error('Failed to check workflows:', error);
        }
    },
    
    /**
     * Show red banner at top
     */
    showFailedAlert() {
        // Remove existing alert
        this.hideFailedAlert();
        
        const alert = document.createElement('div');
        alert.id = 'workflow-failed-alert';
        alert.className = 'workflow-failed-alert';
        alert.innerHTML = `
            <div class="alert-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>${this.failedWorkflows.length} workflow${this.failedWorkflows.length > 1 ? 's' : ''} failed</span>
                <a href="workflows.html" class="alert-link">View Details →</a>
            </div>
            <button class="alert-close" onclick="WorkflowAlertManager.hideFailedAlert()">×</button>
        `;
        
        // Insert at top of page
        const body = document.body;
        body.insertBefore(alert, body.firstChild);
    },
    
    /**
     * Hide alert banner
     */
    hideFailedAlert() {
        const alert = document.getElementById('workflow-failed-alert');
        if (alert) {
            alert.remove();
        }
    },
    
    /**
     * Add red badge to Workflows nav item
     */
    addNavBadge() {
        const workflowsNav = document.querySelector('a[href="workflows.html"]');
        if (workflowsNav && !workflowsNav.querySelector('.nav-badge')) {
            const badge = document.createElement('span');
            badge.className = 'nav-badge nav-badge-error';
            badge.textContent = this.failedWorkflows.length;
            workflowsNav.appendChild(badge);
        }
    },
    
    /**
     * Remove badge from nav
     */
    removeNavBadge() {
        const badge = document.querySelector('a[href="workflows.html"] .nav-badge');
        if (badge) {
            badge.remove();
        }
    },
    
    /**
     * Initialize on page load
     */
    init() {
        // Check immediately
        this.checkFailedWorkflows();
        
        // Check every 30 seconds
        setInterval(() => this.checkFailedWorkflows(), 30000);
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => WorkflowAlertManager.init(), 500);
    });
} else {
    setTimeout(() => WorkflowAlertManager.init(), 500);
}

// Make globally available
window.WorkflowAlertManager = WorkflowAlertManager;
