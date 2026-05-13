/**
 * ID Chain Manager
 * 
 * Manages the complete data handoff pipeline ID chain:
 * diagnostic_id → snapshot_id → blueprint_id
 * 
 * Provides localStorage persistence, validation, and super admin utilities.
 */

// LocalStorage keys
const STORAGE_KEYS = {
    DIAGNOSTIC_ID: 'aivory_diagnostic_id',
    SNAPSHOT_ID: 'aivory_snapshot_id',
    BLUEPRINT_ID: 'aivory_blueprint_id',
    USER_CONTEXT: 'aivory_user_context'
};

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

/**
 * Store diagnostic ID and user context
 */
function storeDiagnosticData(diagnosticId, userContext = {}) {
    localStorage.setItem(STORAGE_KEYS.DIAGNOSTIC_ID, diagnosticId);
    
    if (userContext.user_email || userContext.company_name || userContext.industry) {
        localStorage.setItem(STORAGE_KEYS.USER_CONTEXT, JSON.stringify(userContext));
    }
    
    console.log('✓ Stored diagnostic_id:', diagnosticId);
    console.log('✓ Stored user_context:', userContext);
}

/**
 * Store snapshot ID
 */
function storeSnapshotId(snapshotId) {
    localStorage.setItem(STORAGE_KEYS.SNAPSHOT_ID, snapshotId);
    console.log('✓ Stored snapshot_id:', snapshotId);
}

/**
 * Store blueprint ID
 */
function storeBlueprintId(blueprintId) {
    localStorage.setItem(STORAGE_KEYS.BLUEPRINT_ID, blueprintId);
    console.log('✓ Stored blueprint_id:', blueprintId);
}

// ============================================================================
// RETRIEVAL FUNCTIONS
// ============================================================================

/**
 * Get diagnostic ID
 */
function getDiagnosticId() {
    return localStorage.getItem(STORAGE_KEYS.DIAGNOSTIC_ID);
}

/**
 * Get snapshot ID
 */
function getSnapshotId() {
    return localStorage.getItem(STORAGE_KEYS.SNAPSHOT_ID);
}

/**
 * Get blueprint ID
 */
function getBlueprintId() {
    return localStorage.getItem(STORAGE_KEYS.BLUEPRINT_ID);
}

/**
 * Get user context
 */
function getUserContext() {
    const contextStr = localStorage.getItem(STORAGE_KEYS.USER_CONTEXT);
    return contextStr ? JSON.parse(contextStr) : {};
}

/**
 * Get complete ID chain
 */
