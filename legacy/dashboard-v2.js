/**
 * ============================================================================
 * AIVORY PROGRESSIVE DASHBOARD SYSTEM
 * ============================================================================
 * 
 * A unified, single-codebase dashboard that progressively unlocks features
 * across 4 tiers: Free (1), Snapshot (2), Blueprint (3), Operator (4)
 */

// API Configuration - Use global API_BASE_URL set by app.js
// No local declaration needed - just reference window.API_BASE_URL directly

// ============================================================================
// DASHBOARD STATE
// ============================================================================

const DashboardState = {
    tier: 1,
    activeView: 'dashboard',
    data: {},
    isLoading: false
};

// ============================================================================
// TIER DETECTION
// ============================================================================

/**
 * Detect tier from URL parameter, sessionStorage, or default to 1
 * Property 1: Tier Detection from URL
 */
function detectTier() {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const urlTier = urlParams.get('tier');
    
    if (urlTier) {
        const tier = parseInt(urlTier, 10);
        if (tier >= 1 && tier <= 4) {
            sessionStorage.setItem('dashboard_tier', tier.toString());
            return tier;
        }
    }
    
    // Check sessionStorage
    const storedTier = sessionStorage.getItem('dashboard_tier');
    if (storedTier) {
        const tier = parseInt(storedTier, 10);
        if (tier >= 1 && tier <= 4) {
            return tier;
        }
    }
    
    // Default to tier 1
    return 1;
}

// ============================================================================
// DATA MANAGER
// ============================================================================

class DataManager {
    static getCachedData(tier) {
        const key = `dashboard_tier${tier}_data`;
        const cached = sessionStorage.getItem(key);
        return cached ? JSON.parse(cached) : null;
    }
    
    static setCachedData(tier, data) {
        const key = `dashboard_tier${tier}_data`;
        sessionStorage.setItem(key, JSON.stringify(data));
    }
    
    static clearCache() {
        for (let i = 1; i <= 4; i++) {
            sessionStorage.removeItem(`dashboard_tier${i}_data`);
        }
        sessionStorage.removeItem('dashboard_tier');
    }
}

// ============================================================================
// COMPONENT BASE CLASS
// ============================================================================

class DashboardComponent {
    constructor(containerId, data) {
        this.containerId = containerId;
        this.data = data;
    }
    
    render() {
        throw new Error('render() must be implemented by subclass');
    }
    
    update(newData) {
        this.data = newData;
        this.render();
    }
    
    cleanup() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
    
    isVisible(tier) {
        return true;
    }
}

// ============================================================================
// SIDEBAR NAVIGATION COMPONENT
// ============================================================================

class SidebarNavigation extends DashboardComponent {
    constructor(tier) {
        super('dashboardSidebar', {});
        this.tier = tier;
    }
    
    getNavigationItems() {
        const navigationMap = {
            1: [
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'upgrade', label: 'Upgrade', icon: '⬆️' }
            ],
            2: [
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'reports', label: 'Reports', icon: '📄' },
                { id: 'upgrade', label: 'Upgrade', icon: '⬆️' }
            ],
            3: [
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'reports', label: 'Reports', icon: '📄' },
                { id: 'architecture', label: 'Architecture', icon: '🏗️' },
                { id: 'upgrade', label: 'Upgrade', icon: '⬆️' }
            ],
            4: [
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'systems', label: 'Systems', icon: '⚙️' },
                { id: 'reports', label: 'Reports', icon: '📄' },
                { id: 'logs', label: 'Logs', icon: '📋' },
                { id: 'intelligence', label: 'Intelligence', icon: '🧠' },
                { id: 'help', label: 'Help', icon: '❓' }
            ]
        };
        
        return navigationMap[this.tier] || navigationMap[1];
    }
    
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        const items = this.getNavigationItems();
        
        container.innerHTML = `
            <ul class="nav-items">
                ${items.map(item => `
                    <li class="nav-item">
                        <a href="#" 
                           class="nav-link ${DashboardState.activeView === item.id ? 'active' : ''}" 
                           data-view="${item.id}">
                            <span class="nav-icon">${item.icon}</span>
                            <span class="nav-label">${item.label}</span>
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
        
        // Attach click handlers
        container.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                this.navigateTo(view);
            });
        });
    }
    
    navigateTo(view) {
        if (view === 'upgrade') {
            this.handleUpgrade();
            return;
        }
        
        DashboardState.activeView = view;
        this.render();
        renderDashboard();
    }
    
    handleUpgrade() {
        const upgradeMap = {
            1: 'index.html#snapshot',
            2: 'index.html#blueprint',
            3: 'index.html#operator'
        };
        
        const url = upgradeMap[this.tier];
        if (url) {
            window.location.href = url;
        }
    }
}

