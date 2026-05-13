/**
 * Authentication Modals
 * 
 * Login and Sign Up modals for user authentication.
 */

// ============================================================================
// MODAL HTML TEMPLATES
// ============================================================================

const LOGIN_MODAL_HTML = `
<div id="login-modal" class="auth-modal">
    <div class="auth-modal-overlay" onclick="closeLoginModal()"></div>
    <div class="auth-modal-content">
        <button class="auth-modal-close" onclick="closeLoginModal()">&times;</button>
        
        <h2>Welcome Back</h2>
        <p class="auth-modal-subtitle">Log in to access your AI diagnostics</p>
        
        <form id="login-form" onsubmit="handleLogin(event)">
            <div class="auth-form-group">
                <label for="login-email">Email</label>
                <input 
                    type="email" 
                    id="login-email" 
                    name="email" 
                    required 
                    placeholder="your@email.com"
                    autocomplete="email"
                />
            </div>
            
            <div class="auth-form-group">
                <label for="login-password">Password</label>
                <input 
                    type="password" 
                    id="login-password" 
                    name="password" 
                    required 
                    placeholder="Enter your password"
                    autocomplete="current-password"
                />
            </div>
            
            <div id="login-error" class="auth-error" style="display: none;"></div>
            
            <button type="submit" class="auth-submit-btn" id="login-submit-btn">
                Log In
            </button>
        </form>
        
        <p class="auth-modal-footer">
            Don't have an account? 
            <a href="#" onclick="switchToSignup(); return false;">Sign up</a>
        </p>
    </div>
</div>
`;

const SIGNUP_MODAL_HTML = `
<div id="signup-modal" class="auth-modal">
    <div class="auth-modal-overlay" onclick="closeSignupModal()"></div>
    <div class="auth-modal-content">
        <button class="auth-modal-close" onclick="closeSignupModal()">&times;</button>
        
        <h2>Create Account</h2>
        <p class="auth-modal-subtitle">Save your results & unlock AI Snapshot</p>
        
        <form id="signup-form" onsubmit="handleSignup(event)">
            <div class="auth-form-group">
                <label for="signup-email">Email</label>
                <input 
                    type="email" 
                    id="signup-email" 
                    name="email" 
                    required 
                    placeholder="your@email.com"
                    autocomplete="email"
                />
            </div>
            
            <div class="auth-form-group">
                <label for="signup-password">Password</label>
                <input 
                    type="password" 
                    id="signup-password" 
                    name="password" 
                    required 
                    minlength="8"
                    placeholder="At least 8 characters"
                    autocomplete="new-password"
                />
                <small class="auth-hint">Minimum 8 characters</small>
            </div>
            
            <div class="auth-form-group">
                <label for="signup-company">Company Name (Optional)</label>
                <input 
                    type="text" 
                    id="signup-company" 
                    name="company" 
                    placeholder="Your company"
                    autocomplete="organization"
                />
            </div>
            
            <div id="signup-error" class="auth-error" style="display: none;"></div>
            
            <button type="submit" class="auth-submit-btn" id="signup-submit-btn">
                Create Account
            </button>
        </form>
        
        <p class="auth-modal-footer">
            Already have an account? 
            <a href="#" onclick="switchToLogin(); return false;">Log in</a>
        </p>
    </div>
</div>
`;

// ============================================================================
// MODAL MANAGEMENT
// ============================================================================

/**
 * Show login modal
 */
