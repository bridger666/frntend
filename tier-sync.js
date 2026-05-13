/**
 * Tier Synchronization Script
 * Ensures consistent tier display across all dashboard pages
 * Reads from authenticated user data in localStorage
 */

// Tier display mapping
const TIER_DISPLAY_MAP = {
    'free': 'Free',
    'snapshot': 'Snapshot',
    'blueprint': 'Blueprint',
    'foundation': 'Foundation',
    'builder': 'Builder',
    'operator': 'Operator',
    'pro': 'Pro',
    'enterprise': 'Enterprise',
    'super_admin': 'Enterprise' // Super admin shows as Enterprise
};

// Tier credits mapping
const TIER_CREDITS_MAP = {
    'free': 0,
    'snapshot': 0,
    'blueprint': 0,
    'foundation': 50,
    'builder': 50,
    'operator': 300,
    'pro': 300,
    'enterprise': 2000,
    'super_admin': 2000
};

/**
 * Get user tier from authentication data
 * Priority: UserStateManager > AuthManager > sessionStorage > default
 */
function getUserTier() {
    // 1. Check UserStateManager (highest priority - enriched backend data)
    if (typeof UserStateManager !== 'undefined' && UserStateManager.isLoaded()) {
        const tier = UserStateManager.getTier();
        if (tier) {
            return tier.toLowerCase();
        }
    }
    
    // 2. Check AuthManager user data
    if (typeof AuthManager !== 'undefined' && AuthManager.isAuthenticated()) {
        const user = AuthManager.getUser();
        if (user && user.tier) {
            return user.tier.toLowerCase();
        }
    }
    
    // 3. Check session storage
    const sessionTier = sessionStorage.getItem('user_tier');
    if (sessionTier) {
        return sessionTier.toLowerCase();
    }
    
    // 4. Default to free
    return 'free';
}

/**
 * Get user role from authentication data
 */
function getUserRole() {
    return localStorage.getItem('aivory_role') || 'user';
}

/**
 * Get username from authentication data
 */
function getUsername() {
    return localStorage.getItem('aivory_username') || sessionStorage.getItem('username') || 'Guest';
}

/**
 * Get tier display name
 */
function getTierDisplayName(tier) {
    return TIER_DISPLAY_MAP[tier] || 'Free';
}

/**
 * Get tier credits
 */
function getTierCredits(tier) {
    return TIER_CREDITS_MAP[tier] || 0;
}

/**
 * Update all tier displays on the page
 */
function updateTierDisplays() {
    const tier = getUserTier();
    const tierDisplay = getTierDisplayName(tier);
    const tierCredits = getTierCredits(tier);
    
    // Update all tier badge elements
    const tierBadges = document.querySelectorAll('#tierBadgeTop, #contextTier, .tier-badge');
    tierBadges.forEach(badge => {
        if (badge) {
            badge.textContent = tierDisplay;
            // Add tier-specific class for styling
            badge.className = badge.className.replace(/tier-\w+/g, '');
            badge.classList.add(`tier-${tier}`);
        }
    });
    
    // DON'T update credits here - console.js manages dynamic credit values
    // Only update credits on initial page load, not on visibility changes
    
    // Store tier in sessionStorage for backward compatibility
    sessionStorage.setItem('user_tier', tier);
    
    console.log(`Tier synchronized: ${tierDisplay} (${tier})`);
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return !!localStorage.getItem('aivory_session_token');
}

/**
 * Add logout button if authenticated
 */
function addLogoutButton() {
    if (!isAuthenticated()) {
        return;
    }
    
    const username = getUsername();
    const topbarRight = document.querySelector('.topbar-right');
    
    if (!topbarRight) {
        return;
    }
    
    // Check if logout button already exists
    if (document.getElementById('logoutButton')) {
        return;
    }
    
    // Add user info and logout button
    const userSection = document.createElement('div');
    userSection.className = 'topbar-stat';
    userSection.id = 'logoutButton';
    userSection.innerHTML = `
        <span class="topbar-stat-label">${username}</span>
        <button 
            onclick="handleLogout()" 
            style="
                padding: 0.5rem 1.5rem;
                font-size: 0.875rem;
                margin-left: 0.75rem;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 9999px;
                color: white;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
            "
            onmouseover="this.style.background='rgba(255, 255, 255, 0.12)'; this.style.borderColor='rgba(255, 255, 255, 0.25)'"
            onmouseout="this.style.background='rgba(255, 255, 255, 0.08)'; this.style.borderColor='rgba(255, 255, 255, 0.15)'"
        >
            Logout
        </button>
    `;
    
    topbarRight.appendChild(userSection);
}

/**
 * Handle logout
 */
async function handleLogout() {
    const token = localStorage.getItem('aivory_session_token');
    
    if (token) {
        try {
            // Call logout API
            await fetch('http://localhost:8081/api/v1/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    // Clear all auth data
    localStorage.removeItem('aivory_session_token');
    localStorage.removeItem('aivory_username');
    localStorage.removeItem('aivory_tier');
    localStorage.removeItem('aivory_role');
    sessionStorage.clear();
    
    // Redirect to homepage
    window.location.href = 'index.html';
}

/**
 * Initialize credits display on page load only
 */
function initializeCreditsDisplay() {
    const tier = getUserTier();
    const tierCredits = getTierCredits(tier);
    
    // Set initial credits display (will be updated by console.js after API calls)
    const creditsDisplays = document.querySelectorAll('#creditsDisplay, #contextCredits');
    creditsDisplays.forEach(display => {
        if (display) {
            // Check if this is the context panel (shows X / Y format)
            if (display.id === 'contextCredits') {
                display.textContent = `${tierCredits} / ${tierCredits}`;
            } else {
                display.textContent = tierCredits.toString();
            }
        }
    });
    
    // Update credit meter if it exists
    const creditMeter = document.getElementById('creditMeterFill');
    if (creditMeter && tierCredits > 0) {
        const percentage = 100; // Start at 100%
        creditMeter.style.width = `${percentage}%`;
    }
}

// Initialize on page load - wait for UserStateManager
document.addEventListener('DOMContentLoaded', () => {
    // Wait for UserStateManager to load before syncing tier
    if (typeof UserStateManager !== 'undefined') {
        UserStateManager.subscribe(() => {
            updateTierDisplays();
            initializeCreditsDisplay();
        });
    } else {
        // Fallback if UserStateManager not available
        updateTierDisplays();
        initializeCreditsDisplay();
    }
    addLogoutButton();
});

// Only update tier badges when page becomes visible, NOT credits
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateTierDisplays(); // Only updates tier badges, not credits
    }
});
