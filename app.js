// ============================================================================
// AIVORY AI READINESS PLATFORM - THREE SEPARATE DIAGNOSTIC FLOWS
// ============================================================================
// 
// FLOW 1: FREE AI READINESS DIAGNOSTIC ($0) - 12 questions, always available
// FLOW 2: AI SNAPSHOT ($15) - Uses free diagnostic answers, unlocked after free
// FLOW 3: AI SYSTEM BLUEPRINT ($99) - Uses free diagnostic answers, unlocked after free
//
// ============================================================================

// API Configuration - Set global API_BASE_URL for all scripts
if (!window.API_BASE_URL) {
    // Development: Frontend on port 9000, FastAPI backend on port 8081
    // Production: Same origin
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDevelopment) {
        // Always use port 8081 for API in development (FastAPI has all endpoints)
        window.API_BASE_URL = 'http://localhost:8081';
    } else {
        window.API_BASE_URL = window.location.origin;
    }
}
const API_BASE_URL = window.API_BASE_URL;

console.log('✅ app.js loaded - API_BASE_URL:', API_BASE_URL);

// ============================================================================
// GLOBAL STATE
// ============================================================================

// Free diagnostic state (12 questions)
let freeDiagnosticAnswers = {};
let freeDiagnosticResult = null;
let freeDiagnosticCompleted = false;

// Snapshot diagnostic state (30 questions)
let snapshotDiagnosticAnswers = {};
let snapshotDiagnosticResult = null;
let snapshotDiagnosticCompleted = false;

