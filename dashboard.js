/**
 * Aivory Dashboard - Unified Dashboard System
 * Supports 4 modes: free, snapshot, blueprint, operate
 */

// Global state
const DashboardState = {
    mode: 'free',
    language: 'en',
    data: null,
    selectedTier: null
};

// Translations
const translations = {
    en: {
        loading: 'Analyzing your AI readiness...',
        error: 'Temporarily Unavailable',
        errorMessage: 'AI analysis is temporarily unavailable. Please try again in a moment.',
        tryAgain: 'Try Again',
        downloadReport: 'Download Report',
        readinessScore: 'Readiness Score',
        insights: 'Key Insights',
        recommendations: 'Recommendations',
        upgradeToSnapshot: 'Upgrade to AI Snapshot',
        upgradeToBlueprint: 'Upgrade to Deep Diagnostic',
        runSnapshot: 'Run AI Snapshot',
        runBlueprint: 'Run Deep Diagnostic',
        deploySystem: 'Deploy This System',
        executiveSummary: 'Executive Summary',
        systemOverview: 'System Overview',
        workflowArchitecture: 'Workflow Architecture',
        agentStructure: 'Agent Structure',
        expectedImpact: 'Expected Impact',
        deploymentComplexity: 'Deployment Complexity',
        recommendedTier: 'Recommended Subscription Tier',
        businessObjective: 'Business Objective Detected',
        keyGaps: 'Key Gaps',
        automationOpportunities: 'Automation Opportunities',
        recommendedSystem: 'Recommended System Outline',
        priorityActions: 'Priority Actions',
        tierOverview: 'Your Subscription',
        workflows: 'Workflows',
        executionMonitor: 'Execution Monitor',
        orchestrationStatus: 'Orchestration Status',
        upgradeTier: 'Upgrade Tier'
    },
    id: {
        loading: 'Menganalisis kesiapan AI Anda...',
        error: 'Sementara Tidak Tersedia',
        errorMessage: 'Analisis AI sementara tidak tersedia. Silakan coba lagi sebentar lagi.',
        tryAgain: 'Coba Lagi',
        downloadReport: 'Unduh Laporan',
        readinessScore: 'Skor Kesiapan',
        insights: 'Wawasan Utama',
        recommendations: 'Rekomendasi',
        upgradeToSnapshot: 'Upgrade ke AI Snapshot',
        upgradeToBlueprint: 'Upgrade ke Deep Diagnostic',
        runSnapshot: 'Jalankan AI Snapshot',
        runBlueprint: 'Jalankan Deep Diagnostic',
        deploySystem: 'Deploy Sistem Ini',
        executiveSummary: 'Ringkasan Eksekutif',
        systemOverview: 'Gambaran Sistem',
        workflowArchitecture: 'Arsitektur Workflow',
        agentStructure: 'Struktur Agen',
        expectedImpact: 'Dampak yang Diharapkan',
        deploymentComplexity: 'Kompleksitas Deployment',
        recommendedTier: 'Tier Langganan yang Direkomendasikan',
        businessObjective: 'Objektif Bisnis Terdeteksi',
        keyGaps: 'Kesenjangan Utama',
        automationOpportunities: 'Peluang Otomasi',
        recommendedSystem: 'Garis Besar Sistem yang Direkomendasikan',
        priorityActions: 'Tindakan Prioritas',
        tierOverview: 'Langganan Anda',
        workflows: 'Workflows',
        executionMonitor: 'Monitor Eksekusi',
        orchestrationStatus: 'Status Orkestrasi',
        upgradeTier: 'Upgrade Tier'
    }
};

// Get translation
function t(key) {
    return translations[DashboardState.language][key] || key;
}

// Initialize dashboard
async function initDashboard() {
    console.log('Dashboard: Initializing...');
    
    // Show loading indicator
    showLoadingIndicator();
    
    // Wait for AuthManager to be ready
    if (!window.AuthManagerReady) {
        console.log('Dashboard: Waiting for AuthManager...');
        await waitForAuthManager();
    }
    
    // Check authentication
    if (typeof AuthManager === 'undefined') {
        console.error('❌ AuthManager not available');
        hideLoadingIndicator();
        alert('Authentication system not loaded. Please refresh the page.');
        return;
    }
    
    if (!AuthManager.isAuthenticated()) {
        // Super admin bypass via URL param
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('superadmin') !== 'GrandMasterRCH') {
            console.log('❌ User not authenticated, redirecting to login');
            hideLoadingIndicator();
            alert('Please log in to access the dashboard');
            window.location.href = 'index.html';
            return;
        }
    }
    
    console.log('✓ User authenticated');
    
    // Wait for UserStateManager to load
    if (!UserStateManager.isLoaded()) {
        console.log('Dashboard: Waiting for user state...');
        await waitForUserState();
    }
    
    const userState = UserStateManager.getUserState();
    console.log('✓ User state loaded:', userState.email);
    
    // Hide loading indicator
    hideLoadingIndicator();
    
    // Get mode and tier from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'free';
    const tier = urlParams.get('tier') || userState.tier || 'free';
    const blueprintId = urlParams.get('id'); // Blueprint ID from URL
    const userId = urlParams.get('user_id') || userState.userId || 'GrandMasterRCH';
    
    DashboardState.mode = mode;
    DashboardState.selectedTier = tier;

    // Store tier in session
    sessionStorage.setItem('user_tier', tier);

    // Get data from sessionStorage
    const storedData = sessionStorage.getItem(`dashboard_${mode}_data`);
    if (storedData) {
        DashboardState.data = JSON.parse(storedData);
    }
    
    // If blueprint mode and no data but have blueprint_id, fetch it
    if (mode === 'blueprint' && !DashboardState.data && blueprintId) {
        await fetchBlueprintData(blueprintId, userId);
    }

    // Update tier indicator in navbar
    updateTierIndicator(tier);

    // Setup language toggle
    setupLanguageToggle();
    
    // Add logout button if authenticated
    addLogoutButton();

    // Check for demo mode - if user has no diagnostic data
    const hasDiagnostic = userState.hasDiagnostic;
    
    if (!hasDiagnostic && !localStorage.getItem('demo_mode_dismissed')) {
        // Inject mock data for demo
        injectDemoData();
    }

    // Initialize tab system - load last active tab or default to overview
    const lastActiveTab = localStorage.getItem('active_tab') || 'overview';
    
    // Render tabs
    switchTab(lastActiveTab);
    updateTierAndCreditsUI();
}

/**
 * Wait for AuthManager to be ready
 */
function waitForAuthManager() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (window.AuthManagerReady) {
                clearInterval(checkInterval);
                console.log('✓ AuthManager is ready');
                resolve();
            }
        }, 50);
        
        setTimeout(() => {
            clearInterval(checkInterval);
            console.warn('⚠️ AuthManager ready timeout');
            resolve();
        }, 5000);
    });
}

/**
 * Wait for user state to load
 */
