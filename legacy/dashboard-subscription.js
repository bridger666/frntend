// AIVORY Subscription Dashboard JavaScript
// Tier-gated dashboard with mock data

// Tier Configurations
const TIER_CONFIG = {
    builder: {
        name: 'Builder',
        price: 199,
        limits: { workflows: 3, executions: 2500, credits: 50 },
        features: {
            workflowVisualization: 'linear',
            aiInsights: 'diagnostic',
            logFiltering: false,
            workspaceSelector: false,
            slaIndicator: false,
            errorHighlighting: false
        }
    },
    operator: {
        name: 'Operator',
        price: 499,
        limits: { workflows: 10, executions: 10000, credits: 300 },
        features: {
            workflowVisualization: 'branching',
            aiInsights: 'decision',
            logFiltering: true,
            workspaceSelector: false,
            slaIndicator: false,
            errorHighlighting: true
        }
    },
    enterprise: {
        name: 'Enterprise',
        price: 1200,
        limits: { workflows: Infinity, executions: 50000, credits: 2000 },
        features: {
            workflowVisualization: 'orchestration',
            aiInsights: 'multiModel',
            logFiltering: true,
            workspaceSelector: true,
            slaIndicator: true,
            errorHighlighting: true
        }
    }
};

// Mock Data
const MOCK_WORKFLOWS = {
    builder: [
        { id: 'wf-1', name: 'Lead Capture', status: 'active', lastRun: '2 hours ago', type: 'automation' },
        { id: 'wf-2', name: 'Slack Alert', status: 'active', lastRun: '5 minutes ago', type: 'automation' },
        { id: 'wf-3', name: 'Tagging', status: 'paused', lastRun: '1 day ago', type: 'automation' }
    ],
    operator: [
        { id: 'wf-4', name: 'Customer Onboarding', status: 'active', lastRun: '10 minutes ago', type: 'agentic', hasError: false },
        { id: 'wf-5', name: 'Lead Scoring', status: 'active', lastRun: '1 hour ago', type: 'agentic', hasError: true },
        { id: 'wf-6', name: 'Slack Alert', status: 'active', lastRun: '5 minutes ago', type: 'automation', hasError: false },
        { id: 'wf-7', name: 'Email Triage', status: 'active', lastRun: '30 minutes ago', type: 'agentic', hasError: false }
    ],
    enterprise: [
        { id: 'wf-8', name: 'Global Onboarding', status: 'active', lastRun: '5 minutes ago', type: 'agentic', workspace: 'sales' },
        { id: 'wf-9', name: 'Fraud Detection', status: 'active', lastRun: '2 minutes ago', type: 'agentic', workspace: 'ops' },
        { id: 'wf-10', name: 'Ticket Classifier', status: 'active', lastRun: '15 minutes ago', type: 'agentic', workspace: 'engineering' }
    ]
};

const MOCK_EXECUTIONS = [
    { id: 'exec-1', workflowId: 'wf-1', workflowName: 'Lead Capture', timestamp: '12:00', status: 'success', type: 'automation' },
    { id: 'exec-2', workflowId: 'wf-2', workflowName: 'Slack Alert', timestamp: '12:05', status: 'success', type: 'automation' },
    { id: 'exec-3', workflowId: 'wf-3', workflowName: 'Tagging', timestamp: '12:07', status: 'error', type: 'automation' },
    { id: 'exec-4', workflowId: 'wf-4', workflowName: 'Customer Onboarding', timestamp: '12:10', status: 'success', type: 'agentic' }
];

// Dashboard State
let state = {
    tier: 'builder',
    workflows: [],
    executions: [],
    credits: 50,
    creditLimit: 50,
    executionCount: 0,
    executionLimit: 2500,
    selectedWorkspace: 'sales',
    logFilter: 'all'
};