// Current question index
let currentQuestionIndex = 0;

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
        
        // Get user context from form if available
        const userEmail = document.getElementById('free-result-email')?.value?.trim();
        const companyName = document.getElementById('company-name-input')?.value?.trim();
        const industry = document.getElementById('industry-input')?.value?.trim();
        
        // Build request body
        const requestBody = { answers: formattedAnswers };
        if (userEmail) requestBody.user_email = userEmail;
        if (companyName) requestBody.company_name = companyName;
        if (industry) requestBody.industry = industry;
        
        // Call backend API
        const response = await fetch(`${API_BASE_URL}/api/v1/diagnostic/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        freeDiagnosticResult = await response.json();
        freeDiagnosticCompleted = true;
        
        // ✅ STORE DIAGNOSTIC ID AND USER CONTEXT
        if (freeDiagnosticResult.diagnostic_id && typeof IDChainManager !== 'undefined') {
            IDChainManager.storeDiagnosticData(
                freeDiagnosticResult.diagnostic_id,
                {
                    user_email: userEmail,
                    company_name: companyName,
                    industry: industry
                }
            );
            IDChainManager.logIdChain();
        }
        
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
 * This is a STANDALONE PUBLIC PAGE - no login required, no dashboard redirect
 */
function displayFreeDiagnosticResults(result) {
    // Hide loading, show results
    const loadingEl = document.getElementById('free-diagnostic-loading');
    const resultsEl = document.getElementById('free-diagnostic-results');
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'block';
    
    // Populate score
    const scoreNumber = document.getElementById('free-score-number');
    const scoreCategory = document.getElementById('free-score-category');
    const categoryExplanation = document.getElementById('free-category-explanation');
    
    if (scoreNumber) scoreNumber.textContent = Math.round(result.score);
    if (scoreCategory) scoreCategory.textContent = result.category;
    if (categoryExplanation) categoryExplanation.textContent = result.category_explanation;
    
    // Populate insights
    const insightsList = document.getElementById('free-insights-list');
    if (insightsList && result.insights) {
        insightsList.innerHTML = result.insights.map(insight => `<li>${insight}</li>`).join('');
    }
    
    // Populate recommendation
    const recommendationText = document.getElementById('free-recommendation-text');
    if (recommendationText) recommendationText.textContent = result.recommendation;
    
    // Display badge
    const badgeContainer = document.getElementById('free-badge-container');
    if (badgeContainer && result.badge_svg) {
        badgeContainer.innerHTML = result.badge_svg;
    }
    
    // Store result in sessionStorage (for email sending later)
    sessionStorage.setItem('free_diagnostic_result', JSON.stringify(result));
    
    // Display upgrade options
    displayUpgradeOptions();
    
    // ✨ SHOW SOFT AUTH PROMPT (non-blocking)
    if (typeof showSoftAuthPrompt === 'function') {
        setTimeout(showSoftAuthPrompt, 1000);
    }
    
    // Scroll to results
    resultsEl.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Save and email free diagnostic results
 */
async function saveAndEmailResults() {
    const emailInput = document.getElementById('free-result-email');
    const saveButton = document.getElementById('save-results-button');
    const statusMessage = document.getElementById('email-save-status');
    
    if (!emailInput || !saveButton) return;
    
    const email = emailInput.value.trim();
    
    // Validate email
    if (!email) {
        if (statusMessage) {
            statusMessage.textContent = 'Please enter your email address';
            statusMessage.style.color = '#E74C3C';
        }
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        if (statusMessage) {
            statusMessage.textContent = 'Please enter a valid email address';
            statusMessage.style.color = '#E74C3C';
        }
        return;
    }
    
    // Get stored result
    const resultJson = sessionStorage.getItem('free_diagnostic_result');
    if (!resultJson) {
        if (statusMessage) {
            statusMessage.textContent = 'Error: No results found. Please retake the diagnostic.';
            statusMessage.style.color = '#E74C3C';
        }
        return;
    }
    
    const result = JSON.parse(resultJson);
    
    // Show loading state
    saveButton.disabled = true;
    saveButton.textContent = 'Sending...';
    if (statusMessage) {
        statusMessage.textContent = '';
    }
    
    try {
        // Send email via contact endpoint (reuse existing endpoint)
        const response = await fetch(`${API_BASE_URL}/api/v1/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Free Diagnostic User',
                email: email,
                company: '',
                message: `Free Diagnostic Results Request\n\nScore: ${result.score}\nCategory: ${result.category}\n\nPlease send my complete results to this email.`
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send email');
        }
        
        // Success
        if (statusMessage) {
            statusMessage.textContent = '✓ Results saved! Check your email for the full report.';
            statusMessage.style.color = '#27AE60';
        }
        saveButton.textContent = 'Sent!';
        emailInput.disabled = true;
        
    } catch (error) {
        console.error('Failed to save results:', error);
        if (statusMessage) {
            statusMessage.textContent = 'Failed to send. Please try again or contact support.';
            statusMessage.style.color = '#E74C3C';
        }
        saveButton.disabled = false;
        saveButton.textContent = 'Save & Email Results';
    }
}

/**
 * Access dashboard with tier-based routing
 * @param {string} tier - User's subscription tier (builder, operator, enterprise, free)
 */
function accessDashboard(tier = 'free') {
    // Validate tier parameter
    const validTiers = ['free', 'builder', 'operator', 'enterprise'];
    if (!validTiers.includes(tier.toLowerCase())) {
        console.error('Invalid tier:', tier);
        tier = 'free';
    }
    
    // Store tier in session
    sessionStorage.setItem('user_tier', tier.toLowerCase());
    
    // Route to Next.js dashboard with tier parameter
    window.location.href = `http://localhost:3000/dashboard?tier=${tier.toLowerCase()}`;
}

/**
 * Display upgrade options with personalized context based on score
 */