function getIdChain() {
    return {
        diagnostic_id: getDiagnosticId(),
        snapshot_id: getSnapshotId(),
        blueprint_id: getBlueprintId(),
        user_context: getUserContext()
    };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if diagnostic is complete
 */
function hasDiagnosticId() {
    return !!getDiagnosticId();
}

/**
 * Check if snapshot is complete
 */
function hasSnapshotId() {
    return !!getSnapshotId();
}

/**
 * Check if blueprint is complete
 */
function hasBlueprintId() {
    return !!getBlueprintId();
}

/**
 * Validate diagnostic ID exists, redirect if missing
 */
function requireDiagnosticId(redirectUrl = 'index.html') {
    if (!hasDiagnosticId()) {
        alert('Please complete the diagnostic first.');
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

/**
 * Validate snapshot ID exists, redirect if missing
 */
function requireSnapshotId(redirectUrl = 'index.html') {
    if (!hasSnapshotId()) {
        alert('Please complete the AI Snapshot first.');
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// ============================================================================
// CLEAR FUNCTIONS
// ============================================================================

/**
 * Clear all IDs (start fresh)
 */
function clearAllIds() {
    localStorage.removeItem(STORAGE_KEYS.DIAGNOSTIC_ID);
    localStorage.removeItem(STORAGE_KEYS.SNAPSHOT_ID);
    localStorage.removeItem(STORAGE_KEYS.BLUEPRINT_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_CONTEXT);
    console.log('✓ Cleared all IDs');
}

/**
 * Clear snapshot and blueprint IDs (keep diagnostic)
 */
function clearSnapshotAndBlueprint() {
    localStorage.removeItem(STORAGE_KEYS.SNAPSHOT_ID);
    localStorage.removeItem(STORAGE_KEYS.BLUEPRINT_ID);
    console.log('✓ Cleared snapshot and blueprint IDs');
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================

/**
 * Display ID chain in console
 */
function logIdChain() {
    const chain = getIdChain();
    console.log('🔗 ID CHAIN:');
    console.log('  diagnostic_id:', chain.diagnostic_id || '(not set)');
    console.log('       ↓');
    console.log('  snapshot_id:', chain.snapshot_id || '(not set)');
    console.log('       ↓');
    console.log('  blueprint_id:', chain.blueprint_id || '(not set)');
    console.log('  user_context:', chain.user_context);
}

/**
 * Create ID chain display element
 */
function createIdChainDisplay() {
    const chain = getIdChain();
    
    const container = document.createElement('div');
    container.id = 'id-chain-display';
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: #00ff00;
        padding: 15px;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    `;
    
    container.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px; color: #fff;">🔗 ID CHAIN</div>
        <div style="margin-bottom: 5px;">
            <span style="color: #888;">diagnostic_id:</span><br>
            <span style="color: ${chain.diagnostic_id ? '#00ff00' : '#ff0000'};">
                ${chain.diagnostic_id || '(not set)'}
            </span>
        </div>
        <div style="margin: 5px 0; color: #888;">↓</div>
        <div style="margin-bottom: 5px;">
            <span style="color: #888;">snapshot_id:</span><br>
            <span style="color: ${chain.snapshot_id ? '#00ff00' : '#ff0000'};">
                ${chain.snapshot_id || '(not set)'}
            </span>
        </div>
        <div style="margin: 5px 0; color: #888;">↓</div>
        <div style="margin-bottom: 5px;">
            <span style="color: #888;">blueprint_id:</span><br>
            <span style="color: ${chain.blueprint_id ? '#00ff00' : '#ff0000'};">
                ${chain.blueprint_id || '(not set)'}
            </span>
        </div>
        ${chain.user_context.company_name ? `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #333;">
                <span style="color: #888;">Company:</span><br>
                <span style="color: #00ff00;">${chain.user_context.company_name}</span>
            </div>
        ` : ''}
        <button onclick="IDChainManager.clearAllIds(); location.reload();" 
                style="margin-top: 10px; padding: 5px 10px; background: #ff0000; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
            Clear All IDs
        </button>
    `;
    
    return container;
}

/**
 * Show ID chain display on page
 */
function showIdChainDisplay() {
    // Remove existing display
    const existing = document.getElementById('id-chain-display');
    if (existing) {
        existing.remove();
    }
    
    // Add new display
    const display = createIdChainDisplay();
    document.body.appendChild(display);
}

// ============================================================================
// SUPER ADMIN UTILITIES
// ============================================================================

/**
 * Check if super admin mode is enabled via URL param
 */
function isSuperAdminMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('superadmin') === 'GrandMasterRCH';
}

/**
 * Load test IDs for super admin testing
 */
function loadTestIds() {
    if (!isSuperAdminMode()) {
        return false;
    }
    
    console.log('🔧 SUPER ADMIN MODE: Loading test IDs...');
    
    // Load from latest test run
    storeDiagnosticData('diag_t3n4myidyorn', {
        user_email: 'test@aivory.id',
        company_name: 'Aivory Test Corp',
        industry: 'Technology'
    });
    
    storeSnapshotId('snap_uk5fttxhm23k');
    
    console.log('✓ Test IDs loaded');
    logIdChain();
    
    return true;
}

/**
 * Initialize super admin mode if enabled
 */
function initSuperAdminMode() {
    if (isSuperAdminMode()) {
        console.log('🔧 SUPER ADMIN MODE ENABLED');
        
        // Add visual indicator
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff0000;
            color: #fff;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            z-index: 10001;
            font-size: 12px;
        `;
        indicator.textContent = '🔧 SUPER ADMIN MODE';
        document.body.appendChild(indicator);
        
        // Load test IDs
        loadTestIds();
        
        // Show ID chain
        showIdChainDisplay();
    }
}

// ============================================================================
// EXPORT
// ============================================================================

const IDChainManager = {
    // Storage
    storeDiagnosticData,
    storeSnapshotId,
    storeBlueprintId,
    
    // Retrieval
    getDiagnosticId,
    getSnapshotId,
    getBlueprintId,
    getUserContext,
    getIdChain,
    
    // Validation
    hasDiagnosticId,
    hasSnapshotId,
    hasBlueprintId,
    requireDiagnosticId,
    requireSnapshotId,
    
    // Clear
    clearAllIds,
    clearSnapshotAndBlueprint,
    
    // Display
    logIdChain,
    showIdChainDisplay,
    createIdChainDisplay,
    
    // Super Admin
    isSuperAdminMode,
    loadTestIds,
    initSuperAdminMode
};

// Make globally available
window.IDChainManager = IDChainManager;

// Auto-initialize super admin mode
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuperAdminMode);
} else {
    initSuperAdminMode();
}
