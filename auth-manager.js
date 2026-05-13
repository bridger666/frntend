/**
 * Authentication Manager
 * 
 * Handles user authentication, token management, and session persistence.
 * Integrates with IDChainManager for ID migration on login/signup.
 */

// LocalStorage keys - unified with superadmin-login.html
const AUTH_KEYS = {
    SESSION_TOKEN: 'aivory_session_token',  // Changed from ACCESS_TOKEN to match login page
    REFRESH_TOKEN: 'aivory_refresh_token',
    USER: 'aivory_user'
};

// API Configuration - Use global API_BASE_URL set by app.js
// No local declaration needed - just reference window.API_BASE_URL directly

// ============================================================================
// AUTHENTICATION STATE
// ============================================================================

let currentUser = null;
let authStateListeners = [];

/**
 * Initialize auth state from localStorage
 */
function initAuthState() {
    console.log('AuthManager: Initializing...');
    
    const token = getAccessToken();
    const userStr = localStorage.getItem(AUTH_KEYS.USER);
    
    if (token && userStr) {
        try {
            currentUser = JSON.parse(userStr);
            console.log('✓ Auth state restored:', currentUser.email);
            notifyAuthStateChange();
        } catch (e) {
            console.error('❌ Failed to parse user data:', e);
            clearAuthState();
        }
    } else {
        console.log('ℹ️ No stored auth state found');
    }
    
    // Mark as initialized
    window.AuthManagerReady = true;
    console.log('✓ AuthManager ready');
}

/**
 * Clear auth state
 */
function clearAuthState() {
    currentUser = null;
    localStorage.removeItem(AUTH_KEYS.SESSION_TOKEN);
    localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
    console.log('✓ Auth data cleared');
    notifyAuthStateChange();
}

/**
 * Subscribe to auth state changes
 */
function onAuthStateChange(callback) {
    authStateListeners.push(callback);
    // Immediately call with current state
    callback(currentUser);
}

/**
 * Notify all listeners of auth state change
 */
function notifyAuthStateChange() {
    authStateListeners.forEach(callback => callback(currentUser));
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Get access token from localStorage
 */
function getAccessToken() {
    const token = localStorage.getItem(AUTH_KEYS.SESSION_TOKEN);
    if (!token) {
        console.warn('⚠️ No session token found in localStorage');
    }
    return token;
}

/**
 * Get refresh token from localStorage
 */
function getRefreshToken() {
    return localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
}

/**
 * Store tokens in localStorage
 */
function storeTokens(accessToken, refreshToken) {
    if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
        console.error('❌ Invalid access token provided to storeTokens');
        return false;
    }
    localStorage.setItem(AUTH_KEYS.SESSION_TOKEN, accessToken);
    if (refreshToken) {
        localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
    }
    console.log('✓ Session token stored');
    return true;
}

/**
 * Set tokens (alias for storeTokens for external use)
 */
function setTokens(accessToken, refreshToken) {
    return storeTokens(accessToken, refreshToken);
}

/**
 * Store user data in localStorage
 */
function storeUser(user) {
    currentUser = user;
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
    console.log('✓ User data stored:', user.email);
    notifyAuthStateChange();
}

/**
 * Set user (alias for storeUser for external use)
 */
function setUser(user) {
    storeUser(user);
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        if (!response.ok) {
            throw new Error('Token refresh failed');
        }
        
        const data = await response.json();
        storeTokens(data.access_token, data.refresh_token);
        
        console.log('✓ Access token refreshed');
        return data.access_token;
        
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear auth state on refresh failure
        clearAuthState();
        throw error;
    }
}

/**
 * Make authenticated API request with automatic token refresh
 */
async function authenticatedFetch(url, options = {}) {
    let accessToken = getAccessToken();
    
    if (!accessToken) {
        console.error('❌ Cannot make authenticated request: No token');
        throw new Error('Not authenticated');
    }
    
    // Add authorization header
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
    };
    
    console.log(`→ Making authenticated request to ${url}`);
    
    // Make request
    let response = await fetch(url, options);
    
    // If 401, try to refresh token and retry
    if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token invalid or expired');
        try {
            accessToken = await refreshAccessToken();
            options.headers['Authorization'] = `Bearer ${accessToken}`;
            response = await fetch(url, options);
            console.log('✓ Request retried with refreshed token');
        } catch (error) {
            clearAuthState();
            throw new Error('Authentication failed');
        }
    }
    
    if (!response.ok) {
        console.error(`❌ Request failed with status ${response.status}`);
    } else {
        console.log(`✓ Request successful (${response.status})`);
    }
    
    return response;
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Register new user
 */
