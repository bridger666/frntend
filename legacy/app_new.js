// ============================================================================
// AIVORY AI READINESS PLATFORM - THREE SEPARATE DIAGNOSTIC FLOWS
// ============================================================================
// 
// FLOW 1: FREE AI READINESS DIAGNOSTIC ($0) - 12 questions, always available
// FLOW 2: AI SNAPSHOT ($15) - Uses free diagnostic answers, unlocked after free
// FLOW 3: AI SYSTEM BLUEPRINT ($99) - Uses free diagnostic answers, unlocked after free
//
// ============================================================================

// API Configuration - Use global API_BASE_URL set by app.js
// No local declaration needed - just reference window.API_BASE_URL directly

// ============================================================================
// GLOBAL STATE
// ============================================================================

// Free diagnostic state (12 questions)
let freeDiagnosticAnswers = {};
let freeDiagnosticResult = null;
let freeDiagnosticCompleted = false;

// Current question index for free diagnostic
let currentQuestionIndex = 0;

// ============================================================================
// STAR ANIMATION INITIALIZATION
// ============================================================================
function initializeStarAnimation() {
    const stars = document.querySelectorAll('[class*="aivory-plus-"]');
    const totalStars = stars.length;
    const maxVisibleStars = 7;
    const offProbability = 0.78;
    
    let visibleStars = [];
    
    stars.forEach((star, index) => {
        const randomValue = Math.random();
        if (randomValue > offProbability && visibleStars.length < maxVisibleStars) {
            visibleStars.push(index);
        }
    });
    
    stars.forEach((star, index) => {
        if (visibleStars.includes(index)) {
            star.style.opacity = '0.8';
        } else {
            star.style.opacity = '0';
        }
    });
    
    console.log(`Star animation initialized: ${visibleStars.length}/${totalStars} stars visible`);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStarAnimation);
} else {
    initializeStarAnimation();
}

// ============================================================================
// FREE DIAGNOSTIC QUESTIONS (12 questions)
// ============================================================================
const FREE_DIAGNOSTIC_QUESTIONS = [
    {
        id: "business_objective",
        question: "What is your primary business objective for AI?",
        options: [
            "No clear objective",
            "Vague goals (e.g., 'be innovative')",
            "Specific goal (e.g., 'reduce costs')",
            "Quantified goal (e.g., 'reduce costs by 20%')"
        ]
    },
    {
        id: "current_ai_usage",
        question: "What is your current AI usage?",
        options: [
            "No AI usage",
            "Exploring/researching",
            "Running pilots",
            "Production deployment"
        ]
    },
    {
        id: "data_availability",
        question: "How is your data availability & quality?",
        options: [
            "No centralized data",
            "Siloed data across departments",
            "Partially centralized",
            "Fully centralized and accessible"
        ]
    },
    {
        id: "process_documentation",
        question: "What is your level of process documentation?",
        options: [
            "No documentation",
            "Informal/tribal knowledge",
            "Some processes documented",
            "Comprehensive documentation"
        ]
    },
    {
        id: "workflow_standardization",
        question: "How standardized are your workflows?",
        options: [
            "Ad-hoc workflows",
            "Some standardization",
            "Mostly standardized",
            "Fully standardized"
        ]
    },
    {
        id: "erp_integration",
        question: "What is your ERP / system integration level?",
        options: [
            "No systems",
            "Disconnected systems",
            "Some integration",
            "Fully integrated"
        ]
    },
    {
        id: "automation_level",
        question: "What is your current automation level?",
        options: [
            "Fully manual",
            "Minimal automation (<10%)",
            "Moderate automation (10-50%)",
            "High automation (>50%)"
        ]
    },
    {
        id: "decision_speed",
        question: "How fast is your decision-making?",
        options: [
            "Months",
            "Weeks",
            "Days",
            "Hours"
        ]
    },
    {
        id: "leadership_alignment",
        question: "What is your leadership alignment on AI?",
        options: [
            "No alignment",
            "Some interest",
            "Supportive",
            "Championing AI"
        ]
    },
    {
        id: "budget_ownership",
        question: "What is your budget situation for AI?",
        options: [
            "No budget",
            "Exploring budget",
            "Budget allocated",
            "Dedicated AI budget"
        ]
    },
    {
        id: "change_readiness",
        question: "How ready is your organization for change?",
        options: [
            "Resistant to change",
            "Cautious",
            "Open to change",
            "Embracing change"
        ]
    },
    {
        id: "internal_capability",
        question: "What is your internal AI capability?",
        options: [
            "No technical team",
            "Limited technical skills",
            "Some AI knowledge",
            "Strong AI team"
        ]
    }
];

