/**
 * UserStateManager - Single Source of Truth for User State
 * Fetches from /api/v1/auth/me on load
 * All pages read from this
 */

const UserStateManager = {
    state: {
        user: null,
        userId: null,
        email: null,
        tier: 'free',
        credits: 0,
        creditsMax: 0,
        hasDiagnostic: false,
        hasSnapshot: false,
        hasBlueprint: false,
        isSubscribed: false,
        blueprintId: null,
        isLoaded: false,
        listeners: []
    },

    /**
     * Initialize and fetch user state
     * WAIT for AuthManager to be ready before proceeding
     */
    async init() {
        console.log('UserStateManager: Initializing...');
        
        // Wait for AuthManager to be ready
        if (!window.AuthManagerReady) {
            console.log('UserStateManager: Waiting for AuthManager...');
            await this.waitForAuthManager();
        }
        
        // Ensure API_BASE_URL is set (fallback if app.js hasn't loaded yet)
        if (!window.API_BASE_URL) {
            const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            window.API_BASE_URL = isDev ? 'http://localhost:8081' : window.location.origin;
            console.log('UserStateManager: Set API_BASE_URL to', window.API_BASE_URL);
        }
        
        // Check if user is authenticated
        if (typeof AuthManager === 'undefined') {
            console.error('❌ AuthManager not available');
            this.state.isLoaded = true;
            this.notifyListeners();
            return;
        }
        
        if (!AuthManager.isAuthenticated()) {
            console.log('ℹ️ User not authenticated');
            this.state.isLoaded = true;
            this.notifyListeners();
            return;
        }

        try {
            console.log('→ Fetching user state from /api/v1/auth/me');
            
            const response = await AuthManager.authenticatedFetch(
                `${window.API_BASE_URL}/api/v1/auth/me`
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Failed to fetch user state:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const userData = await response.json();
            console.log('✓ User state fetched successfully');
            
            // Map API fields to state properties - trust backend truth only
            this.state.user = userData;
            this.state.userId = userData.user_id;
            this.state.email = userData.email;
            this.state.tier = userData.tier;
            this.state.credits = userData.credits;
            this.state.creditsMax = userData.credits_max;
            this.state.hasDiagnostic = userData.has_diagnostic;
            this.state.hasSnapshot = userData.has_snapshot;
            this.state.hasBlueprint = userData.has_blueprint;
            this.state.isSubscribed = userData.is_subscribed;
            this.state.blueprintId = userData.blueprint_id || null;
            
            this.state.isLoaded = true;

            console.log('USER STATE LOADED:', {
                userId: this.state.userId,
                email: this.state.email,
                tier: this.state.tier,
                isSubscribed: this.state.isSubscribed,
                hasDiagnostic: this.state.hasDiagnostic,
                hasSnapshot: this.state.hasSnapshot,
                hasBlueprint: this.state.hasBlueprint,
                credits: `${this.state.credits} / ${this.state.creditsMax}`,
                blueprintId: this.state.blueprintId
            });
            
            // Store in sessionStorage for quick access
            sessionStorage.setItem('user_tier', this.state.tier);
            sessionStorage.setItem('user_credits', this.state.credits);
            
            // Fetch blueprint_id if user has blueprint and not already provided
            if (this.state.hasBlueprint && !this.state.blueprintId) {
                await this.fetchBlueprintId(userData.user_id);
            }
            
            this.notifyListeners();

        } catch (error) {
            console.error('❌ UserStateManager: Failed to load state', error);
            this.state.isLoaded = true;
            this.notifyListeners();
        }
    },

    /**
     * Wait for AuthManager to be ready
     */
    waitForAuthManager() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.AuthManagerReady) {
                    clearInterval(checkInterval);
                    console.log('✓ AuthManager is ready');
                    resolve();
                }
            }, 50); // Check every 50ms
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('⚠️ AuthManager ready timeout');
                resolve();
            }, 5000);
        });
    },

    /**
     * Get user state
     */
    getUserState() {
        return this.state;
    },

    /**
     * Get current tier
     */
    getTier() {
        return this.state.tier;
    },

    /**
     * Get current credits
     */
    getCredits() {
        return this.state.credits;
    },

    /**
     * Get user object
     */
    getUser() {
        return this.state.user;
    },

    /**
     * Check if state is loaded
     */
    isLoaded() {
        return this.state.isLoaded;
    },

    /**
     * Subscribe to state changes
     */
    subscribe(callback) {
        this.state.listeners.push(callback);
        // Immediately call with current state if loaded
        if (this.state.isLoaded) {
            callback(this.state);
        }
    },

    /**
     * Notify all listeners
     */
    notifyListeners() {
        this.state.listeners.forEach(callback => {
            try {
                callback(this.state);
            } catch (error) {
                console.error('UserStateManager: Listener error', error);
            }
        });
    },

    /**
     * Update credits (after consumption)
     */
    updateCredits(newCredits) {
        this.state.credits = newCredits;
        sessionStorage.setItem('user_credits', newCredits);
        this.notifyListeners();
    },

    /**
     * Fetch blueprint_id for user and store in sessionStorage
     */
    async fetchBlueprintId(userId) {
        try {
            const response = await fetch(`${window.API_BASE_URL}/api/v1/blueprint/list?user_id=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${AuthManager.getAccessToken()}`
                }
            });

            if (!response.ok) {
                console.warn('UserStateManager: Failed to fetch blueprint list');
                return;
            }

            const blueprints = await response.json();
            
            if (blueprints && blueprints.length > 0) {
                // Get the most recent blueprint
                const latestBlueprint = blueprints[0];
                sessionStorage.setItem('blueprint_id', latestBlueprint.blueprint_id);
                console.log('UserStateManager: Blueprint ID stored:', latestBlueprint.blueprint_id);
            }
        } catch (error) {
            console.error('UserStateManager: Failed to fetch blueprint_id', error);
        }
    },

    /**
     * Refresh state from server
     */
    async refresh() {
        await this.init();
    }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for AuthManager to be ready
        setTimeout(() => UserStateManager.init(), 100);
    });
} else {
    setTimeout(() => UserStateManager.init(), 100);
}

// Make globally available
window.UserStateManager = UserStateManager;