// Initialize Dashboard
function initDashboard() {
    // Get tier from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tier = urlParams.get('tier') || 'builder';
    
    if (!TIER_CONFIG[tier]) {
        console.error('Invalid tier:', tier);
        return;
    }
    
    state.tier = tier;
    const config = TIER_CONFIG[tier];
    
    // Initialize state
    state.workflows = MOCK_WORKFLOWS[tier] || [];
    state.executions = MOCK_EXECUTIONS;
    state.credits = config.limits.credits;
    state.creditLimit = config.limits.credits;
    state.executionLimit = config.limits.executions;
    
    // Render dashboard
    renderTopBar();
    renderWorkflowList();
    renderWorkflowVisualization();
    renderExecutionLogs();
    renderAIInsights();
    
    // Show/hide tier-specific features
    toggleTierFeatures();
    
    // Setup event listeners
    setupEventListeners();
}

// Render Top Bar
function renderTopBar() {
    const config = TIER_CONFIG[state.tier];
    document.getElementById('plan-name').textContent = config.name;
    document.getElementById('credits-balance').textContent = state.credits;
    document.getElementById('credits-limit').textContent = state.creditLimit;
    document.getElementById('executions-used').textContent = state.executionCount;
    document.getElementById('executions-limit').textContent = state.executionLimit.toLocaleString();
    
    // Update credit warning
    const creditBalance = document.getElementById('credits-balance');
    const creditRatio = state.credits / state.creditLimit;
    if (creditRatio < 0.2) {
        creditBalance.parentElement.classList.add('stat-error');
    } else if (creditRatio < 0.5) {
        creditBalance.parentElement.classList.add('stat-warning');
    }
}

// Render Workflow List
function renderWorkflowList() {
    const config = TIER_CONFIG[state.tier];
    const workflowList = document.getElementById('workflow-list');
    const limitIndicator = document.getElementById('workflow-limit');
    
    // Update limit indicator
    const limit = config.limits.workflows === Infinity ? '∞' : config.limits.workflows;
    limitIndicator.textContent = `${state.workflows.length} / ${limit}`;
    
    if (state.workflows.length >= config.limits.workflows * 0.8 && config.limits.workflows !== Infinity) {
        limitIndicator.classList.add('warning');
    }
    
    // Render workflows
    workflowList.innerHTML = state.workflows.map(workflow => `
        <div class="workflow-item">
            <div class="workflow-header">
                <span class="workflow-name">${workflow.name}</span>
            </div>
            <div class="workflow-meta">
                <span class="status-badge ${workflow.status}">${workflow.status.toUpperCase()}</span>
                ${config.features.errorHighlighting && workflow.type === 'agentic' ? 
                    `<span class="type-badge">${workflow.type.toUpperCase()}</span>` : ''}
                ${workflow.hasError ? '<span class="status-badge error">ERROR</span>' : ''}
                <span class="last-run">${workflow.lastRun}</span>
            </div>
            <div class="workflow-actions">
                <button class="workflow-btn" onclick="executeWorkflow('${workflow.id}')">Run</button>
                <button class="workflow-btn">Edit</button>
                <button class="workflow-btn">Retry</button>
            </div>
        </div>
    `).join('');
    
    // Enable/disable add workflow button
    const addBtn = document.getElementById('add-workflow-btn');
    if (state.workflows.length >= config.limits.workflows) {
        addBtn.disabled = true;
    } else {
        addBtn.disabled = false;
    }
}