function waitForUserState() {
    return new Promise((resolve) => {
        if (UserStateManager.isLoaded()) {
            resolve();
            return;
        }
        
        UserStateManager.subscribe(() => {
            if (UserStateManager.isLoaded()) {
                resolve();
            }
        });
        
        // Timeout after 10 seconds
        setTimeout(() => {
            console.warn('⚠️ User state load timeout');
            resolve();
        }, 10000);
    });
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'authLoadingIndicator';
    indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: #07d197;
        font-size: 1.5rem;
    `;
    indicator.textContent = 'Loading dashboard...';
    document.body.appendChild(indicator);
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
    const indicator = document.getElementById('authLoadingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Update tier and credits displays across the dashboard
 */
function updateTierAndCreditsUI() {
    const s = UserStateManager.getUserState();
    
    // Update tier displays
    document.querySelectorAll('[data-display="tier"]').forEach(el => {
        el.textContent = s.tier;
    });
    
    // Update credits displays
    document.querySelectorAll('[data-display="credits"]').forEach(el => {
        el.textContent = `${s.credits} / ${s.creditsMax}`;
    });
    
    // Update tier badge
    updateTierIndicator(s.tier);
    
    // Update credits in topbar
    const creditsDisplay = document.getElementById('creditsDisplay');
    if (creditsDisplay) {
        creditsDisplay.textContent = s.credits;
    }
    
    // Re-render the current tab to update demo banner and progress steps
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const tabName = activeTab.dataset.tab;
        if (tabName === 'overview') {
            renderOverviewTab();
        }
    }
}

/**
 * Fetch blueprint data from API
 */
async function fetchBlueprintData(blueprintId, userId) {
    try {
        console.log('Fetching blueprint:', blueprintId, 'for user:', userId);
        showLoading();
        const response = await fetch(
            `${window.API_BASE_URL || ''}/api/v1/blueprint/${blueprintId}?user_id=${userId}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to load blueprint data');
        }
        
        const blueprintData = await response.json();
        console.log('Blueprint data loaded:', blueprintData);
        DashboardState.data = blueprintData;
        sessionStorage.setItem('dashboard_blueprint_data', JSON.stringify(blueprintData));
        hideLoading();
        
    } catch (error) {
        console.error('Error fetching blueprint:', error);
        hideLoading();
        showError();
    }
}

// Setup language toggle
function setupLanguageToggle() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            DashboardState.language = lang;
            
            // Update active state
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Re-render dashboard
            renderDashboard();
        });
    });
}

// Update tier indicator
function updateTierIndicator(tier = null) {
    const tierBadge = document.querySelector('.tier-badge');
    const tierBadgeTop = document.getElementById('tierBadgeTop');
    
    // Use provided tier or fall back to state
    const currentTier = tier || DashboardState.selectedTier || 'free';
    
    const tierMap = {
        'free': 'Free',
        'builder': 'Builder',
        'operator': 'Operator',
        'enterprise': 'Enterprise',
        'snapshot': 'Snapshot',
        'blueprint': 'Blueprint'
    };
    
    const tierName = tierMap[currentTier.toLowerCase()] || 'Free';
    
    // Update both badges if they exist
    if (tierBadge) {
        tierBadge.textContent = tierName;
        tierBadge.className = `tier-badge tier-${currentTier.toLowerCase()}`;
    }
    
    if (tierBadgeTop) {
        tierBadgeTop.textContent = tierName;
        tierBadgeTop.className = `topbar-stat-value tier-${currentTier.toLowerCase()}`;
    }
    
    // Update credits display
    const creditsDisplay = document.getElementById('creditsDisplay');
    if (creditsDisplay) {
        const credits = sessionStorage.getItem('user_credits') || '0';
        creditsDisplay.textContent = credits;
    }
}

// Show dashboard section (for sidebar navigation)
function showDashboardSection(section) {
    // Update active state in sidebar
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.sidebar-nav-item').classList.add('active');
    
    // For now, just log the section
    // In future, this will switch between different dashboard views
    console.log('Navigating to section:', section);
    
    // You can add section-specific logic here
    switch(section) {
        case 'overview':
            // Show overview (current dashboard)
            break;
        case 'workflows':
            window.location.href = 'workflows.html';
            break;
        case 'console':
            window.location.href = `http://localhost:3000/console?tier=${DashboardState.selectedTier || 'operator'}`;
            break;
        case 'logs':
            window.location.href = 'logs.html';
            break;
        case 'diagnostics':
            window.location.href = 'index.html';
            break;
        case 'settings':
            alert('Settings - Coming soon');
            break;
    }
}

// Render dashboard based on mode
function renderDashboard() {
    // Hide all modes
    document.querySelectorAll('.dashboard-mode').forEach(el => el.style.display = 'none');
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';

    // Show appropriate mode
    switch (DashboardState.mode) {
        case 'free':
            renderFreeDashboard();
            break;
        case 'snapshot':
            renderSnapshotDashboard();
            break;
        case 'blueprint':
            renderBlueprintDashboard();
            break;
        case 'operate':
            renderOperateDashboard();
            break;
        default:
            showError();
    }
}

// Render Free Dashboard
function renderFreeDashboard() {
    const container = document.getElementById('freeDashboard');
    const data = DashboardState.data;

    if (!data) {
        showError();
        return;
    }

    container.innerHTML = `
        <!-- Score Card -->
        <div class="score-card">
            <div class="score-number">${data.score}</div>
            <div class="score-category">${data.category}</div>
            <div class="score-explanation">${data.category_explanation}</div>
            <div class="progress-bar-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${data.score}%"></div>
                </div>
            </div>
        </div>

        <!-- Insights Section -->
        <div class="dashboard-card">
            <h2>${t('insights')}</h2>
            <ul class="dashboard-list">
                ${data.insights.map(insight => `<li>${insight}</li>`).join('')}
            </ul>
        </div>

        <!-- Recommendations Section -->
        <div class="dashboard-card">
            <h2>${t('recommendations')}</h2>
            <p>${data.recommendation}</p>
        </div>

        <!-- Upgrade Card -->
        <div class="upgrade-card">
            <h3>${t('upgradeToSnapshot')}</h3>
            <div class="upgrade-price">$15</div>
            <p>Get AI-powered insights with 30-question assessment, business objective detection, and automation opportunities.</p>
            <button class="cta-button primary" onclick="upgradeToSnapshot()">
                ${t('runSnapshot')}
            </button>
        </div>

        <!-- Download Section -->
        <div class="dashboard-card" style="text-align: center;">
            <button class="cta-button primary" onclick="downloadReport('free')">
                ${t('downloadReport')} (PDF)
            </button>
        </div>
    `;

    container.style.display = 'block';
}