function displayUpgradeOptions() {
    const upgradeContainer = document.getElementById('free-upgrade-options');
    if (!upgradeContainer) return;
    
    // Get score from stored result
    const resultJson = sessionStorage.getItem('free_diagnostic_result');
    if (!resultJson) return;
    
    const result = JSON.parse(resultJson);
    const score = result.score;
    
    // Determine personalized context based on score
    let snapshotContext = '';
    let blueprintContext = '';
    
    if (score <= 40) {
        // AI Curious
        snapshotContext = "You're one step away from clarity.";
        blueprintContext = "Build your foundation first with AI Snapshot, then scale with the full Blueprint.";
    } else if (score <= 60) {
        // AI Emerging
        snapshotContext = "You're one step away from clarity.";
        blueprintContext = "Ready to accelerate? AI System Blueprint will help you architect a scalable AI system across your organization.";
    } else if (score <= 80) {
        // AI Operational
        snapshotContext = "You're one step away from clarity.";
        blueprintContext = "You have strong foundations. AI System Blueprint will help you architect a scalable AI system across your organization.";
    } else {
        // AI Transformational
        snapshotContext = "You're one step away from clarity.";
        blueprintContext = "You're ahead of the curve. AI System Blueprint will help you optimize and scale what's already working.";
    }
    
    upgradeContainer.innerHTML = `
        <div class="upsell-section">
            <h3 class="upsell-title">Unlock Deeper Insights</h3>
            <p class="upsell-subtitle">You've completed the free diagnostic. Now unlock AI-powered analysis:</p>
            
            <div class="upsell-cards">
                <div class="upsell-card">
                    <div>
                        <h4 class="upsell-product-name">AI Snapshot</h4>
                        <div class="upsell-price">$15</div>
                        <p class="upsell-context">${snapshotContext}</p>
                        <p class="upsell-description">AI Snapshot pinpoints the exact gaps holding back your AI adoption — and gives you 3 quick wins you can act on this week.</p>
                        <p class="upsell-features">Includes: readiness analysis, top use cases, and a prioritized action plan.</p>
                    </div>
                    <button class="upsell-button" onclick="startSnapshot()">
                        Run AI Snapshot — $15
                    </button>
                </div>
                
                <div class="upsell-card upsell-featured">
                    <div class="upsell-badge">BEST VALUE</div>
                    <div>
                        <h4 class="upsell-product-name">AI System Blueprint</h4>
                        <div class="upsell-price">$79</div>
                        <p class="upsell-context">${blueprintContext}</p>
                        <p class="upsell-description">Get complete AI system design with workflow architecture, agent structure, and deployment plan.</p>
                    </div>
                    <button class="upsell-button" onclick="startBlueprint()">
                        Generate Blueprint — $79
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Download free diagnostic badge as PNG using html2canvas
 */
async function downloadFreeBadge() {
    if (!freeDiagnosticResult) return;
    
    const badgeContainer = document.getElementById('free-badge-container');
    if (!badgeContainer) return;
    
    // Check if html2canvas is loaded
    if (typeof html2canvas === 'undefined') {
        console.error('html2canvas library not loaded');
        alert('Badge download feature is loading. Please try again in a moment.');
        
        // Dynamically load html2canvas
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => {
            console.log('html2canvas loaded, please try downloading again');
            alert('Badge download ready! Please click the button again.');
        };
        document.head.appendChild(script);
        return;
    }
    
    try {
        // Create a temporary container with proper sizing
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '800px';
        tempContainer.style.height = '600px';
        tempContainer.style.background = 'transparent';
        tempContainer.innerHTML = badgeContainer.innerHTML;
        document.body.appendChild(tempContainer);
        
        // Scale SVG to fit 800x600
        const svg = tempContainer.querySelector('svg');
        if (svg) {
            svg.setAttribute('width', '800');
            svg.setAttribute('height', '600');
            svg.style.width = '800px';
            svg.style.height = '600px';
        }
        
        // Convert to canvas
        const canvas = await html2canvas(tempContainer, {
            width: 800,
            height: 600,
            backgroundColor: null,
            scale: 2 // Higher quality
        });
        
        // Remove temporary container
        document.body.removeChild(tempContainer);
        
        // Convert canvas to PNG and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aivory-readiness-badge-${Math.round(freeDiagnosticResult.score)}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
        
    } catch (error) {
        console.error('Failed to download badge:', error);
        alert('Failed to download badge. Please try again or contact support.');
    }
}

// ============================================================================
// FLOW 2: AI SNAPSHOT ($15) - 30 QUESTIONS
// ============================================================================

/**
 * Start AI Snapshot flow
 * This is a NEW 30-question diagnostic, NOT reusing free diagnostic answers
 */
function startSnapshot() {
    // 1. CHECK SUPER ADMIN FIRST - bypass ALL gates
    if (typeof AuthManager !== 'undefined' && AuthManager.isSuperAdmin()) {
        console.log('✅ Super admin bypass - launching Snapshot');
        showSection('snapshot-diagnostic');
        initializeSnapshotDiagnostic();
        return;
    }
    
    // 2. Check authentication
    if (typeof AuthManager !== 'undefined' && !AuthManager.isAuthenticated()) {
        alert('Please log in to access AI Snapshot ($15)');
        if (typeof showLoginModal === 'function') {
            showLoginModal();
        }
        return;
    }
    
    // 3. Check payment (if payment system exists)
    // TODO: Add payment check here when payment system is implemented
    
    console.log('Starting AI SNAPSHOT ($15) - 30 NEW questions');
    showSection('snapshot-diagnostic');
    initializeSnapshotDiagnostic();
}

/**
 * Initialize snapshot diagnostic
 */
function initializeSnapshotDiagnostic() {
    currentQuestionIndex = 0;
    snapshotDiagnosticAnswers = {};
    
    // Show questions, hide loading and results
    const questionsEl = document.getElementById('snapshot-diagnostic-questions');
    const loadingEl = document.getElementById('snapshot-diagnostic-loading');
    const resultsEl = document.getElementById('snapshot-diagnostic-results');
    
    if (questionsEl) questionsEl.style.display = 'block';
    if (loadingEl) loadingEl.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'none';
    
    renderSnapshotQuestion();
}

/**
 * Render current snapshot diagnostic question
 */
function renderSnapshotQuestion() {
    // Check if SNAPSHOT_DIAGNOSTIC_QUESTIONS is loaded
    if (typeof SNAPSHOT_DIAGNOSTIC_QUESTIONS === 'undefined') {
        console.error('SNAPSHOT_DIAGNOSTIC_QUESTIONS not loaded. Please include diagnostic-questions-snapshot.js');
        alert('Error: Snapshot questions not loaded. Please refresh the page.');
        return;
    }
    
    const question = SNAPSHOT_DIAGNOSTIC_QUESTIONS[currentQuestionIndex];
    const container = document.getElementById('snapshot-question-container');
    
    if (!container) return;
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / SNAPSHOT_DIAGNOSTIC_QUESTIONS.length) * 100;
    const progressFill = document.getElementById('snapshot-progress-fill');
    const currentQuestionEl = document.getElementById('snapshot-current-question');
    
    if (progressFill) progressFill.style.width = progress + '%';
    if (currentQuestionEl) currentQuestionEl.textContent = currentQuestionIndex + 1;
    
    // Render question
    container.innerHTML = `
        <div class="question-card">
            <div class="question-category">${question.category}</div>
            <h3>${question.question}</h3>
            <div class="options-container">
                ${question.options.map((option, index) => `
                    <button class="option-button ${snapshotDiagnosticAnswers[question.id] === index ? 'selected' : ''}" 
                            onclick="selectSnapshotOption(${index})">
                        ${option}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    // Update navigation buttons
    const prevButton = document.getElementById('snapshot-prev-button');
    const nextButton = document.getElementById('snapshot-next-button');
    const submitButton = document.getElementById('snapshot-submit-button');
    
    if (prevButton) prevButton.disabled = currentQuestionIndex === 0;
    if (nextButton) nextButton.disabled = snapshotDiagnosticAnswers[question.id] === undefined;
    
    // Show/hide submit button
    if (currentQuestionIndex === SNAPSHOT_DIAGNOSTIC_QUESTIONS.length - 1) {
        if (nextButton) nextButton.style.display = 'none';
        if (submitButton) submitButton.style.display = snapshotDiagnosticAnswers[question.id] !== undefined ? 'block' : 'none';
    } else {
        if (nextButton) nextButton.style.display = 'block';
        if (submitButton) submitButton.style.display = 'none';
    }
}

/**
 * Select option for snapshot diagnostic
 */
function selectSnapshotOption(optionIndex) {
    if (typeof SNAPSHOT_DIAGNOSTIC_QUESTIONS === 'undefined') return;
    
    const question = SNAPSHOT_DIAGNOSTIC_QUESTIONS[currentQuestionIndex];
    snapshotDiagnosticAnswers[question.id] = optionIndex;
    renderSnapshotQuestion();
}

/**
 * Navigate to previous snapshot question
 */
function previousSnapshotQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderSnapshotQuestion();
    }
}

/**
 * Navigate to next snapshot question
 */
function nextSnapshotQuestion() {
    if (typeof SNAPSHOT_DIAGNOSTIC_QUESTIONS === 'undefined') return;
    
    if (currentQuestionIndex < SNAPSHOT_DIAGNOSTIC_QUESTIONS.length - 1) {
        currentQuestionIndex++;
        renderSnapshotQuestion();
    }
}

/**
 * Submit snapshot diagnostic
 */
async function submitSnapshotDiagnostic() {
    if (typeof SNAPSHOT_DIAGNOSTIC_QUESTIONS === 'undefined') {
        alert('Error: Snapshot questions not loaded.');
        return;
    }
    
    // Validate all questions answered
    if (Object.keys(snapshotDiagnosticAnswers).length !== SNAPSHOT_DIAGNOSTIC_QUESTIONS.length) {
        alert('Please answer all 30 questions before submitting.');
        return;
    }
    
    // Show loading state
    const questionsEl = document.getElementById('snapshot-diagnostic-questions');
    const loadingEl = document.getElementById('snapshot-diagnostic-loading');
    
    if (questionsEl) questionsEl.style.display = 'none';
    if (loadingEl) loadingEl.style.display = 'block';
    
    try {
        // Format answers for API
        const formattedAnswers = Object.entries(snapshotDiagnosticAnswers).map(([question_id, selected_option]) => ({
            question_id,
            selected_option
        }));
        
        // ✅ GET DIAGNOSTIC ID AND USER CONTEXT
        let diagnosticId = null;
        let userContext = {};
        if (typeof IDChainManager !== 'undefined') {
            diagnosticId = IDChainManager.getDiagnosticId();
            userContext = IDChainManager.getUserContext();
            console.log('📥 Using diagnostic_id:', diagnosticId);
            console.log('📥 Using user_context:', userContext);
        }
        
        // Build request body
        const requestBody = {
            snapshot_answers: formattedAnswers,
            language: 'en'
        };
        
        // Add diagnostic_id if available (links to free diagnostic)
        if (diagnosticId) {
            requestBody.diagnostic_id = diagnosticId;
        }
        
        // Add user context if available
        if (userContext.user_email) requestBody.user_email = userContext.user_email;
        if (userContext.company_name) requestBody.company_name = userContext.company_name;
        if (userContext.industry) requestBody.industry = userContext.industry;
        
        // Call snapshot endpoint with 30 questions
        const response = await fetch(`${API_BASE_URL}/api/v1/diagnostic/snapshot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `API error: ${response.status}`);
        }
        
        snapshotDiagnosticResult = await response.json();
        snapshotDiagnosticCompleted = true;
        
        // ✅ STORE SNAPSHOT ID
        if (snapshotDiagnosticResult.snapshot_id && typeof IDChainManager !== 'undefined') {
            IDChainManager.storeSnapshotId(snapshotDiagnosticResult.snapshot_id);
            IDChainManager.logIdChain();
        }
        
        // Display results
        displaySnapshotResults(snapshotDiagnosticResult);
        
    } catch (error) {
        console.error('Snapshot diagnostic failed:', error);
        alert(`Failed to run AI Snapshot: ${error.message}\n\nPlease ensure the backend is running and try again.`);
        if (loadingEl) loadingEl.style.display = 'none';
        if (questionsEl) questionsEl.style.display = 'block';
    }
}