// Render Workflow Visualization
function renderWorkflowVisualization() {
    const config = TIER_CONFIG[state.tier];
    const vizContainer = document.getElementById('workflow-visualization');
    
    if (config.features.workflowVisualization === 'linear') {
        vizContainer.innerHTML = `
            <div class="workflow-node">Trigger</div>
            <div class="workflow-arrow">↓</div>
            <div class="workflow-node">Action</div>
            <div class="workflow-arrow">↓</div>
            <div class="workflow-node">Action</div>
        `;
    } else if (config.features.workflowVisualization === 'branching') {
        vizContainer.innerHTML = `
            <div class="workflow-node">Trigger</div>
            <div class="workflow-arrow">↓</div>
            <div class="workflow-node ai-decision">AI Decision Node</div>
            <div class="workflow-arrow">↓</div>
            <div class="workflow-branch">
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div class="workflow-node">Low Risk</div>
                    <div class="workflow-arrow">↓</div>
                    <div class="workflow-node">Slack Notify</div>
                    <div class="workflow-arrow">↓</div>
                    <div class="workflow-node">Success</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div class="workflow-node">High Risk</div>
                    <div class="workflow-arrow">↓</div>
                    <div class="workflow-node">Escalate</div>
                    <div class="workflow-arrow">↓</div>
                    <div class="workflow-node">Resolve</div>
                </div>
            </div>
        `;
    } else if (config.features.workflowVisualization === 'orchestration') {
        vizContainer.innerHTML = `
            <div class="workflow-node">Webhook Trigger</div>
            <div class="workflow-arrow">↓</div>
            <div class="workflow-node ai-decision">CMR Routing Engine</div>
            <div class="workflow-arrow">↓</div>
            <div class="workflow-branch">
                <div class="workflow-node">LLM-A</div>
                <div class="workflow-node">LLM-B</div>
                <div class="workflow-node">Rules Engine</div>
            </div>
            <div class="workflow-arrow">↓</div>
            <div class="workflow-branch">
                <div class="workflow-node">Decision</div>
                <div class="workflow-node">NLP Node</div>
            </div>
            <div class="workflow-arrow">↓</div>
            <div class="workflow-node">Action Nodes</div>
            <div class="workflow-arrow">↓</div>
            <div class="workflow-node">Retry Logic</div>
            <div class="workflow-arrow">↓</div>
            <div class="workflow-node ai-decision">Audit Log + Risk Score</div>
        `;
    }
}

// Render Execution Logs
function renderExecutionLogs() {
    const logsContainer = document.getElementById('execution-logs');
    
    // Filter executions
    let filteredExecutions = state.executions;
    if (state.logFilter === 'errors') {
        filteredExecutions = state.executions.filter(e => e.status === 'error');
    } else if (state.logFilter === 'agentic') {
        filteredExecutions = state.executions.filter(e => e.type === 'agentic');
    }
    
    logsContainer.innerHTML = filteredExecutions.map(exec => `
        <div class="log-entry">
            <span class="log-time">${exec.timestamp}</span>
            <span class="log-status ${exec.status}">${exec.status === 'success' ? '✓' : '✗'}</span>
            <span class="log-workflow">${exec.workflowName}</span>
        </div>
    `).join('');
}