// ============================================================================
// METRIC CARDS COMPONENT
// ============================================================================

class MetricCards extends DashboardComponent {
    constructor(tier, data) {
        super('metricCards', data);
        this.tier = tier;
    }
    
    getMetricsForTier() {
        const metricsMap = {
            1: this.getTier1Metrics(),
            2: this.getTier2Metrics(),
            3: this.getTier3Metrics(),
            4: this.getTier4Metrics()
        };
        
        return metricsMap[this.tier] || [];
    }
    
    getTier1Metrics() {
        return [
            { label: 'AI Readiness Lite', value: this.data.score || 0, sublabel: this.data.category || 'N/A' },
            { label: 'Workflow Health', value: '—', sublabel: 'Basic Assessment' },
            { label: 'Automation Exposure', value: '—', sublabel: 'Basic Assessment' },
            { label: 'Org Readiness', value: '—', sublabel: 'Basic Assessment' }
        ];
    }
    
    getTier2Metrics() {
        return [
            { label: 'Readiness Score', value: this.data.readiness_score || 0, sublabel: this.data.readiness_level || 'N/A' },
            { label: 'Strength Index', value: this.data.strength_index || 0, sublabel: this.data.strength_category || 'N/A' },
            { label: 'Bottleneck Index', value: this.data.bottleneck_index || 0, sublabel: this.data.bottleneck_category || 'N/A' },
            { label: 'Priority Score', value: this.data.priority_score || 0, sublabel: 'Strategic Priority' }
        ];
    }
    
    getTier3Metrics() {
        const sysArch = this.data.system_architecture || {};
        const impact = this.data.impact_projection || {};
        
        return [
            { label: 'Selected AI System', value: sysArch.system_name || 'N/A', sublabel: sysArch.core_objective || '' },
            { label: 'Automation Potential', value: `${impact.automation_potential_percent || 0}%`, sublabel: 'Process Coverage' },
            { label: 'Time Saved', value: impact.time_saved_estimate || 'N/A', sublabel: 'Projected Monthly' },
            { label: 'ROI Projection', value: impact.roi_projection || 'N/A', sublabel: '12-Month Outlook' }
        ];
    }
    
    getTier4Metrics() {
        const tierInfo = this.data.tier_info || {};
        const usage = this.data.usage_metrics || {};
        
        return [
            { label: 'Active Systems', value: this.data.active_systems?.length || 0, sublabel: `${tierInfo.workflows || 0} Max` },
            { label: 'Monthly Runs', value: usage.executions_used || 0, sublabel: `of ${usage.executions_limit || 0}` },
            { label: 'Time Saved', value: '127h', sublabel: 'This Month' },
            { label: 'Intelligence Credits', value: usage.credits_used || 0, sublabel: `of ${usage.credits_limit || 0}` },
            { label: 'Priority Alerts', value: 0, sublabel: 'No Issues' }
        ];
    }
    
    render() {
        const metrics = this.getMetricsForTier();
        
        const html = `
            <div class="metric-cards">
                ${metrics.map(metric => `
                    <div class="metric-card">
                        <div class="metric-label">${metric.label}</div>
                        <div class="metric-value">${metric.value}</div>
                        <div class="metric-sublabel">${metric.sublabel}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        return html;
    }
}

// ============================================================================
// TIER 1 COMPONENTS
// ============================================================================