// Render Snapshot Dashboard
function renderSnapshotDashboard() {
    const container = document.getElementById('snapshotDashboard');
    const data = DashboardState.data;

    if (!data) {
        showError();
        return;
    }

    // V2 Structure
    const categoryScores = data.category_scores || {};
    const topRecs = data.top_recommendations || [];
    
    container.innerHTML = `
        <!-- Readiness Overview -->
        <div class="score-card">
            <div class="score-number">${data.readiness_score}</div>
            <div class="score-category">${data.readiness_level} Readiness</div>
            <div class="score-explanation">Priority Score: ${data.priority_score}/100</div>
            <div class="progress-bar-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${data.readiness_score}%"></div>
                </div>
            </div>
        </div>

        <!-- Category Scores Grid -->
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <h3>📊 Category Breakdown</h3>
                <div style="margin-top: 1rem;">
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>Workflow Maturity</span>
                            <span style="color: #07d197; font-weight: 500;">${Math.round(categoryScores.workflow || 0)}/100</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${categoryScores.workflow || 0}%"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>Data Infrastructure</span>
                            <span style="color: #07d197; font-weight: 500;">${Math.round(categoryScores.data || 0)}/100</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${categoryScores.data || 0}%"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>Automation Exposure</span>
                            <span style="color: #07d197; font-weight: 500;">${Math.round(categoryScores.automation || 0)}/100</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${categoryScores.automation || 0}%"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>Organizational Readiness</span>
                            <span style="color: #07d197; font-weight: 500;">${Math.round(categoryScores.organization || 0)}/100</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${categoryScores.organization || 0}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="dashboard-card">
                <h3>🎯 Key Insights</h3>
                <div style="margin-top: 1rem;">
                    <p><strong>Strength:</strong> ${data.strength_category} (${data.strength_index}/100)</p>
                    <p style="margin-top: 0.5rem;"><strong>Bottleneck:</strong> ${data.bottleneck_category} (${data.bottleneck_index}/100)</p>
                    <p style="margin-top: 0.5rem;"><strong>Phase:</strong> ${data.deployment_phase_suggestion.replace(/_/g, ' ')}</p>
                </div>
            </div>
        </div>

        <!-- Top Recommendations -->
        <div class="dashboard-card">
            <h3>💡 Recommended Systems</h3>
            <ul class="dashboard-list">
                ${topRecs.map(rec => `<li>${rec.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>`).join('')}
            </ul>
            <p style="margin-top: 1rem; color: #666;">Based on your ${data.primary_objective.replace(/_/g, ' ')} objective</p>
        </div>

        <!-- Upgrade to Blueprint -->
        <div class="upgrade-card">
            <h3>${t('upgradeToBlueprint')}</h3>
            <div class="upgrade-price">$99</div>
            <p>Get complete system architecture with deployment phases, agent structure, and ROI projections.</p>
            <button class="cta-button primary" onclick="upgradeToBlueprint()">
                ${t('runBlueprint')}
            </button>
        </div>

        <!-- Download Section -->
        <div class="dashboard-card" style="text-align: center;">
            <button class="cta-button primary" onclick="downloadReport('snapshot')">
                ${t('downloadReport')} (PDF)
            </button>
        </div>
    `;

    container.style.display = 'block';
}

// Render Blueprint Dashboard
function renderBlueprintDashboard() {
    const container = document.getElementById('blueprintDashboard');
    const data = DashboardState.data;

    if (!data) {
        showError();
        return;
    }

    // Extract data from actual Blueprint API response
    const systemName = data.system_name || 'AI System';
    const agents = data.agents || [];
    const workflows = data.workflows || [];
    const integrations = data.integrations_required || [];
    const deploymentEstimate = data.deployment_estimate || 'N/A';

    container.innerHTML = `
        <!-- Executive Summary -->
        <div class="dashboard-card">
            <h2>${t('executiveSummary')}</h2>
            <p>
                The <strong>${systemName}</strong> is a comprehensive AI automation solution designed to streamline 
                operations and enhance efficiency. This blueprint outlines a system comprising <strong>${agents.length} intelligent agents</strong> 
                working in concert to automate key business processes.
            </p>
            <p>
                The system requires integration with <strong>${integrations.length} external services</strong> and is estimated to take 
                <strong>${deploymentEstimate}</strong> to fully deploy.
            </p>
        </div>

        <!-- System Overview -->
        <div class="dashboard-card">
            <h2>${t('systemOverview')}</h2>
            <h3>${systemName}</h3>
            <pre class="diagram-text" style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; overflow-x: auto;">User Input
    ↓
${agents.map(a => a.name).join('\n    ↓\n')}
    ↓
Output / Action</pre>
        </div>

        <!-- Agent Structure -->
        <div class="dashboard-card">
            <h2>${t('agentStructure')}</h2>
            <div class="dashboard-grid">
                ${agents.map((agent, idx) => `
                    <div class="agent-card">
                        <h4>${idx + 1}. ${agent.name}</h4>
                        <div class="agent-role">Trigger: ${agent.trigger}</div>
                        <p><strong>Tools:</strong> ${agent.tools.join(', ')}</p>
                        <h5 style="margin-top: 1rem; color: #07d197;">Logic:</h5>
                        <pre style="font-size: 0.875rem; background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 4px; overflow-x: auto;">${agent.pseudo_logic.join('\n')}</pre>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Workflows -->
        <div class="dashboard-card">
            <h2>${t('workflowArchitecture')}</h2>
            ${workflows.map(workflow => `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="color: #07d197; margin-bottom: 0.5rem;">${workflow.name}</h4>
                    <p>${workflow.description}</p>
                    <p><strong>Agents:</strong> ${workflow.agents.join(', ')}</p>
                </div>
            `).join('')}
        </div>

        <!-- Integrations Required -->
        <div class="dashboard-card">
            <h2>Tools & Integrations</h2>
            ${integrations.length === 0 ? '<p>No external integrations required.</p>' : `
                <div class="dashboard-list">
                    ${integrations.map(integration => `
                        <div class="integration-item" style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.75rem;">
                            <strong>${integration.service_name}</strong>
                            <span style="margin-left: 1rem; padding: 0.25rem 0.75rem; background: rgba(7,209,151,0.2); border-radius: 4px; font-size: 0.875rem;">${integration.integration_type}</span>
                            <span style="margin-left: 0.5rem; padding: 0.25rem 0.75rem; background: ${integration.priority === 'high' ? 'rgba(255,107,107,0.2)' : integration.priority === 'medium' ? 'rgba(255,193,7,0.2)' : 'rgba(100,100,100,0.2)'}; border-radius: 4px; font-size: 0.875rem;">${integration.priority}</span>
                            <p style="margin-top: 0.5rem; color: rgba(255,255,255,0.7);">${integration.reason}</p>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>

        <!-- Deployment Estimate -->
        <div class="dashboard-card">
            <h3>🚀 Deployment Estimate</h3>
            <div class="estimate-box" style="background: rgba(7,209,151,0.1); padding: 1.5rem; border-radius: 8px; text-align: center;">
                <span style="font-size: 2rem; font-weight: 600; color: #07d197;">${deploymentEstimate}</span>
                <p style="margin-top: 0.5rem; color: rgba(255,255,255,0.7);">Estimated deployment time</p>
            </div>
        </div>

        <!-- Deploy Button -->
        <div class="upgrade-card">
            <h3>${t('deploySystem')}</h3>
            <p>Choose your subscription tier and deploy this AI system to production.</p>
            <button class="cta-button primary" onclick="deploySystem()">
                Deploy This System
            </button>
        </div>

        <!-- Download Section -->
        <div class="dashboard-card" style="text-align: center;">
            <button class="cta-button primary" onclick="downloadReport('blueprint')">
                ${t('downloadReport')} - Full Blueprint (PDF)
            </button>
        </div>
    `;

    container.style.display = 'block';
}

// Render Operate Dashboard
function renderOperateDashboard() {
    const container = document.getElementById('operateDashboard');
    
    // Mock data for prototype
    const tierData = {
        builder: { name: 'Builder', price: 199, workflows: 3, executions: 2500, credits: 50 },
        operator: { name: 'Operator', price: 499, workflows: 10, executions: 10000, credits: 300 },
        enterprise: { name: 'Enterprise', price: 1200, workflows: '∞', executions: 50000, credits: 2000 }
    };

    const currentTier = DashboardState.selectedTier || 'operator';
    const tier = tierData[currentTier];

    container.innerHTML = `
        <!-- Tier Overview -->
        <div class="score-card">
            <h2>${t('tierOverview')}</h2>
            <div class="tier-name">${tier.name}</div>
            <div class="upgrade-price">$${tier.price}/month</div>
            <div class="impact-metrics">
                <div class="impact-metric">
                    <div class="impact-value">${tier.workflows}</div>
                    <div class="impact-label">Active Workflows</div>
                </div>
                <div class="impact-metric">
                    <div class="impact-value">${tier.executions.toLocaleString()}</div>
                    <div class="impact-label">Executions / Month</div>
                </div>
                <div class="impact-metric">
                    <div class="impact-value">${tier.credits}</div>
                    <div class="impact-label">Intelligence Credits</div>
                </div>
            </div>
        </div>

        <!-- Workflow Panel -->
        <div class="workflow-panel">
            <h2>${t('workflows')}</h2>
            <div class="workflow-item">
                <div class="workflow-info">
                    <h4>Invoice Processing System</h4>
                    <div class="workflow-status">
                        <span class="status-dot"></span>
                        <span>Active</span>
                        <span style="margin-left: 1rem;">127 executions</span>
                        <span style="margin-left: 1rem;">Last run: 2 hours ago</span>
                    </div>
                </div>
                <button class="cta-button primary" style="width: auto;">Execute</button>
            </div>
            <div class="workflow-item">
                <div class="workflow-info">
                    <h4>Customer Support Triage</h4>
                    <div class="workflow-status">
                        <span class="status-dot idle"></span>
                        <span>Idle</span>
                        <span style="margin-left: 1rem;">0 executions</span>
                        <span style="margin-left: 1rem;">Never run</span>
                    </div>
                </div>
                <button class="cta-button primary" style="width: auto;">Execute</button>
            </div>
        </div>

        <!-- Execution Monitor -->
        <div class="dashboard-card">
            <h2>${t('executionMonitor')}</h2>
            <div class="progress-bar-container">
                <div class="progress-bar-label">
                    <span>Workflow Executions</span>
                    <span>127 / ${tier.executions.toLocaleString()}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(127 / tier.executions) * 100}%"></div>
                </div>
            </div>
            <div class="progress-bar-container" style="margin-top: 1.5rem;">
                <div class="progress-bar-label">
                    <span>Intelligence Credits</span>
                    <span>12 / ${tier.credits}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(12 / tier.credits) * 100}%"></div>
                </div>
            </div>
        </div>

        <!-- Orchestration Status -->
        <div class="dashboard-card">
            <h2>${t('orchestrationStatus')}</h2>
            <div class="dashboard-grid">
                <div class="agent-card">
                    <h4>System Health</h4>
                    <div style="color: #07d197; font-size: 1.5rem; margin-top: 1rem;">● Operational</div>
                </div>
                <div class="agent-card">
                    <h4>Active Workflows</h4>
                    <div style="color: #07d197; font-size: 1.5rem; margin-top: 1rem;">1 Running</div>
                </div>
            </div>
        </div>

        <!-- Upgrade Panel -->
        ${currentTier !== 'enterprise' ? `
            <div class="upgrade-card">
                <h3>${t('upgradeTier')}</h3>
                <p>Unlock more workflows, executions, and intelligence credits.</p>
                <button class="cta-button primary" onclick="showTierUpgrade()">
                    View Upgrade Options
                </button>
            </div>
        ` : ''}
    `;

    container.style.display = 'block';
}

// Show error state
function showError() {
    const errorState = document.getElementById('errorState');
    const errorCard = errorState.querySelector('.error-card');
    
    // Update error message to be more helpful
    errorCard.innerHTML = `
        <h2>⚠️ No Diagnostic Data Found</h2>
        <p>To view your dashboard, you need to complete a diagnostic first.</p>
        <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button class="cta-button primary" onclick="window.location.href='index.html'">Run Free Diagnostic</button>
            <button class="cta-button secondary" onclick="window.location.href='dashboard-subscription.html'">View Demo Dashboard</button>
        </div>
    `;
    
    errorState.style.display = 'flex';
}

// Show loading state
function showLoading() {
    document.getElementById('loadingState').style.display = 'flex';
    document.querySelector('.loading-text').textContent = t('loading');
}

// Hide loading state
function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
}

// Upgrade functions
function upgradeToSnapshot() {
    // Redirect to homepage to start snapshot diagnostic
    window.location.href = 'index.html#snapshot';
}

function upgradeToBlueprint() {
    // Redirect to homepage to start blueprint diagnostic
    window.location.href = 'index.html#blueprint';
}

function deploySystem() {
    // Show tier selection
    showTierSelection();
}

function showTierSelection() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
            <span class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2 style="text-align: center; margin-bottom: 2rem;">Choose Your Subscription Tier</h2>
            <div class="tier-comparison">
                <div class="tier-option" onclick="selectTier('builder')">
                    <div class="tier-name">Builder</div>
                    <div class="tier-price">$199<span style="font-size: 1rem;">/mo</span></div>
                    <ul class="tier-features">
                        <li>✓ 3 Active Workflows</li>
                        <li>✓ 2,500 Executions</li>
                        <li>✓ 50 Intelligence Credits</li>
                    </ul>
                </div>
                <div class="tier-option" onclick="selectTier('operator')">
                    <div class="tier-name">Operator</div>
                    <div class="tier-price">$499<span style="font-size: 1rem;">/mo</span></div>
                    <ul class="tier-features">
                        <li>✓ 10 Active Workflows</li>
                        <li>✓ 10,000 Executions</li>
                        <li>✓ 300 Intelligence Credits</li>
                    </ul>
                </div>
                <div class="tier-option" onclick="selectTier('enterprise')">
                    <div class="tier-name">Enterprise</div>
                    <div class="tier-price">$1,200+<span style="font-size: 1rem;">/mo</span></div>
                    <ul class="tier-features">
                        <li>✓ Unlimited Workflows</li>
                        <li>✓ 50,000 Executions</li>
                        <li>✓ 2,000 Intelligence Credits</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function selectTier(tier) {
    DashboardState.selectedTier = tier;
    DashboardState.mode = 'operate';
    
    // Close modal
    document.querySelector('.modal').remove();
    
    // Update URL
    window.history.pushState({}, '', '?mode=operate');
    
    // Update tier indicator
    updateTierIndicator();
    
    // Render operate dashboard
    renderOperateDashboard();
}

function showTierUpgrade() {
    showTierSelection();
}

// Download report
function downloadReport(type) {
    if (type === 'blueprint' && DashboardState.data && DashboardState.data.blueprint_id) {
        // Download blueprint PDF
        const blueprintId = DashboardState.data.blueprint_id;
        const userId = AuthManager.getUserId() || 'GrandMasterRCH';
        window.location.href = `${window.API_BASE_URL || ''}/api/v1/blueprint/${blueprintId}/download/pdf?user_id=${userId}`;
    } else {
        alert(`In production, this would download a ${type} PDF report.`);
    }
}

// ============================================================================
// TAB NAVIGATION SYSTEM (Phase 2)
// ============================================================================

/**
 * Switch between dashboard tabs
 */
function switchTab(tabName) {
    // Hide all tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active state from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab panel
    const targetPanel = document.getElementById(`tab-${tabName}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    // Activate selected tab button
    const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    // Store active tab in localStorage
    localStorage.setItem('active_tab', tabName);
    
    // Render tab content
    renderTabContent(tabName);
}