// ============================================================================
// NAVIGATION
// ============================================================================
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    window.scrollTo(0, 0);
    
    // Initialize diagnostic if showing that section
    if (sectionId === 'free-diagnostic') {
        initializeFreeDiagnostic();
    }
}

// ============================================================================
// FLOW 1: FREE AI READINESS DIAGNOSTIC ($0)
// ============================================================================

/**
 * Start the free diagnostic flow
 * This is ALWAYS available and is the entry point for all users
 */
function startFreeDiagnostic() {
    console.log('Starting FREE diagnostic (12 questions)');
    showSection('free-diagnostic');
}

/**
 * Initialize free diagnostic
 */
function initializeFreeDiagnostic() {
    currentQuestionIndex = 0;
    freeDiagnosticAnswers = {};
    
    // Show questions, hide loading and results
    const questionsEl = document.getElementById('free-diagnostic-questions');
    const loadingEl = document.getElementById('free-diagnostic-loading');
    const resultsEl = document.getElementById('free-diagnostic-results');
    
    if (questionsEl) questionsEl.style.display = 'block';
    if (loadingEl) loadingEl.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'none';
    
    renderFreeQuestion();
}

/**
 * Render current free diagnostic question
 */
function renderFreeQuestion() {
    const question = FREE_DIAGNOSTIC_QUESTIONS[currentQuestionIndex];
    const container = document.getElementById('free-question-container');
    
    if (!container) return;
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / FREE_DIAGNOSTIC_QUESTIONS.length) * 100;
    const progressFill = document.getElementById('free-progress-fill');
    const currentQuestionEl = document.getElementById('free-current-question');
    
    if (progressFill) progressFill.style.width = progress + '%';
    if (currentQuestionEl) currentQuestionEl.textContent = currentQuestionIndex + 1;
    
    // Render question
    container.innerHTML = `
        <div class="question-card">
            <h3>${question.question}</h3>
            <div class="options-container">
                ${question.options.map((option, index) => `
                    <button class="option-button ${freeDiagnosticAnswers[question.id] === index ? 'selected' : ''}" 
                            onclick="selectFreeOption(${index})">
                        ${option}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    // Update navigation buttons
    const prevButton = document.getElementById('free-prev-button');
    const nextButton = document.getElementById('free-next-button');
    const submitButton = document.getElementById('free-submit-button');
    
    if (prevButton) prevButton.disabled = currentQuestionIndex === 0;
    if (nextButton) nextButton.disabled = freeDiagnosticAnswers[question.id] === undefined;
    
    // Show/hide submit button
    if (currentQuestionIndex === FREE_DIAGNOSTIC_QUESTIONS.length - 1) {
        if (nextButton) nextButton.style.display = 'none';
        if (submitButton) submitButton.style.display = freeDiagnosticAnswers[question.id] !== undefined ? 'block' : 'none';
    } else {
        if (nextButton) nextButton.style.display = 'block';
        if (submitButton) submitButton.style.display = 'none';
    }
}

/**
 * Select option for free diagnostic
 */
function selectFreeOption(optionIndex) {
    const question = FREE_DIAGNOSTIC_QUESTIONS[currentQuestionIndex];
    freeDiagnosticAnswers[question.id] = optionIndex;
    renderFreeQuestion();
}

/**
 * Navigate to previous question
 */
function previousFreeQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderFreeQuestion();
    }
}

/**
 * Navigate to next question
 */