class StrengthSignalCard extends DashboardComponent {
    render() {
        const insights = this.data.insights || [];
        
        return `
            <div class="dashboard-card">
                <h3>💪 Strength Signal</h3>
                <ul class="dashboard-list">
                    ${insights.slice(0, 2).map(insight => `<li>${insight}</li>`).join('')}
                </ul>
            </div>
        `;
    }
}

class BottleneckSignalCard extends DashboardComponent {
    render() {
        return `
            <div class="dashboard-card">
                <h3>⚠️ Bottleneck Signal</h3>
                <p>${this.data.recommendation || 'No bottlenecks detected'}</p>
            </div>
        `;
    }
}

class QuickRecommendationsCard extends DashboardComponent {
    render() {
        const insights = this.data.insights || [];
        
        return `
            <div class="dashboard-card">
                <h3>💡 Quick Recommendations</h3>
                <ul class="dashboard-list">
                    ${insights.slice(0, 3).map(insight => `<li>${insight}</li>`).join('')}
                </ul>
            </div>
        `;
    }
}

class UpgradeCTACard extends DashboardComponent {
    constructor(tier, data) {
        super('upgradeCTA', data);
        this.tier = tier;
    }
    
    render() {
        const upgradeInfo = {
            1: { title: 'Upgrade to AI Snapshot', price: '$15', description: 'Get AI-powered insights with 30-question assessment, business objective detection, and automation opportunities.', link: 'index.html#snapshot' },
            2: { title: 'Upgrade to Deep Diagnostic', price: '$99', description: 'Get complete system architecture with deployment phases, agent structure, and ROI projections.', link: 'index.html#blueprint' },
            3: { title: 'Activate AI Operating Partner', price: 'From $199/mo', description: 'Deploy your AI system and get live monitoring, execution logs, and intelligence insights.', link: 'index.html#operator' }
        };
        
        const info = upgradeInfo[this.tier];
        if (!info) return '';
        
        return `
            <div class="upgrade-card">
                <h3>${info.title}</h3>
                <div class="upgrade-price">${info.price}</div>
                <p>${info.description}</p>
                <button class="cta-button primary" onclick="window.location.href='${info.link}'">
                    Upgrade Now
                </button>
            </div>
        `;
    }
}

// ============================================================================
// TIER 2 COMPONENTS
// ============================================================================