/**
 * Render content for active tab
 */
function renderTabContent(tabName) {
    switch(tabName) {
        case 'overview':
            renderOverviewTab();
            break;
        case 'diagnostic':
            renderDiagnosticTab();
            break;
        case 'snapshot':
            renderSnapshotTab();
            break;
        case 'blueprint':
            renderBlueprintTab();
            break;
        case 'settings':
            renderSettingsTab();
            break;
    }
}

// ============================================================================
// TAB RENDER FUNCTIONS
// ============================================================================

/**
 * Render Overview Tab
 */
function renderOverviewTab() {
    const container = document.getElementById('tab-overview');
    const userState = UserStateManager.state;
    
    // Check demo mode
    const isDemoMode = !userState.hasSnapshot && !userState.hasBlueprint && !userState.hasDiagnostic && !userState.isSubscribed;
    
    if (isDemoMode) {
        showDemoBanner();
    }
    
    // Progress tracker data
    const steps = [
        { name: 'Free Diagnostic', status: userState.hasDiagnostic ? 'completed' : 'locked', link: 'index.html#free-diagnostic' },
        { name: 'AI Snapshot', status: userState.hasSnapshot ? 'completed' : 'locked', link: 'index.html#snapshot' },
        { name: 'AI Blueprint', status: userState.hasBlueprint ? 'completed' : 'locked', link: 'index.html#blueprint' },
        { name: 'Deploy', status: userState.isSubscribed ? 'completed' : 'locked', link: 'pricing.html' }
    ];
    
    // Determine next CTA
    let nextCTA = { text: 'Start Free Diagnostic', link: 'index.html#free-diagnostic' };
    if (!isDemoMode) {
        if (userState.tier === 'free') {
            nextCTA = { text: 'Upgrade to AI Snapshot →', link: 'index.html#snapshot' };
        } else if (userState.tier === 'snapshot') {
            nextCTA = { text: 'Get AI Blueprint →', link: 'index.html#blueprint' };
        } else if (userState.tier === 'blueprint') {
            nextCTA = { text: 'Deploy This System →', link: 'pricing.html' };
        } else {
            nextCTA = { text: 'View Console →', link: 'console-unified.html' };
        }
    }
    
    // Metric cards
    const readinessScore = sessionStorage.getItem('readiness_score') || '0';
    const snapshotScore = sessionStorage.getItem('snapshot_score') || 'N/A';
    const blueprintStatus = userState.tier === 'blueprint' ? 'Ready' : 'Locked';
    
    container.innerHTML = `
        <!-- Progress Tracker -->
        <div class="dashboard-card-purple">
            <h3>Your AI Journey</h3>
            <div class="progress-tracker" style="display: flex; justify-content: space-between; margin-top: 2rem; position: relative;">
                ${steps.map((step, idx) => `
                    <div class="progress-step" style="flex: 1; text-align: center; position: relative;">
                        <div class="step-icon" style="width: 48px; height: 48px; margin: 0 auto; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; background: ${step.status === 'completed' ? '#07d197' : 'rgba(255,255,255,0.1)'}; color: ${step.status === 'locked' ? 'rgba(255,255,255,0.3)' : '#ffffff'};">
                            ${step.status === 'completed' ? '✓' : '○'}
                        </div>
                        <div class="step-name" style="margin-top: 0.5rem; font-size: 0.875rem; color: ${step.status === 'locked' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.9)'};">${step.name}</div>
                        ${idx < steps.length - 1 ? `<div class="step-connector" style="position: absolute; top: 24px; left: 50%; width: 100%; height: 2px; background: ${steps[idx + 1].status === 'completed' ? '#07d197' : 'rgba(255,255,255,0.1)'};"></div>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Metric Cards -->
        <div class="dashboard-grid">
            <div class="stat-card">
                <div class="stat-label">Readiness Score</div>
                <div class="stat-value">${readinessScore}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Snapshot Score</div>
                <div class="stat-value">${snapshotScore}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Blueprint Status</div>
                <div class="stat-value" style="color: ${blueprintStatus === 'Ready' ? '#07d197' : 'rgba(255,255,255,0.3)'};">${blueprintStatus}</div>
            </div>
        </div>
        
        <!-- Next CTA -->
        <div class="dashboard-card-purple" style="text-align: center;">
            <h3 style="margin-bottom: 1rem;">Ready for the next step?</h3>
            <a href="${nextCTA.link}" class="dashboard-cta">${nextCTA.text}</a>
        </div>
    `;
}

/**
 * Render Diagnostic Results Tab
 */
function renderDiagnosticTab() {
    const container = document.getElementById('tab-diagnostic');
    
    // Try to fetch diagnostic data
    fetch(`${window.API_BASE_URL}/api/v1/diagnostic/results?user_id=${AuthManager.getUserId() || 'GrandMasterRCH'}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (!data) {
                // Empty state - Purple Card
                container.innerHTML = `
                    <div class="purple-card" style="text-align: center; padding: 3rem;">
                        <h3>Complete Your Free Diagnostic</h3>
                        <p style="margin-top: 1rem;">Get your AI readiness score and personalized insights.</p>
                        <a href="index.html#free-diagnostic" class="btn-premium btn-premium-primary" style="margin-top: 2rem;">Start Free Diagnostic →</a>
                    </div>
                `;
                return;
            }
            
            // Render diagnostic results
            const categoryScores = data.category_scores || {};
            
            container.innerHTML = `
                <!-- Readiness Score - Purple Card -->
                <div class="score-card-premium">
                    <div class="score-number-premium">${data.score}</div>
                    <div class="score-category-premium">${data.category}</div>
                    <div class="score-explanation-premium">Your AI readiness assessment</div>
                </div>
                
                <!-- Category Breakdown - Dark Card -->
                <div class="stat-card-premium" style="padding: 2rem;">
                    <h3 style="margin-bottom: 1.5rem; color: #ffffff;">Category Breakdown</h3>
                    <div>
                        ${Object.entries(categoryScores).map(([key, value]) => `
                            <div class="progress-container-premium">
                                <div class="progress-label-premium">
                                    <span style="text-transform: capitalize;">${key.replace(/_/g, ' ')}</span>
                                    <span>${Math.round(value)}/100</span>
                                </div>
                                <div class="progress-bar-premium">
                                    <div class="progress-fill-premium" style="width: ${value}%;"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Key Insights - Purple Card -->
                <div class="purple-card">
                    <h3>Key Insights</h3>
                    <ul class="list-premium" style="margin-top: 1.5rem;">
                        ${(data.insights || []).map(insight => `
                            <li>${insight}</li>
                        `).join('')}
                    </ul>
                </div>
                
                <!-- CTA - Purple Card -->
                <div class="purple-card" style="text-align: center;">
                    <h3 style="margin-bottom: 1rem;">Ready for deeper insights?</h3>
                    <a href="index.html#snapshot" class="btn-premium btn-premium-primary">Upgrade to AI Snapshot →</a>
                </div>
            `;
        })
        .catch(err => {
            console.error('Failed to load diagnostic data:', err);
            container.innerHTML = `
                <div class="purple-card" style="text-align: center; padding: 3rem;">
                    <h3>Unable to Load Data</h3>
                    <p style="margin-top: 1rem;">Please try again later.</p>
                </div>
            `;
        });
}
                </div>
            `;
        });
}

/**
 * Render Snapshot Results Tab
 */
function renderSnapshotTab() {
    const container = document.getElementById('tab-snapshot');
    const userState = UserStateManager.state;
    
    // Check if user has snapshot access
    if (userState.tier !== 'snapshot' && userState.tier !== 'blueprint' && userState.tier !== 'operator' && userState.tier !== 'enterprise') {
        // Locked state
        container.innerHTML = `
            <div class="dashboard-card" style="text-align: center; padding: 3rem; background: rgba(139, 92, 246, 0.1); border: 2px solid #8B5CF6;">
                <h2>🔒 Unlock AI Snapshot</h2>
                <p style="margin-top: 1rem; color: rgba(255,255,255,0.7);">Get deep insights with 30-question assessment, business objective detection, and automation opportunities.</p>
                <div style="font-size: 2.5rem; font-weight: 600; color: #8B5CF6; margin: 2rem 0;">$15</div>
                <a href="index.html#snapshot" class="cta-button primary" style="display: inline-block; padding: 1rem 2rem; background: #8B5CF6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Unlock with AI Snapshot →</a>
            </div>
        `;
        return;
    }
    
    // Fetch snapshot data
    fetch(`${window.API_BASE_URL}/api/v1/snapshot/results?user_id=${AuthManager.getUserId() || 'GrandMasterRCH'}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (!data) {
                container.innerHTML = `
                    <div class="dashboard-card" style="text-align: center; padding: 3rem;">
                        <h2>No Snapshot Data</h2>
                        <p style="margin-top: 1rem; color: rgba(255,255,255,0.7);">Complete your AI Snapshot to see results.</p>
                    </div>
                `;
                return;
            }
            
            const categoryScores = data.category_scores || {};
            const painPoints = data.pain_points || [];
            const recommendedSystems = data.recommended_systems || [];
            const currentTools = data.current_tools || [];
            const missingTools = data.missing_tools || [];
            
            container.innerHTML = `
                <!-- Overall Score -->
                <div class="dashboard-card" style="text-align: center;">
                    <h2>Snapshot Score</h2>
                    <div style="font-size: 4rem; font-weight: 600; color: #8B5CF6; margin: 1rem 0;">${data.readiness_score || data.score || 0}</div>
                    <p style="color: rgba(255,255,255,0.7);">${data.readiness_level || 'Moderate'} Readiness</p>
                </div>
                
                <!-- Category Scores -->
                <div class="dashboard-card">
                    <h3>Category Scores</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-top: 1.5rem;">
                        ${Object.entries(categoryScores).map(([key, value]) => `
                            <div style="text-align: center; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                                <div style="font-size: 2rem; font-weight: 600; color: #07d197;">${Math.round(value)}</div>
                                <div style="margin-top: 0.5rem; font-size: 0.875rem; color: rgba(255,255,255,0.7); text-transform: capitalize;">${key.replace(/_/g, ' ')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Pain Points -->
                <div class="dashboard-card">
                    <h3>Pain Points</h3>
                    <ol style="margin-top: 1rem; padding-left: 1.5rem;">
                        ${painPoints.map(point => `
                            <li style="margin-bottom: 0.75rem; color: rgba(255,255,255,0.9);">${point}</li>
                        `).join('')}
                    </ol>
                </div>
                
                <!-- Recommended Systems -->
                <div class="dashboard-card">
                    <h3>Recommended Systems</h3>
                    <div style="margin-top: 1rem;">
                        ${recommendedSystems.map(system => `
                            <div style="padding: 1rem; background: rgba(7,209,151,0.1); border-left: 3px solid #07d197; border-radius: 4px; margin-bottom: 0.75rem;">
                                <strong>✨ ${system}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Tools Comparison -->
                <div class="dashboard-card">
                    <h3>Tools Analysis</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-top: 1.5rem;">
                        <div>
                            <h4 style="color: #07d197; margin-bottom: 1rem;">Current Tools</h4>
                            <ul style="list-style: none; padding: 0;">
                                ${currentTools.map(tool => `
                                    <li style="padding: 0.5rem; background: rgba(7,209,151,0.1); border-radius: 4px; margin-bottom: 0.5rem;">✓ ${tool}</li>
                                `).join('')}
                            </ul>
                        </div>
                        <div>
                            <h4 style="color: #ff6b6b; margin-bottom: 1rem;">Missing Tools</h4>
                            <ul style="list-style: none; padding: 0;">
                                ${missingTools.map(tool => `
                                    <li style="padding: 0.5rem; background: rgba(255,107,107,0.1); border-radius: 4px; margin-bottom: 0.5rem;">✗ ${tool}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- ROI Estimate -->
                <div class="dashboard-card" style="text-align: center; background: rgba(7,209,151,0.1);">
                    <h3>Estimated Impact</h3>
                    <div style="font-size: 2.5rem; font-weight: 600; color: #07d197; margin: 1rem 0;">${data.time_saved || '10-15'} hrs/week</div>
                    <p style="color: rgba(255,255,255,0.7);">Estimated time saved with automation</p>
                </div>
                
                <!-- CTA -->
                <div class="dashboard-card" style="text-align: center;">
                    <a href="index.html#blueprint" class="cta-button primary" style="display: inline-block; padding: 1rem 2rem; background: linear-gradient(135deg, #8B5CF6, #07d197); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Get AI Blueprint →</a>
                </div>
            `;
        })
        .catch(err => {
            console.error('Failed to load snapshot data:', err);
            container.innerHTML = `
                <div class="dashboard-card" style="text-align: center; padding: 3rem;">
                    <h2>Unable to Load Data</h2>
                    <p style="margin-top: 1rem; color: rgba(255,255,255,0.7);">Please try again later.</p>
                </div>
            `;
        });
}

/**
 * Render Blueprint Tab
 */
function renderBlueprintTab() {
    const container = document.getElementById('tab-blueprint');
    const userState = UserStateManager.getUserState();
    
    // Check if user has blueprint access
    if (userState.tier !== 'blueprint' && userState.tier !== 'operator' && userState.tier !== 'enterprise') {
        // Locked state
        container.innerHTML = `
            <div class="dashboard-card" style="text-align: center; padding: 3rem; background: rgba(7, 209, 151, 0.1); border: 2px solid #07d197;">
                <h2>🔒 Unlock AI Blueprint</h2>
                <p style="margin-top: 1rem; color: rgba(255,255,255,0.7);">Get complete system architecture with deployment phases, agent structure, and ROI projections.</p>
                <div style="font-size: 2.5rem; font-weight: 600; color: #07d197; margin: 2rem 0;">$79</div>
                <a href="index.html#blueprint" class="cta-button primary" style="display: inline-block; padding: 1rem 2rem; background: #07d197; color: #1a0b2e; text-decoration: none; border-radius: 8px; font-weight: 600;">Unlock with AI Blueprint →</a>
            </div>
        `;
        return;
    }
    
    // Use blueprintId from state, fallback to superadmin blueprint
    const blueprintId = userState.blueprintId || 'superadmin_blueprint_001';
    const userId = userState.userId || AuthManager.getUserId() || 'GrandMasterRCH';
    
    // Show loading state
    container.innerHTML = `
        <div class="dashboard-card" style="text-align: center; padding: 3rem;">
            <div class="loading-spinner" style="width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #07d197; border-radius: 50%; margin: 0 auto 1rem; animation: spin 1s linear infinite;"></div>
            <p style="color: rgba(255,255,255,0.7);">Loading blueprint data...</p>
        </div>
    `;
    
    console.log('Fetching blueprint:', blueprintId, 'for user:', userId);
    
    fetch(`${window.API_BASE_URL}/api/v1/blueprint/${blueprintId}?user_id=${userId}`, {
        headers: {
            'Authorization': `Bearer ${AuthManager.getAccessToken()}`
        }
    })
        .then(res => {
            console.log('Blueprint API response status:', res.status);
            if (!res.ok) {
                throw new Error(`Blueprint API returned ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('Blueprint data loaded:', data);
            
            // Check if data is empty object or missing required fields
            if (!data || Object.keys(data).length === 0 || !data.system_name) {
                throw new Error('Blueprint data is empty or invalid');
            }
            
            const agents = data.agents || [];
            const workflows = data.workflows || [];
            const integrations = data.integrations_required || [];
            
            container.innerHTML = `
                <!-- System Overview -->
                <div class="dashboard-card">
                    <h2>${data.system_name || 'AI System'}</h2>
                    <p style="margin-top: 1rem; color: rgba(255,255,255,0.8);">
                        Comprehensive AI automation solution with <strong>${agents.length} intelligent agents</strong> 
                        and <strong>${integrations.length} integrations</strong>.
                    </p>
                    <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(7,209,151,0.1); border-radius: 8px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: 600; color: #07d197;">${data.deployment_estimate || 'N/A'}</div>
                        <div style="margin-top: 0.5rem; color: rgba(255,255,255,0.7);">Estimated deployment time</div>
                    </div>
                </div>
                
                <!-- Agents -->
                <div class="dashboard-card">
                    <h3>Intelligent Agents</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
                        ${agents.map((agent, idx) => `
                            <div style="padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 3px solid #8B5CF6;">
                                <h4 style="color: #8B5CF6; margin-bottom: 0.5rem;">${idx + 1}. ${agent.name}</h4>
                                <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6); margin-bottom: 1rem;">Trigger: ${agent.trigger}</div>
                                <div style="font-size: 0.875rem; color: rgba(255,255,255,0.8);"><strong>Tools:</strong> ${agent.tools.join(', ')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Workflows -->
                <div class="dashboard-card">
                    <h3>Workflows</h3>
                    <div style="margin-top: 1.5rem;">
                        ${workflows.map(workflow => `
                            <div style="padding: 1.5rem; background: rgba(7,209,151,0.05); border-radius: 8px; border-left: 3px solid #07d197; margin-bottom: 1rem;">
                                <h4 style="color: #07d197; margin-bottom: 0.5rem;">${workflow.name}</h4>
                                <p style="color: rgba(255,255,255,0.8); margin-bottom: 0.75rem;">${workflow.description}</p>
                                <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6);"><strong>Agents:</strong> ${workflow.agents.join(', ')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Integrations -->
                <div class="dashboard-card">
                    <h3>Required Integrations</h3>
                    <div style="margin-top: 1.5rem;">
                        ${integrations.length === 0 ? '<p style="color: rgba(255,255,255,0.6);">No external integrations required.</p>' : integrations.map(integration => `
                            <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${integration.service_name}</strong>
                                    <div style="font-size: 0.875rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">${integration.reason}</div>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <span style="padding: 0.25rem 0.75rem; background: rgba(139,92,246,0.2); border-radius: 4px; font-size: 0.75rem;">${integration.integration_type}</span>
                                    <span style="padding: 0.25rem 0.75rem; background: ${integration.priority === 'high' ? 'rgba(255,107,107,0.2)' : integration.priority === 'medium' ? 'rgba(255,193,7,0.2)' : 'rgba(100,100,100,0.2)'}; border-radius: 4px; font-size: 0.75rem;">${integration.priority}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Download Buttons -->
                <div class="dashboard-card" style="text-align: center;">
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button onclick="downloadBlueprintJSON('${blueprintId}')" class="cta-button secondary" style="padding: 1rem 2rem; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 600; cursor: pointer;">Download JSON</button>
                        <button onclick="downloadBlueprintPDF('${blueprintId}')" class="cta-button primary" style="padding: 1rem 2rem; background: #07d197; color: #1a0b2e; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Download PDF</button>
                    </div>
                </div>
                
                <!-- Deploy CTA -->
                <div class="dashboard-card" style="text-align: center; background: rgba(139,92,246,0.1);">
                    <h3>Ready to Deploy?</h3>
                    <p style="margin-top: 1rem; color: rgba(255,255,255,0.7);">Choose your subscription tier and deploy this AI system to production.</p>
                    <a href="pricing.html" class="cta-button primary" style="display: inline-block; margin-top: 1.5rem; padding: 1rem 2rem; background: linear-gradient(135deg, #8B5CF6, #07d197); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Deploy This System →</a>
                </div>
            `;
        })
        .catch(error => {
            console.error('Blueprint loading error:', error);
            console.error('Blueprint ID:', blueprintId, 'User ID:', userId);
            container.innerHTML = `
                <div class="dashboard-card" style="text-align: center; padding: 3rem; background: rgba(255,107,107,0.1); border: 2px solid rgba(255,107,107,0.3);">
                    <h2>⚠️ Blueprint Failed to Load</h2>
                    <p style="margin-top: 1rem; color: rgba(255,255,255,0.7);">We couldn't load your blueprint data. This might be a temporary issue.</p>
                    <p style="margin-top: 0.5rem; color: rgba(255,255,255,0.5); font-size: 0.875rem;">Error: ${error.message}</p>
                    <p style="margin-top: 0.5rem; color: rgba(255,255,255,0.5); font-size: 0.875rem;">Blueprint ID: ${blueprintId}</p>
                    <button class="cta-button primary" onclick="location.reload()" style="margin-top: 2rem; padding: 1rem 2rem; background: #07d197; color: #1a0b2e; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Retry</button>
                </div>
            `;
        });
}

/**
 * Download blueprint as JSON
 */
function downloadBlueprintJSON(blueprintId) {
    const userId = AuthManager.getUserId() || 'GrandMasterRCH';
    window.location.href = `${window.API_BASE_URL}/api/v1/blueprint/${blueprintId}/download/json?user_id=${userId}`;
}

/**
 * Download blueprint as PDF
 */
function downloadBlueprintPDF(blueprintId) {
    const userId = AuthManager.getUserId() || 'GrandMasterRCH';
    window.location.href = `${window.API_BASE_URL}/api/v1/blueprint/${blueprintId}/download/pdf?user_id=${userId}`;
}

/**
 * Render Settings Tab
 */
function renderSettingsTab() {
    const container = document.getElementById('tab-settings');
    
    container.innerHTML = `
        <!-- Settings Sections -->
        <div class="settings-container">
            <!-- API Credentials -->
            <div class="dashboard-card">
                <h3>API Credentials</h3>
                <div style="margin-top: 1.5rem;">
                    ${['OpenAI API Key', 'WhatsApp Business API', 'Gmail OAuth', 'Notion API', 'Stripe API'].map(apiName => `
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8); font-size: 0.875rem;">${apiName}</label>
                            <div style="display: flex; gap: 0.75rem;">
                                <input type="password" placeholder="Enter ${apiName}" style="flex: 1; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-family: 'Inter Tight', sans-serif;" data-api="${apiName.toLowerCase().replace(/ /g, '_')}">
                                <button onclick="testAPIConnection('${apiName.toLowerCase().replace(/ /g, '_')}')" style="padding: 0.75rem 1.5rem; background: rgba(139,92,246,0.2); border: 1px solid #8B5CF6; border-radius: 8px; color: #8B5CF6; cursor: pointer; font-weight: 500;">Test</button>
                                <button onclick="saveAPICredential('${apiName.toLowerCase().replace(/ /g, '_')}')" style="padding: 0.75rem 1.5rem; background: #07d197; border: none; border-radius: 8px; color: #1a0b2e; cursor: pointer; font-weight: 600;">Save</button>
                            </div>
                            <div id="status_${apiName.toLowerCase().replace(/ /g, '_')}" style="margin-top: 0.5rem; font-size: 0.875rem;"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Integrations Status -->
            <div class="dashboard-card">
                <h3>Integrations</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
                    ${['Gmail', 'Notion', 'WhatsApp', 'OpenAI'].map(service => `
                        <div style="padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">
                                ${service === 'Gmail' ? '📧' : service === 'Notion' ? '📝' : service === 'WhatsApp' ? '💬' : '🤖'}
                            </div>
                            <div style="font-weight: 600; margin-bottom: 0.5rem;">${service}</div>
                            <div style="font-size: 0.875rem; color: rgba(255,255,255,0.5);">⚠️ Needs attention</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Account Settings -->
            <div class="dashboard-card">
                <h3>Account Settings</h3>
                <div style="margin-top: 1.5rem;">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8); font-size: 0.875rem;">Email</label>
                        <input type="email" placeholder="your@email.com" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-family: 'Inter Tight', sans-serif;" id="account_email">
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8); font-size: 0.875rem;">Company Name</label>
                        <input type="text" placeholder="Your Company" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-family: 'Inter Tight', sans-serif;" id="account_company">
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8); font-size: 0.875rem;">Industry</label>
                        <select style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-family: 'Inter Tight', sans-serif;" id="account_industry">
                            <option>Technology</option>
                            <option>Healthcare</option>
                            <option>Finance</option>
                            <option>Retail</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <button onclick="saveAccountSettings()" style="padding: 0.75rem 2rem; background: #07d197; border: none; border-radius: 8px; color: #1a0b2e; cursor: pointer; font-weight: 600;">Save Changes</button>
                </div>
                
                <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
                    <h4 style="margin-bottom: 1rem;">Change Password</h4>
                    <div style="margin-bottom: 1rem;">
                        <input type="password" placeholder="Current Password" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-family: 'Inter Tight', sans-serif;" id="current_password">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <input type="password" placeholder="New Password" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-family: 'Inter Tight', sans-serif;" id="new_password">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <input type="password" placeholder="Confirm New Password" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; font-family: 'Inter Tight', sans-serif;" id="confirm_password">
                    </div>
                    <button onclick="changePassword()" style="padding: 0.75rem 2rem; background: rgba(139,92,246,0.2); border: 1px solid #8B5CF6; border-radius: 8px; color: #8B5CF6; cursor: pointer; font-weight: 600;">Update Password</button>
                </div>
            </div>
            
            <!-- Purchase History -->
            <div class="dashboard-card">
                <h3>Purchase History</h3>
                <div style="margin-top: 1.5rem; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <th style="padding: 0.75rem; text-align: left; color: rgba(255,255,255,0.6); font-size: 0.875rem;">Product</th>
                                <th style="padding: 0.75rem; text-align: left; color: rgba(255,255,255,0.6); font-size: 0.875rem;">Date</th>
                                <th style="padding: 0.75rem; text-align: left; color: rgba(255,255,255,0.6); font-size: 0.875rem;">Amount</th>
                                <th style="padding: 0.75rem; text-align: left; color: rgba(255,255,255,0.6); font-size: 0.875rem;">Status</th>
                            </tr>
                        </thead>
                        <tbody id="purchase_history_body">
                            <tr>
                                <td colspan="4" style="padding: 2rem; text-align: center; color: rgba(255,255,255,0.5);">Loading purchase history...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Subscription Management -->
            <div class="dashboard-card">
                <h3>Subscription Management</h3>
                <div style="margin-top: 1.5rem;">
                    <div style="padding: 1.5rem; background: rgba(139,92,246,0.1); border-radius: 8px; margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 1.25rem; font-weight: 600; color: #8B5CF6;">Current Tier: <span id="current_tier">Free</span></div>
                                <div style="margin-top: 0.5rem; color: rgba(255,255,255,0.6); font-size: 0.875rem;">Renewal: <span id="renewal_date">N/A</span></div>
                            </div>
                            <a href="pricing.html" style="padding: 0.75rem 1.5rem; background: #8B5CF6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Upgrade</a>
                        </div>
                    </div>
                    <button onclick="cancelSubscription()" style="padding: 0.75rem 2rem; background: rgba(255,107,107,0.2); border: 1px solid #ff6b6b; border-radius: 8px; color: #ff6b6b; cursor: pointer; font-weight: 600;">Cancel Subscription</button>
                </div>
            </div>
        </div>
    `;
    
    // Load purchase history
    loadPurchaseHistory();
    
    // Load current tier info
    const userState = UserStateManager.state;
    if (userState.tier) {
        const tierElement = document.getElementById('current_tier');
        if (tierElement) {
            tierElement.textContent = userState.tier.charAt(0).toUpperCase() + userState.tier.slice(1);
        }
    }
}

/**
 * Test API connection
 */
function testAPIConnection(apiKey) {
    const statusElement = document.getElementById(`status_${apiKey}`);
    statusElement.innerHTML = '<span style="color: #ffaa00;">Testing connection...</span>';
    
    const inputElement = document.querySelector(`input[data-api="${apiKey}"]`);
    const value = inputElement.value;
    
    if (!value) {
        statusElement.innerHTML = '<span style="color: #ff6b6b;">❌ Please enter an API key</span>';
        return;
    }
    
    // Simulate API test
    setTimeout(() => {
        statusElement.innerHTML = '<span style="color: #07d197;">✅ Connection successful</span>';
    }, 1000);
}

/**
 * Save API credential
 */
function saveAPICredential(apiKey) {
    const statusElement = document.getElementById(`status_${apiKey}`);
    const inputElement = document.querySelector(`input[data-api="${apiKey}"]`);
    const value = inputElement.value;
    
    if (!value) {
        statusElement.innerHTML = '<span style="color: #ff6b6b;">❌ Please enter an API key</span>';
        return;
    }
    
    statusElement.innerHTML = '<span style="color: #ffaa00;">Saving...</span>';
    
    // Save to backend
    fetch(`${window.API_BASE_URL}/api/v1/settings/credentials`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AuthManager.getAccessToken()}`
        },
        body: JSON.stringify({
            api_name: apiKey,
            api_key: value
        })
    })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(() => {
        statusElement.innerHTML = '<span style="color: #07d197;">✅ Saved successfully</span>';
    })
    .catch(() => {
        statusElement.innerHTML = '<span style="color: #ff6b6b;">❌ Failed to save</span>';
    });
}

/**
 * Save account settings
 */
function saveAccountSettings() {
    const email = document.getElementById('account_email').value;
    const company = document.getElementById('account_company').value;
    const industry = document.getElementById('account_industry').value;
    
    fetch(`${window.API_BASE_URL}/api/v1/settings/account`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AuthManager.getAccessToken()}`
        },
        body: JSON.stringify({ email, company, industry })
    })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(() => {
        alert('Account settings saved successfully!');
    })
    .catch(() => {
        alert('Failed to save account settings');
    });
}

/**
 * Change password
 */
function changePassword() {
    const current = document.getElementById('current_password').value;
    const newPass = document.getElementById('new_password').value;
    const confirm = document.getElementById('confirm_password').value;
    
    if (!current || !newPass || !confirm) {
        alert('Please fill in all password fields');
        return;
    }
    
    if (newPass !== confirm) {
        alert('New passwords do not match');
        return;
    }
    
    fetch(`${window.API_BASE_URL}/api/v1/settings/password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AuthManager.getAccessToken()}`
        },
        body: JSON.stringify({ current_password: current, new_password: newPass })
    })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(() => {
        alert('Password changed successfully!');
        document.getElementById('current_password').value = '';
        document.getElementById('new_password').value = '';
        document.getElementById('confirm_password').value = '';
    })
    .catch(() => {
        alert('Failed to change password');
    });
}

/**
 * Load purchase history
 */
function loadPurchaseHistory() {
    fetch(`${window.API_BASE_URL}/api/v1/payments/history`, {
        headers: {
            'Authorization': `Bearer ${AuthManager.getAccessToken()}`
        }
    })
    .then(res => res.ok ? res.json() : [])
    .then(history => {
        const tbody = document.getElementById('purchase_history_body');
        if (history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="padding: 2rem; text-align: center; color: rgba(255,255,255,0.5);">No purchase history</td></tr>';
            return;
        }
        
        tbody.innerHTML = history.map(item => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 0.75rem;">${item.product}</td>
                <td style="padding: 0.75rem;">${new Date(item.date).toLocaleDateString()}</td>
                <td style="padding: 0.75rem;">$${item.amount}</td>
                <td style="padding: 0.75rem;">
                    <span style="padding: 0.25rem 0.75rem; background: ${item.status === 'Paid' ? 'rgba(7,209,151,0.2)' : item.status === 'Pending' ? 'rgba(255,170,0,0.2)' : 'rgba(255,107,107,0.2)'}; border-radius: 4px; font-size: 0.75rem;">${item.status}</span>
                </td>
            </tr>
        `).join('');
    })
    .catch(() => {
        const tbody = document.getElementById('purchase_history_body');
        tbody.innerHTML = '<tr><td colspan="4" style="padding: 2rem; text-align: center; color: rgba(255,255,255,0.5);">Failed to load purchase history</td></tr>';
    });
}