/**
 * Display AI Snapshot results
 */
function displaySnapshotResults(result) {
    // Store result in sessionStorage for dashboard
    sessionStorage.setItem('dashboard_snapshot_data', JSON.stringify(result));
    
    // Redirect to Next.js dashboard in snapshot mode
    window.location.href = 'http://localhost:3000/dashboard?mode=snapshot';
}

// ============================================================================
// FLOW 3: AI SYSTEM BLUEPRINT ($99)
// ============================================================================

/**
 * Start AI System Blueprint flow
 * REQUIRES: Snapshot diagnostic must be completed first
 */
function startBlueprint() {
    // 1. CHECK SUPER ADMIN FIRST - bypass ALL gates
    if (typeof AuthManager !== 'undefined' && AuthManager.isSuperAdmin()) {
        console.log('✅ Super admin bypass - launching Blueprint');
        
        // For super admin, check if snapshot exists, if not use mock data
        const snapshotId = typeof IDChainManager !== 'undefined' ? IDChainManager.getSnapshotId() : null;
        
        if (!snapshotId) {
            console.warn('⚠️ Super admin: No snapshot_id found, will use mock data');
        }
        
        runBlueprint();
        return;
    }
    
    // 2. Check authentication
    if (typeof AuthManager !== 'undefined' && !AuthManager.isAuthenticated()) {
        alert('Please log in to access AI System Blueprint ($79)');
        if (typeof showLoginModal === 'function') {
            showLoginModal();
        }
        return;
    }
    
    // 3. Check payment (if payment system exists)
    // TODO: Add payment check here when payment system is implemented
    
    // 4. Check snapshot exists (required for regular users)
    if (!snapshotDiagnosticCompleted || !snapshotDiagnosticResult) {
        const snapshotId = typeof IDChainManager !== 'undefined' ? IDChainManager.getSnapshotId() : null;
        
        if (!snapshotId) {
            alert('Please complete the AI Snapshot ($15) diagnostic first! Blueprint requires Snapshot data.');
            startSnapshot();
            return;
        }
    }
    
    console.log('Starting AI SYSTEM BLUEPRINT ($79) - using snapshot result');
    runBlueprint();
}