async function register(email, password, companyName = null) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                company_name: companyName
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
        }
        
        const data = await response.json();
        
        // Store tokens and user
        storeTokens(data.tokens.access_token, data.tokens.refresh_token);
        storeUser(data.user);
        
        // Migrate IDs from localStorage
        await migrateLocalStorageIds();
        
        console.log('✓ User registered:', data.user.email);
        return data.user;
        
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
}

/**
 * Login user
 */
async function login(email, password) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }
        
        const data = await response.json();
        
        // Store tokens and user
        storeTokens(data.tokens.access_token, data.tokens.refresh_token);
        storeUser(data.user);
        
        // Migrate IDs from localStorage
        await migrateLocalStorageIds();
        
        console.log('✓ User logged in:', data.user.email);
        return data.user;
        
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

/**
 * Logout user
 */
async function logout() {
    const refreshToken = getRefreshToken();
    
    if (refreshToken) {
        try {
            await fetch(`${window.API_BASE_URL}/api/v1/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh_token: refreshToken })
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        }
    }
    
    clearAuthState();
    console.log('✓ User logged out');
}

/**
 * Get current user info from server
 */
async function getCurrentUser() {
    try {
        const response = await authenticatedFetch(`${window.API_BASE_URL}/api/v1/auth/me`);
        
        if (!response.ok) {
            throw new Error('Failed to get user info');
        }
        
        const user = await response.json();
        storeUser(user);
        
        return user;
        
    } catch (error) {
        console.error('Failed to get current user:', error);
        clearAuthState();
        return null;
    }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return !!currentUser && !!getAccessToken();
}

/**
 * Get current user
 */
function getUser() {
    return currentUser;
}

/**
 * Get current user ID
 */
function getUserId() {
    return currentUser ? currentUser.user_id : null;
}

/**
 * Check if user is super admin
 */
function isSuperAdmin() {
    return currentUser && currentUser.account_type === 'superadmin';
}

// ============================================================================
// ID CHAIN MIGRATION
// ============================================================================

/**
 * Migrate localStorage IDs to user account
 */
async function migrateLocalStorageIds() {
    if (!isAuthenticated()) {
        return;
    }
    
    // Get IDs from localStorage (via IDChainManager if available)
    let diagnosticId = null;
    let snapshotId = null;
    let blueprintId = null;
    
    if (typeof IDChainManager !== 'undefined') {
        diagnosticId = IDChainManager.getDiagnosticId();
        snapshotId = IDChainManager.getSnapshotId();
        blueprintId = IDChainManager.getBlueprintId();
    } else {
        // Fallback to direct localStorage access
        diagnosticId = localStorage.getItem('aivory_diagnostic_id');
        snapshotId = localStorage.getItem('aivory_snapshot_id');
        blueprintId = localStorage.getItem('aivory_blueprint_id');
    }
    
    // If no IDs to migrate, skip
    if (!diagnosticId && !snapshotId && !blueprintId) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(
            `${window.API_BASE_URL}/api/v1/auth/migrate-ids?` + 
            (diagnosticId ? `diagnostic_id=${diagnosticId}&` : '') +
            (snapshotId ? `snapshot_id=${snapshotId}&` : '') +
            (blueprintId ? `blueprint_id=${blueprintId}` : ''),
            { method: 'POST' }
        );
        
        if (response.ok) {
            const result = await response.json();
            console.log('✓ IDs migrated to user account:', result.migrated);
        }
        
    } catch (error) {
        console.error('ID migration failed:', error);
    }
}

// ============================================================================
// AUTHENTICATION GUARDS
// ============================================================================

/**
 * Require authentication - redirect to login if not authenticated
 */
function requireAuth(redirectUrl = null) {
    if (!isAuthenticated()) {
        // Show login modal instead of redirecting
        if (typeof showLoginModal === 'function') {
            showLoginModal();
        } else {
            alert('Please log in to continue');
        }
        return false;
    }
    return true;
}

/**
 * Check if user can access paid feature
 */
function canAccessPaidFeature() {
    if (!isAuthenticated()) {
        return false;
    }
    
    // Super admin can access everything
    if (isSuperAdmin()) {
        return true;
    }
    
    // Check if user has paid account
    return currentUser.account_type === 'paid';
}

// ============================================================================
// EXPORT
// ============================================================================

const AuthManager = {
    // Initialization
    init: initAuthState,
    
    // Authentication
    register,
    login,
    logout,
    getCurrentUser,
    
    // State
    isAuthenticated,
    getUser,
    getUserId,
    isSuperAdmin,
    onAuthStateChange,
    
    // Token management
    getAccessToken,
    getRefreshToken,
    setTokens,
    setUser,
    refreshAccessToken,
    authenticatedFetch,
    
    // ID migration
    migrateLocalStorageIds,
    
    // Guards
    requireAuth,
    canAccessPaidFeature
};

// Make globally available
window.AuthManager = AuthManager;

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthState);
} else {
    initAuthState();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
