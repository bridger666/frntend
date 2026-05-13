/**
 * AIVORY AI Console - System Drawer
 * Collapsible right-side drawer for system information
 */

// Toggle system drawer
function toggleSystemDrawer() {
    const drawer = document.getElementById('systemDrawer');
    if (drawer) {
        drawer.classList.toggle('open');
        
        // Update drawer content when opening
        if (drawer.classList.contains('open')) {
            syncDrawerData();
        }
    }
}

// Sync data from topbar to drawer
function syncDrawerData() {
    // Sync tier
    const tierBadgeTop = document.getElementById('tierBadgeTop');
    const drawerTier = document.getElementById('drawerTier');
    if (tierBadgeTop && drawerTier) {
        drawerTier.textContent = tierBadgeTop.textContent;
    }
    
    // Sync credits
    const creditsDisplay = document.getElementById('creditsDisplay');
    const drawerCredits = document.getElementById('drawerCredits');
    if (creditsDisplay && drawerCredits) {
        const credits = creditsDisplay.textContent;
        drawerCredits.textContent = `${credits} / 300`;
    }
    
    // Sync credit meter
    const creditMeterFill = document.getElementById('creditMeterFill');
    const drawerMeterFill = document.getElementById('drawerMeterFill');
    if (creditMeterFill && drawerMeterFill) {
        drawerMeterFill.style.width = creditMeterFill.style.width;
    }
}

// Close drawer on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const drawer = document.getElementById('systemDrawer');
        if (drawer && drawer.classList.contains('open')) {
            toggleSystemDrawer();
        }
    }
});

// Sync drawer data when tier/credits update
if (typeof window.updateTierDisplay === 'function') {
    const originalUpdateTierDisplay = window.updateTierDisplay;
    window.updateTierDisplay = function(tier) {
        originalUpdateTierDisplay(tier);
        syncDrawerData();
    };
}

// Export for use in other scripts
window.toggleSystemDrawer = toggleSystemDrawer;
window.syncDrawerData = syncDrawerData;