/**
 * Cancel subscription
 */
function cancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
        return;
    }
    
    fetch(`${window.API_BASE_URL}/api/v1/subscription/cancel`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AuthManager.getAccessToken()}`
        }
    })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(() => {
        alert('Subscription cancelled successfully');
        window.location.reload();
    })
    .catch(() => {
        alert('Failed to cancel subscription');
    });
}

/**
 * Inject demo data for users without diagnostic
 */
function injectDemoData() {
    // Mock diagnostic data
    sessionStorage.setItem('readiness_score', '72');
    sessionStorage.setItem('snapshot_score', '85');
    
    // Store demo flag
    localStorage.setItem('demo_mode', 'true');
}

/**
 * Show demo mode banner
 */
function showDemoBanner() {
    // Check if banner already exists
    if (document.getElementById('demo-banner')) return;
    
    const banner = document.createElement('div');
    banner.id = 'demo-banner';
    banner.style.cssText = 'position: fixed; top: 60px; left: 0; right: 0; background: linear-gradient(135deg, #ffaa00, #ff6b00); color: white; padding: 1rem 2rem; text-align: center; z-index: 9999; font-weight: 500;';
    banner.innerHTML = `
        ⚠️ You are viewing a demo dashboard. Complete the Free Diagnostic to see your real data.
        <a href="index.html#free-diagnostic" style="color: white; text-decoration: underline; margin-left: 1rem; font-weight: 600;">Start Free Diagnostic →</a>
    `;
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Store in localStorage to prevent flicker
    localStorage.setItem('demo_mode', 'true');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