function showLoginModal() {
    // Remove existing modal if present
    const existing = document.getElementById('login-modal');
    if (existing) {
        existing.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', LOGIN_MODAL_HTML);
    
    // Show modal with animation
    setTimeout(() => {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }, 10);
    
    // Focus email input
    setTimeout(() => {
        const emailInput = document.getElementById('login-email');
        if (emailInput) {
            emailInput.focus();
        }
    }, 100);
}

/**
 * Close login modal
 */
function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * Show signup modal
 */
function showSignupModal() {
    // Remove existing modal if present
    const existing = document.getElementById('signup-modal');
    if (existing) {
        existing.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', SIGNUP_MODAL_HTML);
    
    // Show modal with animation
    setTimeout(() => {
        const modal = document.getElementById('signup-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }, 10);
    
    // Focus email input
    setTimeout(() => {
        const emailInput = document.getElementById('signup-email');
        if (emailInput) {
            emailInput.focus();
        }
    }, 100);
}

/**
 * Close signup modal
 */
function closeSignupModal() {
    const modal = document.getElementById('signup-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * Switch from login to signup
 */
function switchToSignup() {
    closeLoginModal();
    setTimeout(showSignupModal, 100);
}

/**
 * Switch from signup to login
 */
function switchToLogin() {
    closeSignupModal();
    setTimeout(showLoginModal, 100);
}

// ============================================================================
// FORM HANDLERS
// ============================================================================

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('login-submit-btn');
    const errorDiv = document.getElementById('login-error');
    
    // Get form data
    const email = form.email.value.trim();
    const password = form.password.value;
    
    // Disable form
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    errorDiv.style.display = 'none';
    
    try {
        // Call AuthManager login
        await AuthManager.login(email, password);
        
        // Close modal
        closeLoginModal();
        
        // Show success message
        showAuthSuccess('Logged in successfully!');
        
        // Stay on current page - just reload to update UI state
        setTimeout(() => {
            window.location.reload();
        }, 500);
        
    } catch (error) {
        // Show error
        errorDiv.textContent = error.message || 'Login failed. Please try again.';
        errorDiv.style.display = 'block';
        
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In';
    }
}

/**
 * Handle signup form submission
 */
async function handleSignup(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('signup-submit-btn');
    const errorDiv = document.getElementById('signup-error');
    
    // Get form data
    const email = form.email.value.trim();
    const password = form.password.value;
    const company = form.company.value.trim() || null;
    
    // Disable form
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    errorDiv.style.display = 'none';
    
    try {
        // Call AuthManager register
        await AuthManager.register(email, password, company);
        
        // Close modal
        closeSignupModal();
        
        // Show success message
        showAuthSuccess('Account created successfully!');
        
        // Stay on current page - just reload to update UI state
        setTimeout(() => {
            window.location.reload();
        }, 500);
        
    } catch (error) {
        // Show error
        errorDiv.textContent = error.message || 'Registration failed. Please try again.';
        errorDiv.style.display = 'block';
        
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
}

/**
 * Show success message
 */
function showAuthSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'auth-success-toast';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.classList.add('active');
    }, 10);
    
    setTimeout(() => {
        successDiv.classList.remove('active');
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}

// ============================================================================
// SOFT PROMPT (After Diagnostic)
// ============================================================================

/**
 * Show soft authentication prompt after diagnostic
 */
function showSoftAuthPrompt() {
    // Don't show if already authenticated
    if (AuthManager.isAuthenticated()) {
        return;
    }
    
    // Check if prompt already exists
    if (document.getElementById('soft-auth-prompt')) {
        return;
    }
    
    const promptHTML = `
        <div id="soft-auth-prompt" class="soft-auth-prompt">
            <div class="soft-auth-content">
                <h3>💾 Save Your Results & Unlock AI Snapshot</h3>
                <p>Create a free account to save your diagnostic results and access the AI Snapshot ($15)</p>
                <div class="soft-auth-buttons">
                    <button class="cta-button primary" onclick="showSignupModal()">
                        Sign Up Free
                    </button>
                    <button class="cta-button secondary" onclick="showLoginModal()">
                        Log In
                    </button>
                </div>
                <button class="soft-auth-close" onclick="closeSoftAuthPrompt()">&times;</button>
            </div>
        </div>
    `;
    
    // Find results section and insert prompt
    const resultsSection = document.getElementById('free-diagnostic-results');
    if (resultsSection) {
        resultsSection.insertAdjacentHTML('afterbegin', promptHTML);
        
        // Animate in
        setTimeout(() => {
            const prompt = document.getElementById('soft-auth-prompt');
            if (prompt) {
                prompt.classList.add('active');
            }
        }, 500);
    }
}

/**
 * Close soft auth prompt
 */
function closeSoftAuthPrompt() {
    const prompt = document.getElementById('soft-auth-prompt');
    if (prompt) {
        prompt.classList.remove('active');
        setTimeout(() => prompt.remove(), 300);
    }
}

// ============================================================================
// NAVBAR AUTH STATE
// ============================================================================

/**
 * Update navbar with auth state
 */
function updateNavbarAuthState() {
    const user = AuthManager.getUser();
    
    // Find navbar elements
    const signInLink = document.querySelector('.nav-signin-link');
    const dashboardBtn = document.querySelector('.nav-dashboard-btn');
    const authContainer = document.querySelector('.nav-auth');
    
    if (!authContainer) {
        return;
    }
    
    if (user) {
        // User is logged in
        const isSuperAdmin = AuthManager.isSuperAdmin();
        
        // Hide Sign In link
        if (signInLink) {
            signInLink.style.display = 'none';
        }
        
        // Show Dashboard button (always visible when logged in)
        if (dashboardBtn) {
            dashboardBtn.style.display = 'inline-block';
        }
        
        // Add super admin badge if needed (only if not already present)
        let superAdminBadge = authContainer.querySelector('.super-admin-badge');
        if (isSuperAdmin && !superAdminBadge) {
            superAdminBadge = document.createElement('span');
            superAdminBadge.className = 'super-admin-badge';
            superAdminBadge.textContent = 'SUPER ADMIN';
            authContainer.insertBefore(superAdminBadge, dashboardBtn);
        } else if (!isSuperAdmin && superAdminBadge) {
            superAdminBadge.remove();
        }
        
        // Add logout button if not already present
        let logoutBtn = authContainer.querySelector('.navbar-logout-btn');
        if (!logoutBtn) {
            logoutBtn = document.createElement('button');
            logoutBtn.className = 'navbar-logout-btn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.onclick = handleNavbarLogout;
            authContainer.appendChild(logoutBtn);
        }
    } else {
        // User is logged out
        
        // Show Sign In link
        if (signInLink) {
            signInLink.style.display = 'inline-block';
        }
        
        // Show Dashboard button (visible for both logged in and logged out)
        if (dashboardBtn) {
            dashboardBtn.style.display = 'inline-block';
        }
        
        // Remove super admin badge if present
        const superAdminBadge = authContainer.querySelector('.super-admin-badge');
        if (superAdminBadge) {
            superAdminBadge.remove();
        }
        
        // Remove logout button if present
        const logoutBtn = authContainer.querySelector('.navbar-logout-btn');
        if (logoutBtn) {
            logoutBtn.remove();
        }
    }
}

/**
 * Handle navbar logout
 */
async function handleNavbarLogout() {
    if (confirm('Are you sure you want to log out?')) {
        await AuthManager.logout();
        window.location.href = 'index.html';
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Update navbar on auth state change
if (typeof AuthManager !== 'undefined') {
    AuthManager.onAuthStateChange(updateNavbarAuthState);
}

// Initialize navbar on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavbarAuthState);
} else {
    updateNavbarAuthState();
}

// Make functions globally available
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.showSignupModal = showSignupModal;
window.closeSignupModal = closeSignupModal;
window.switchToSignup = switchToSignup;
window.switchToLogin = switchToLogin;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.showSoftAuthPrompt = showSoftAuthPrompt;
window.closeSoftAuthPrompt = closeSoftAuthPrompt;
window.handleNavbarLogout = handleNavbarLogout;
