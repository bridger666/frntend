/**
 * Authentication Guard for Dashboard Access
 * Uses AuthManager for unified authentication
 */

/**
 * Guard dashboard access - redirect to login if not authenticated
 * @returns {Promise<boolean>} True if authorized
 */
async function guardDashboardAccess() {
    // Check if AuthManager is available
    if (typeof AuthManager === 'undefined') {
        console.error('AuthManager not loaded');
        showLoginModal();
        return false;
    }
    
    // Super admin bypass - always allow access
    if (AuthManager.isSuperAdmin()) {
        console.log('✅ Super admin access granted');
        return true;
    }
    
    // Check if user is authenticated
    if (!AuthManager.isAuthenticated()) {
        console.log('❌ Not authenticated, showing login modal');
        showLoginModal();
        return false;
    }
    
    console.log('✅ User authenticated, access granted');
    return true;
}

/**
 * Show login modal
 */
function showLoginModal() {
    // Use the global showLoginModal from auth-modals.js if available
    if (typeof window.showLoginModal === 'function') {
        window.showLoginModal();
        return;
    }
    
    // Fallback: redirect to home page
    alert('Please log in to access the dashboard');
    window.location.href = 'index.html';
}

/**
 * Add logout button to dashboard
 */
function addLogoutButton() {
    if (typeof AuthManager === 'undefined') {
        return;
    }
    
    const user = AuthManager.getUser();
    
    if (!user) {
        return;
    }
    
    // Find topbar right section
    const topbarRight = document.querySelector('.topbar-right');
    
    if (!topbarRight) {
        return;
    }
    
    // Check if logout button already exists
    if (document.querySelector('.dashboard-logout-btn')) {
        return;
    }
    
    // Add user info and logout button
    const userSection = document.createElement('div');
    userSection.className = 'topbar-stat';
    
    const isSuperAdmin = AuthManager.isSuperAdmin();
    
    userSection.innerHTML = `
        ${isSuperAdmin ? '<span class="topbar-stat-label" style="color: #ff4444; font-weight: 600;">SUPER ADMIN</span>' : ''}
        <span class="topbar-stat-label">${user.email}</span>
        <button 
            onclick="handleDashboardLogout()" 
            class="cta-button secondary dashboard-logout-btn" 
            style="padding: 0.5rem 1rem; font-size: 0.875rem; margin-left: 0.5rem;"
        >
            Logout
        </button>
    `;
    
    topbarRight.appendChild(userSection);
}

/**
 * Handle logout button click
 */
async function handleDashboardLogout() {
    if (typeof AuthManager === 'undefined') {
        window.location.href = 'index.html';
        return;
    }
    
    if (confirm('Are you sure you want to log out?')) {
        await AuthManager.logout();
        window.location.href = 'index.html';
    }
}

// Make functions globally available
window.handleDashboardLogout = handleDashboardLogout;