class CategoryBreakdownPanel extends DashboardComponent {
    render() {
        const categories = this.data.category_scores || {};
        
        return `
            <div class="dashboard-card">
                <h3>📊 Category Breakdown</h3>
                ${Object.entries(categories).map(([key, value]) => `
                    <div class="progress-bar-container">
                        <div class="progress-bar-label">
                            <span>${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                            <span>${Math.round(value)}/100</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${value}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

class TopRecommendationsPanel extends DashboardComponent {
    render() {
        const recs = this.data.top_recommendations || [];
        
        return `
            <div class="dashboard-card">
                <h3>💡 Recommended Systems</h3>
                <ul class="dashboard-list">
                    ${recs.map(rec => `<li>${rec.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>`).join('')}
                </ul>
                <p class="mt-2" style="color: var(--color-text-secondary);">
                    Based on your ${(this.data.primary_objective || '').replace(/_/g, ' ')} objective
                </p>
            </div>
        `;
    }
}

// ============================================================================
// TIER 3 COMPONENTS
// ============================================================================

class SystemArchitecturePanel extends DashboardComponent {
    render() {
        const sysArch = this.data.system_architecture || {};
        
        return `
            <div class="dashboard-card">
                <h2>🏗️ System Architecture</h2>
                <h3>${sysArch.system_name || 'N/A'}</h3>
                <p><strong>Core Objective:</strong> ${sysArch.core_objective || 'N/A'}</p>
                <p class="mt-2">${sysArch.operating_model || 'N/A'}</p>
                <div class="mt-3">
                    <span style="color: var(--color-text-secondary);">Confidence Level:</span>
                    <span style="color: var(--color-mint-green); font-weight: 500; margin-left: 8px;">
                        ${sysArch.confidence_level || 'N/A'}
                    </span>
                </div>
            </div>
        `;
    }
}

class AgentStructureCards extends DashboardComponent {
    render() {
        const agents = this.data.agent_structure || [];
        
        return `
            <div class="dashboard-card">
                <h3>🤖 Agent Structure</h3>
                <div class="dashboard-grid">
                    ${agents.map(agent => `
                        <div class="dashboard-card" style="margin-bottom: 0;">
                            <h4 style="color: var(--color-mint-green);">${agent.agent_name}</h4>
                            <p style="font-style: italic; font-size: 14px; margin-bottom: 16px;">
                                ${agent.role}
                            </p>
                            <ul class="dashboard-list">
                                ${agent.responsibilities.map(resp => `<li style="font-size: 14px;">${resp}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// ============================================================================
// TIER 4 COMPONENTS
// ============================================================================

class AISystemsTable extends DashboardComponent {
    render() {
        const systems = this.data.active_systems || [];
        
        return `
            <div class="dashboard-card">
                <h3>⚙️ AI Systems</h3>
                <table class="systems-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Health</th>
                            <th>Last Run</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${systems.map(system => `
                            <tr>
                                <td>${system.name}</td>
                                <td>${system.type}</td>
                                <td>
                                    <span class="status-dot ${system.status.toLowerCase()}"></span>
                                    ${system.status}
                                </td>
                                <td>${system.health}%</td>
                                <td>${this.formatTimestamp(system.last_run)}</td>
                                <td>
                                    <button class="cta-button secondary" style="padding: 4px 16px; font-size: 14px;">
                                        Execute
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    formatTimestamp(timestamp) {
        if (!timestamp) return 'Never';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    }
}

class ExecutionLogsPanel extends DashboardComponent {
    render() {
        const logs = this.data.execution_logs || [];
        
        return `
            <div class="dashboard-card">
                <h3>📋 Execution Logs</h3>
                <ul class="dashboard-list">
                    ${logs.slice(0, 5).map(log => `
                        <li>
                            <strong>${log.system_name}</strong> - ${log.status}
                            <br>
                            <span style="font-size: 12px; color: var(--color-text-secondary);">
                                ${this.formatTimestamp(log.timestamp)} • ${log.duration_ms}ms
                            </span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    formatTimestamp(timestamp) {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleString();
    }
}

class IntelligenceInsightsPanel extends DashboardComponent {
    render() {
        const insights = this.data.intelligence_insights || {};
        
        return `
            <div class="dashboard-card">
                <h3>🧠 Intelligence Insights</h3>
                <div class="mb-3">
                    <h4 style="color: var(--color-mint-green); margin-bottom: 8px;">Bottleneck Detection</h4>
                    <ul class="dashboard-list">
                        ${(insights.bottleneck_detection || []).map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="mb-3">
                    <h4 style="color: var(--color-mint-green); margin-bottom: 8px;">Anomaly Signals</h4>
                    <ul class="dashboard-list">
                        ${(insights.anomaly_signals || []).map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h4 style="color: var(--color-mint-green); margin-bottom: 8px;">Optimization Suggestions</h4>
                    <ul class="dashboard-list">
                        ${(insights.optimization_suggestions || []).map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
}

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

const ComponentRegistry = {
    1: [
        { component: MetricCards, id: 'metricCards' },
        { component: StrengthSignalCard, id: 'strengthSignal' },
        { component: BottleneckSignalCard, id: 'bottleneckSignal' },
        { component: QuickRecommendationsCard, id: 'quickRecs' },
        { component: UpgradeCTACard, id: 'upgradeCTA' }
    ],
    2: [
        { component: MetricCards, id: 'metricCards' },
        { component: CategoryBreakdownPanel, id: 'categoryBreakdown' },
        { component: TopRecommendationsPanel, id: 'topRecs' },
        { component: UpgradeCTACard, id: 'upgradeCTA' }
    ],
    3: [
        { component: MetricCards, id: 'metricCards' },
        { component: SystemArchitecturePanel, id: 'sysArch' },
        { component: AgentStructureCards, id: 'agentCards' },
        { component: UpgradeCTACard, id: 'upgradeCTA' }
    ],
    4: [
        { component: MetricCards, id: 'metricCards' },
        { component: AISystemsTable, id: 'systemsTable' },
        { component: ExecutionLogsPanel, id: 'execLogs' },
        { component: IntelligenceInsightsPanel, id: 'intelligence' }
    ]
};

// ============================================================================
// DASHBOARD CONTROLLER
// ============================================================================

function initializeDashboard() {
    // Detect tier
    DashboardState.tier = detectTier();
    
    // Update tier badge
    document.getElementById('tierBadge').textContent = getTierName(DashboardState.tier);
    
    // Load data
    loadDashboardData();
    
    // Render sidebar
    const sidebar = new SidebarNavigation(DashboardState.tier);
    sidebar.render();
    
    // Render dashboard
    renderDashboard();
}

function getTierName(tier) {
    const names = { 1: 'Free', 2: 'Snapshot', 3: 'Blueprint', 4: 'Operator' };
    return names[tier] || 'Free';
}

function loadDashboardData() {
    // Try to load from cache
    const cached = DataManager.getCachedData(DashboardState.tier);
    
    if (cached) {
        DashboardState.data = cached;
        return;
    }
    
    // Load mock data for each tier
    const mockDataFunctions = {
        1: getMockFreeData,
        2: getMockSnapshotData,
        3: getMockBlueprintData,
        4: getMockOperatorData
    };
    
    const getMockData = mockDataFunctions[DashboardState.tier];
    if (getMockData) {
        DashboardState.data = getMockData();
        DataManager.setCachedData(DashboardState.tier, DashboardState.data);
        return;
    }
    
    // For other tiers, try to load from old dashboard storage
    const oldKeys = {
        1: 'dashboard_free_data',
        2: 'dashboard_snapshot_data',
        3: 'dashboard_blueprint_data'
    };
    
    const oldKey = oldKeys[DashboardState.tier];
    if (oldKey) {
        const oldData = sessionStorage.getItem(oldKey);
        if (oldData) {
            DashboardState.data = JSON.parse(oldData);
            DataManager.setCachedData(DashboardState.tier, DashboardState.data);
        }
    }
}

function renderDashboard() {
    const container = document.getElementById('dashboardContent');
    if (!container) return;
    
    const components = ComponentRegistry[DashboardState.tier] || [];
    
    let html = '';
    
    components.forEach(({ component: Component, id }) => {
        const instance = new Component(DashboardState.tier, DashboardState.data);
        html += instance.render();
    });
    
    container.innerHTML = html;
}

function getMockFreeData() {
    return {
        score: 62,
        category: 'Emerging',
        category_explanation: 'Your organization shows early signs of AI readiness',
        insights: [
            'Strong leadership alignment on AI initiatives',
            'Good data infrastructure foundation in place',
            'Process documentation needs improvement',
            'Limited automation exposure across workflows'
        ],
        recommendation: 'Focus on standardizing workflows and building internal AI capability before scaling automation efforts.'
    };
}

function getMockSnapshotData() {
    return {
        readiness_score: 68,
        readiness_level: 'Medium',
        strength_index: 75,
        strength_category: 'Data Infrastructure',
        bottleneck_index: 45,
        bottleneck_category: 'Workflow Maturity',
        priority_score: 72,
        primary_objective: 'increase_revenue',
        deployment_phase_suggestion: 'pilot',
        category_scores: {
            workflow: 58,
            data: 75,
            automation: 62,
            organization: 71
        },
        top_recommendations: [
            'revenue_intelligence_system',
            'customer_engagement_automation',
            'sales_pipeline_optimizer'
        ]
    };
}

function getMockBlueprintData() {
    return {
        executive_summary: 'Based on your revenue growth objective and medium AI readiness, we recommend implementing a Revenue Intelligence System. This system will automate lead scoring, opportunity tracking, and revenue forecasting to accelerate your sales cycle.',
        system_architecture: {
            system_name: 'Revenue Intelligence System',
            core_objective: 'Accelerate revenue growth through intelligent lead scoring and opportunity management',
            operating_model: 'This system operates as an always-on revenue intelligence layer that monitors your sales pipeline, scores leads based on conversion probability, and provides real-time forecasting insights to your sales team.',
            confidence_level: 'High'
        },
        workflow_architecture: {
            trigger_logic: 'System activates when new leads enter CRM or when opportunity stages change',
            core_steps: [
                'Ingest lead data from CRM and enrichment sources',
                'Score lead quality using ML model trained on historical conversions',
                'Route high-value leads to appropriate sales reps',
                'Monitor opportunity progression and flag at-risk deals',
                'Generate revenue forecasts based on pipeline health'
            ],
            decision_conditions: [
                'If lead score > 80, route to senior sales rep',
                'If opportunity stalled > 14 days, trigger intervention',
                'If forecast variance > 15%, alert sales leadership'
            ],
            escalation_paths: [
                'High-value deals ($50K+) escalate to VP Sales',
                'At-risk opportunities trigger account manager review',
                'Forecast anomalies alert CFO and sales leadership'
            ]
        },
        agent_structure: [
            {
                agent_name: 'Lead Scoring Agent',
                role: 'Qualification & Prioritization',
                responsibilities: [
                    'Analyze lead attributes and behavioral signals',
                    'Assign conversion probability scores',
                    'Recommend optimal sales rep assignment'
                ]
            },
            {
                agent_name: 'Pipeline Monitor Agent',
                role: 'Opportunity Health Tracking',
                responsibilities: [
                    'Track opportunity stage progression',
                    'Identify stalled or at-risk deals',
                    'Suggest intervention strategies'
                ]
            },
            {
                agent_name: 'Forecast Agent',
                role: 'Revenue Prediction & Analysis',
                responsibilities: [
                    'Generate rolling revenue forecasts',
                    'Detect forecast anomalies',
                    'Provide confidence intervals for projections'
                ]
            }
        ],
        impact_projection: {
            automation_potential_percent: 65,
            time_saved_estimate: '40 hours/month',
            roi_projection: '3.2x within 12 months'
        },
        deployment_phases: [
            'Phase 1: CRM integration and data pipeline setup (2 weeks)',
            'Phase 2: Lead scoring model training and validation (3 weeks)',
            'Phase 3: Pipeline monitoring and alerting deployment (2 weeks)',
            'Phase 4: Forecast engine implementation (3 weeks)',
            'Phase 5: Full system rollout and team training (2 weeks)'
        ],
        recommended_subscription_tier: 'Operator ($499/month)'
    };
}

function getMockOperatorData() {
    return {
        tier_info: {
            name: 'Operator',
            price: 499,
            workflows: 10,
            executions: 10000,
            credits: 300
        },
        active_systems: [
            {
                id: '1',
                name: 'Revenue Intelligence System',
                type: 'Agentic',
                status: 'Active',
                health: 98,
                last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                executions_count: 127
            },
            {
                id: '2',
                name: 'Customer Support Triage',
                type: 'Automation',
                status: 'Idle',
                health: 100,
                last_run: null,
                executions_count: 0
            }
        ],
        execution_logs: [
            {
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                system_name: 'Revenue Intelligence System',
                status: 'Success',
                duration_ms: 1250,
                message: 'Scored 15 new leads, identified 2 at-risk opportunities'
            },
            {
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                system_name: 'Revenue Intelligence System',
                status: 'Success',
                duration_ms: 980,
                message: 'Updated revenue forecast, confidence: 87%'
            }
        ],
        intelligence_insights: {
            bottleneck_detection: [
                'Lead response time averaging 18 hours (target: <4 hours)',
                'Opportunity stage 3→4 conversion taking 12 days (industry avg: 7 days)'
            ],
            anomaly_signals: [
                'No anomalies detected in the last 7 days'
            ],
            optimization_suggestions: [
                'Implement automated lead response for inbound inquiries',
                'Add stage 3 acceleration playbook to reduce conversion time',
                'Consider A/B testing different lead scoring thresholds'
            ]
        },
        usage_metrics: {
            executions_used: 127,
            executions_limit: 10000,
            credits_used: 12,
            credits_limit: 300
        }
    };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', initializeDashboard);