/**
 * Run AI System Blueprint diagnostic
 */
async function runBlueprint() {
    // Show loading
    showSection('blueprint-loading');
    
    try {
        // Retrieve snapshot_id from localStorage
        let snapshotId = IDChainManager.getSnapshotId();
        
        // Super admin mock data fallback
        const isSuperAdmin = typeof AuthManager !== 'undefined' && AuthManager.isSuperAdmin();
        const user = typeof AuthManager !== 'undefined' ? AuthManager.getUser() : null;
        const userId = user ? user.user_id : 'GrandMasterRCH';
        
        if (isSuperAdmin && !snapshotId) {
            console.log('🔧 Super admin: No snapshot_id found, injecting mock snapshot_id');
            snapshotId = 'snap_superadmin_demo';
            // Store it so it persists
            IDChainManager.storeSnapshotId(snapshotId);
        }
        
        if (!snapshotId) {
            console.error('❌ No snapshot_id found in localStorage');
            alert('Please complete the AI Snapshot ($15) diagnostic first! Blueprint requires Snapshot data.');
            window.location.href = 'index.html#snapshot';
            return;
        }
        
        console.log('📥 Using snapshot_id:', snapshotId);
        
        // Call blueprint generation endpoint with snapshot_id
        const response = await fetch(`${API_BASE_URL}/api/v1/blueprint/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                snapshot_id: snapshotId
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `API error: ${response.status}`);
        }
        
        const blueprintResult = await response.json();
        
        // Store blueprint_id in localStorage
        if (blueprintResult.blueprint_id) {
            IDChainManager.storeBlueprintId(blueprintResult.blueprint_id);
        }
        
        // Display blueprint results
        displayBlueprintResults(blueprintResult);
        
    } catch (error) {
        console.error('Blueprint diagnostic failed:', error);
        alert(`Failed to generate AI System Blueprint: ${error.message}\n\nPlease try again or contact support.`);
        showSection('snapshot-diagnostic');
    }
}

/**
 * Display AI System Blueprint results
 */
async function displayBlueprintResults(result) {
    try {
        // Fetch the actual blueprint JSON data
        const blueprintResponse = await fetch(
            `${API_BASE_URL}/api/v1/blueprint/${result.blueprint_id}?user_id=${userId}`
        );
        
        if (!blueprintResponse.ok) {
            throw new Error('Failed to fetch blueprint data');
        }
        
        const blueprintData = await blueprintResponse.json();
        
        // Store blueprint data in sessionStorage for dashboard
        sessionStorage.setItem('dashboard_blueprint_data', JSON.stringify(blueprintData));
        
        // Redirect to Next.js dashboard in blueprint mode
        window.location.href = 'http://localhost:3000/dashboard?mode=blueprint';
        
    } catch (error) {
        console.error('Error loading blueprint data:', error);
        alert('Blueprint generated but failed to load data. Please try refreshing the dashboard.');
        window.location.href = 'http://localhost:3000/dashboard?mode=blueprint';
    }
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
    // Handle hash navigation for upgrade flows
    const hash = window.location.hash;
    if (hash === '#snapshot') {
        // Snapshot can be run independently
        startSnapshot();
        window.location.hash = ''; // Clear hash
    } else if (hash === '#blueprint') {
        if (snapshotDiagnosticCompleted) {
            startBlueprint();
        } else {
            alert('Please complete the AI Snapshot ($15) diagnostic first!');
            startSnapshot();
        }
        window.location.hash = ''; // Clear hash
    }
    
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
                const response = await fetch(`${API_BASE_URL}/api/v1/contact`, {
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


// ============================================================================
// INTELLIGENCE CREDITS TOOLTIP
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    const tooltipIcons = document.querySelectorAll('.tooltip-icon');
    const tooltip = document.getElementById('intelligence-credits-tooltip');
    
    if (tooltipIcons.length > 0 && tooltip) {
        tooltipIcons.forEach(icon => {
            icon.addEventListener('mouseenter', function() {
                tooltip.style.display = 'block';
            });
            
            icon.addEventListener('mouseleave', function() {
                setTimeout(() => {
                    tooltip.style.display = 'none';
                }, 300);
            });
        });
    }
});

// ============================================================================
// INTELLIGENCE CREDITS PURCHASE
// ============================================================================
function addCredits(amount) {
    console.log(`Adding ${amount} Intelligence Credits`);
    alert(`Adding ${amount} Intelligence Credits to your account. This feature will be available soon.`);
}

// ============================================================================
// PLAN SELECTION
// ============================================================================
function selectPlan(planName) {
    console.log(`Selected plan: ${planName}`);
    alert(`You selected the ${planName} plan. This feature will be available soon.`);
}

// ============================================================================
// NAVIGATION HANDLERS
// ============================================================================

/**
 * Handle Sign In button click
 */
function handleSignInClick() {
    if (typeof showLoginModal === 'function') {
        showLoginModal();
    } else {
        console.error('showLoginModal function not found');
        alert('Sign in functionality is loading. Please refresh the page.');
    }
}

/**
 * Handle Dashboard button click
 */
function handleDashboardClick() {
    // Check if user is authenticated
    if (typeof AuthManager !== 'undefined' && AuthManager.isAuthenticated()) {
        // Redirect to Next.js dashboard
        window.location.href = 'http://localhost:3000/dashboard';
    } else {
        // Show login modal
        if (typeof showLoginModal === 'function') {
            showLoginModal();
        } else {
            console.error('showLoginModal function not found');
            alert('Please sign in to access the dashboard.');
        }
    }
}