function nextFreeQuestion() {
    if (currentQuestionIndex < FREE_DIAGNOSTIC_QUESTIONS.length - 1) {
        currentQuestionIndex++;
        renderFreeQuestion();
    }
}

/**
 * Submit free diagnostic
 */
async function submitFreeDiagnostic() {
    // Validate all questions answered
    if (Object.keys(freeDiagnosticAnswers).length !== FREE_DIAGNOSTIC_QUESTIONS.length) {
        alert('Please answer all questions before submitting.');
        return;
    }
    
    // Show loading state
    const questionsEl = document.getElementById('free-diagnostic-questions');
    const loadingEl = document.getElementById('free-diagnostic-loading');
    
    if (questionsEl) questionsEl.style.display = 'none';
    if (loadingEl) loadingEl.style.display = 'block';
    
    try {
        // Format answers for API
        const formattedAnswers = Object.entries(freeDiagnosticAnswers).map(([question_id, selected_option]) => ({
            question_id,
            selected_option
        }));
        
        // Call backend API
        const response = await fetch(`${window.API_BASE_URL}/api/v1/diagnostic/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answers: formattedAnswers })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        freeDiagnosticResult = await response.json();
        freeDiagnosticCompleted = true;
        
        // Display results
        displayFreeDiagnosticResults(freeDiagnosticResult);
        
    } catch (error) {
        console.error('Free diagnostic failed:', error);
        alert('Failed to run diagnostic. Please ensure the backend is running on port 8081 and try again.');
        if (loadingEl) loadingEl.style.display = 'none';
        if (questionsEl) questionsEl.style.display = 'block';
    }
}

/**
 * Display free diagnostic results
 */
function displayFreeDiagnosticResults(result) {
    // Hide loading, show results
    const loadingEl = document.getElementById('free-diagnostic-loading');
    const resultsEl = document.getElementById('free-diagnostic-results');
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'block';
    
    // Update score
    const scoreNumber = document.getElementById('free-score-number');
    const scoreCategory = document.getElementById('free-score-category');
    const categoryExplanation = document.getElementById('free-category-explanation');
    
    if (scoreNumber) scoreNumber.textContent = Math.round(result.score);
    if (scoreCategory) scoreCategory.textContent = result.category;
    if (categoryExplanation) categoryExplanation.textContent = result.category_explanation;
    
    // Update insights
    const insightsList = document.getElementById('free-insights-list');
    if (insightsList) {
        insightsList.innerHTML = '';
        result.insights.forEach(insight => {
            const li = document.createElement('li');
            li.textContent = insight;
            insightsList.appendChild(li);
        });
    }
    
    // Update recommendation
    const recommendationText = document.getElementById('free-recommendation-text');
    if (recommendationText) recommendationText.textContent = result.recommendation;
    
    // Display badge
    const badgeContainer = document.getElementById('free-badge-container');
    if (badgeContainer) badgeContainer.innerHTML = result.badge_svg;
    
    // Show upgrade options (now unlocked)
    displayUpgradeOptions();
    
    // Scroll to top of results
    window.scrollTo(0, 0);
}

/**
 * Display upgrade options (unlocked after free diagnostic)
 */
function displayUpgradeOptions() {
    const upgradeContainer = document.getElementById('free-upgrade-options');
    if (!upgradeContainer) return;
    
    upgradeContainer.innerHTML = `
        <div class="upgrade-section">
            <h3>🚀 Unlock Deeper Insights</h3>
            <p>You've completed the free diagnostic! Now unlock AI-powered analysis:</p>
            
            <div class="upgrade-cards">
                <div class="upgrade-card">
                    <h4>AI Snapshot</h4>
                    <div class="price">$15</div>
                    <p>Get AI-powered readiness analysis with recommended use cases and priority actions.</p>
                    <button class="cta-button primary" onclick="startSnapshot()">
                        Run AI Snapshot — $15
                    </button>
                </div>
                
                <div class="upgrade-card featured">
                    <div class="badge">BEST VALUE</div>
                    <h4>AI System Blueprint</h4>
                    <div class="price">$99</div>
                    <p>Get complete AI system design with workflow architecture, agent structure, and deployment plan.</p>
                    <button class="cta-button primary" onclick="startBlueprint()">
                        Generate Blueprint — $99
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Download free diagnostic badge
 */
function downloadFreeBadge() {
    if (!freeDiagnosticResult) return;
    
    const svgBlob = new Blob([freeDiagnosticResult.badge_svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `aivory-readiness-badge-${Math.round(freeDiagnosticResult.score)}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================================================
// FLOW 2: AI SNAPSHOT ($15)
// ============================================================================

/**
 * Start AI Snapshot flow
 * REQUIRES: Free diagnostic must be completed first
 */
function startSnapshot() {
    if (!freeDiagnosticCompleted) {
        alert('Please complete the free AI readiness diagnostic first!');
        startFreeDiagnostic();
        return;
    }
    
    console.log('Starting AI SNAPSHOT ($15) - using free diagnostic answers');
    runSnapshot();
}

/**
 * Run AI Snapshot diagnostic
 */
async function runSnapshot() {
    // Show loading
    showSection('snapshot-loading');
    
    try {
        // Format free diagnostic answers for API
        const formattedAnswers = Object.entries(freeDiagnosticAnswers).map(([question_id, selected_option]) => ({
            question_id,
            selected_option
        }));
        
        // Call snapshot endpoint with free diagnostic answers
        const response = await fetch(`${window.API_BASE_URL}/api/v1/diagnostic/snapshot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                free_diagnostic_answers: formattedAnswers,
                language: 'en'
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const snapshotResult = await response.json();
        
        // Display snapshot results
        displaySnapshotResults(snapshotResult);
        
    } catch (error) {
        console.error('Snapshot diagnostic failed:', error);
        alert('Failed to run AI Snapshot. Please try again or contact support.');
        showSection('free-diagnostic');
    }
}

/**
 * Display AI Snapshot results
 */
function displaySnapshotResults(result) {
    showSection('snapshot-results');
    
    const container = document.getElementById('snapshot-results-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="snapshot-results">
            <!-- Readiness Score -->
            <div class="score-section">
                <h2>Your AI Readiness Score</h2>
                <div class="score-number">${result.readiness_score}</div>
                <p class="summary">${result.summary}</p>
            </div>
            
            <!-- Recommended Use Cases -->
            <div class="section-box">
                <h3>💡 Recommended Use Cases</h3>
                <ul class="insights-list">
                    ${result.recommended_use_cases.map(useCase => `<li>${useCase}</li>`).join('')}
                </ul>
            </div>
            
            <!-- Priority Actions -->
            <div class="section-box">
                <h3>✅ Priority Actions (Next 30 Days)</h3>
                <ul class="insights-list">
                    ${result.priority_actions.map(action => `<li>${action}</li>`).join('')}
                </ul>
            </div>
            
            <!-- Upgrade CTA -->
            <div class="section-box upgrade-box">
                <h3>🚀 Ready for Your Complete AI Blueprint?</h3>
                <p>Get a complete AI system design with workflow architecture, agent structure, and deployment plan.</p>
                <button class="cta-button primary" onclick="startBlueprint()">
                    Generate AI System Blueprint — $99
                </button>
            </div>
            
            <!-- Navigation -->
            <div class="navigation-buttons">
                <button class="nav-button" onclick="showSection('homepage')">Back to Home</button>
                <button class="nav-button" onclick="startFreeDiagnostic()">Run Another Diagnostic</button>
            </div>
        </div>
    `;
}

// ============================================================================
// FLOW 3: AI SYSTEM BLUEPRINT ($99)
// ============================================================================

/**
 * Start AI System Blueprint flow
 * REQUIRES: Free diagnostic must be completed first
 */
function startBlueprint() {
    if (!freeDiagnosticCompleted) {
        alert('Please complete the free AI readiness diagnostic first!');
        startFreeDiagnostic();
        return;
    }
    
    console.log('Starting AI SYSTEM BLUEPRINT ($99) - using free diagnostic answers');
    runBlueprint();
}

/**
 * Run AI System Blueprint diagnostic
 */
async function runBlueprint() {
    // Show loading
    showSection('blueprint-loading');
    
    try {
        // Format free diagnostic answers for API
        const formattedAnswers = Object.entries(freeDiagnosticAnswers).map(([question_id, selected_option]) => ({
            question_id,
            selected_option
        }));
        
        // Call blueprint endpoint with free diagnostic answers
        const response = await fetch(`${window.API_BASE_URL}/api/v1/diagnostic/blueprint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                free_diagnostic_answers: formattedAnswers,
                language: 'en'
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const blueprintResult = await response.json();
        
        // Display blueprint results
        displayBlueprintResults(blueprintResult);
        
    } catch (error) {
        console.error('Blueprint diagnostic failed:', error);
        alert('Failed to generate AI System Blueprint. Please try again or contact support.');
        showSection('free-diagnostic');
    }
}

/**
 * Display AI System Blueprint results
 */
function displayBlueprintResults(result) {
    showSection('blueprint-results');
    
    const container = document.getElementById('blueprint-results-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="blueprint-results">
            <!-- System Recommendation -->
            <div class="score-section">
                <h2>Your AI System Blueprint</h2>
                <h3>${result.system_recommendation.system_name}</h3>
                <p>${result.system_recommendation.description}</p>
                <span class="confidence-badge confidence-${result.system_recommendation.confidence_level.toLowerCase()}">
                    Confidence: ${result.system_recommendation.confidence_level}
                </span>
            </div>
            
            <!-- Workflow Architecture -->
            <div class="section-box">
                <h3>⚙️ Workflow Architecture</h3>
                ${result.workflow.map(workflow => `
                    <div class="workflow-card">
                        <h4>Trigger: ${workflow.trigger}</h4>
                        <div class="workflow-steps">
                            <strong>Steps:</strong>
                            <ol>
                                ${workflow.steps.map(step => `<li>${step}</li>`).join('')}
                            </ol>
                        </div>
                        <div class="workflow-tools">
                            <strong>Tools:</strong> ${workflow.tools_used.join(', ')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Agent Structure -->
            <div class="section-box">
                <h3>🤖 Agent Structure</h3>
                <div class="agent-grid">
                    ${result.agent_structure.map(agent => `
                        <div class="agent-card">
                            <h4>${agent.agent_name}</h4>
                            <p class="agent-role">${agent.role}</p>
                            <ul>
                                ${agent.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Expected ROI -->
            <div class="section-box impact-section">
                <h3>📊 Expected ROI</h3>
                <p>${result.expected_ROI}</p>
            </div>
            
            <!-- Deployment Plan -->
            <div class="section-box">
                <h3>🚀 Deployment Plan</h3>
                <p>${result.deployment_plan}</p>
            </div>
            
            <!-- Deploy CTA -->
            <div class="section-box upgrade-box">
                <h3>Ready to Deploy This System?</h3>
                <p>Choose a recurring plan to start building and deploying your AI workflows.</p>
                <button class="cta-button primary" onclick="showSection('homepage'); setTimeout(() => scrollToPricing(), 100)">
                    View Deployment Plans
                </button>
            </div>
            
            <!-- Navigation -->
            <div class="navigation-buttons">
                <button class="nav-button" onclick="showSection('homepage')">Back to Home</button>
                <button class="nav-button primary" onclick="window.print()">Download Blueprint (PDF)</button>
            </div>
        </div>
    `;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function scrollToPricing() {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ============================================================================
// CONTACT FORM
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                company: formData.get('company'),
                email: formData.get('email'),
                message: formData.get('message')
            };
            
            try {
                const response = await fetch(`${window.API_BASE_URL}/api/v1/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const result = await response.json();
                
                // Show success message
                contactForm.style.display = 'none';
                document.getElementById('contact-success').style.display = 'block';
                
            } catch (error) {
                console.error('Contact form submission failed:', error);
                alert('Failed to send message. Please try again or contact us directly.');
            }
        });
    }
});