// Render AI Insights
function renderAIInsights() {
    const config = TIER_CONFIG[state.tier];
    const insightContent = document.getElementById('ai-insight-content');
    const insightTitle = document.getElementById('insight-title');
    
    if (config.features.aiInsights === 'diagnostic') {
        insightTitle.textContent = 'Diagnostic Summary';
        insightContent.innerHTML = `
            <div class="insight-row">
                <span class="insight-label">AI Readiness Score</span>
                <span class="insight-value">68 / 100</span>
            </div>
            <div class="insight-row">
                <span class="insight-label">Strength Index</span>
                <span class="insight-value">72</span>
            </div>
            <div class="insight-row">
                <span class="insight-label">Bottleneck Index</span>
                <span class="insight-value">41</span>
            </div>
            <div class="insight-row">
                <span class="insight-label">Top Recommendations</span>
                <span class="insight-value">3</span>
            </div>
            <div class="insight-row">
                <span class="insight-label">Credits Used</span>
                <span class="insight-value">${state.creditLimit - state.credits} / ${state.creditLimit}</span>
            </div>
        `;
    } else if (config.features.aiInsights === 'decision') {
        insightTitle.textContent = 'AI Decision Insight';
        insightContent.innerHTML = `
            <div class="insight-row">
                <span class="insight-label">Decision ID</span>
                <span class="insight-value">#D-9021</span>
            </div>
            <div class="insight-row">
                <span class="insight-label">Model Used</span>
                <span class="insight-value">Claude Code</span>
            </div>
            <div class="insight-row">
                <span class="insight-label">Token Usage</span>
                <span class="insight-value">1,284</span>
            </div>
            <div class="insight-row">
                <span class="insight-label">Intelligence Cost</span>
                <span class="insight-value">3 Credits</span>
            </div>
            <div class="insight-row">
                <span class="insight-label">Confidence Score</span>
                <span class="insight-value">87%</span>
            </div>
            <div class="reasoning-trace">
                <h4>Reasoning Trace:</h4>
                <ul>
                    <li>Score 72 > Threshold 60</li>
                    <li>Medium risk escalation</li>
                </ul>
            </div>
        `;
    } else if (config.features.aiInsights === 'multiModel') {
        insightTitle.textContent = 'Multi-Model Routing Breakdown';
        insightContent.innerHTML = `
            <div class="insight-row">
                <span class="insight-label">NLP Model</span>
                <span class="insight-value">BytePlus</span>
            </div>
            <div class="insight-row">
                <span class="insight-label">Reasoning Model</span>
                <span class="insight-value">Claude Code</span>
            </div>
            <div class="reasoning-trace">
                <h4>Token Per Model:</h4>
                <ul>
                    <li>LLM-A: 812</li>
                    <li>LLM-B: 472</li>
                </ul>
            </div>
            <div class="insight-row">
                <span class="insight-label">Risk Score</span>
                <span class="insight-value">0.42</span>
            </div>
            <div class="insight-row">
                <span class="insight-label">SLA Status</span>
                <span class="insight-value" style="color: var(--success)">Within Threshold</span>
            </div>
            <div class="insight-row">
                <span class="insight-label">Audit Trail</span>
                <span class="insight-value">Enabled</span>
            </div>
        `;
    }
}

// Toggle Tier Features
function toggleTierFeatures() {
    const config = TIER_CONFIG[state.tier];
    
    // Log filtering
    document.getElementById('log-filters').style.display = 
        config.features.logFiltering ? 'flex' : 'none';
    
    // Workspace selector
    document.getElementById('workspace-selector').style.display = 
        config.features.workspaceSelector ? 'block' : 'none';
    
    // SLA indicator
    document.getElementById('sla-indicator').style.display = 
        config.features.slaIndicator ? 'block' : 'none';
}

// Execute Workflow (Simulated)
function executeWorkflow(workflowId) {
    const workflow = state.workflows.find(w => w.id === workflowId);
    if (!workflow) return;
    
    // Deduct credits (1-5 random)
    const creditCost = Math.floor(Math.random() * 5) + 1;
    animateCreditDeduction(state.credits, Math.max(0, state.credits - creditCost));
    
    // Increment execution count
    state.executionCount++;
    document.getElementById('executions-used').textContent = state.executionCount;
    
    // Add execution log
    const now = new Date();
    const timestamp = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const status = Math.random() > 0.1 ? 'success' : 'error';
    
    state.executions.unshift({
        id: `exec-${Date.now()}`,
        workflowId: workflow.id,
        workflowName: workflow.name,
        timestamp: timestamp,
        status: status,
        type: workflow.type
    });
    
    // Re-render
    renderExecutionLogs();
    renderAIInsights();
}

// Animate Credit Deduction
function animateCreditDeduction(fromValue, toValue) {
    const duration = 500;
    const startTime = performance.now();
    const difference = fromValue - toValue;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(fromValue - (difference * eased));
        
        document.getElementById('credits-balance').textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            state.credits = toValue;
        }
    }
    
    requestAnimationFrame(update);
}

// Setup Event Listeners
function setupEventListeners() {
    // Log filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.logFilter = btn.dataset.filter;
            renderExecutionLogs();
        });
    });
    
    // Workspace selector
    const workspaceSelect = document.getElementById('workspace-select');
    if (workspaceSelect) {
        workspaceSelect.addEventListener('change', (e) => {
            state.selectedWorkspace = e.target.value;
            // Filter workflows by workspace (if needed)
            renderWorkflowList();
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
