/**
 * Verification Script for API_BASE_URL Fix
 * 
 * Run this in browser console after page load to verify all functions are defined
 */

console.log('='.repeat(60));
console.log('AIVORY FIX VERIFICATION');
console.log('='.repeat(60));

// Check global config
console.log('\n1. Global Configuration:');
console.log('   window.API_BASE_URL:', window.API_BASE_URL);
console.log('   window.AIVORY_CONFIG:', window.AIVORY_CONFIG);

// Check critical functions
console.log('\n2. Critical Functions:');
const functions = [
    'startFreeDiagnostic',
    'startSnapshot',
    'startBlueprint',
    'handleSignInClick',
    'handleDashboardClick',
    'showSection',
    'selectPlan',
    'addCredits'
];

let allDefined = true;
functions.forEach(funcName => {
    const isDefined = typeof window[funcName] === 'function';
    const status = isDefined ? '✅' : '❌';
    console.log(`   ${status} ${funcName}: ${typeof window[funcName]}`);
    if (!isDefined) allDefined = false;
});

// Check AuthManager
console.log('\n3. AuthManager:');
if (typeof AuthManager !== 'undefined') {
    console.log('   ✅ AuthManager defined');
    console.log('   - isAuthenticated:', typeof AuthManager.isAuthenticated);
    console.log('   - login:', typeof AuthManager.login);
    console.log('   - logout:', typeof AuthManager.logout);
} else {
    console.log('   ❌ AuthManager NOT defined');
    allDefined = false;
}

// Check IDChainManager
console.log('\n4. IDChainManager:');
if (typeof IDChainManager !== 'undefined') {
    console.log('   ✅ IDChainManager defined');
    console.log('   - storeDiagnosticData:', typeof IDChainManager.storeDiagnosticData);
    console.log('   - getDiagnosticId:', typeof IDChainManager.getDiagnosticId);
} else {
    console.log('   ❌ IDChainManager NOT defined');
    allDefined = false;
}

// Final result
console.log('\n' + '='.repeat(60));
if (allDefined) {
    console.log('✅ ALL CHECKS PASSED - Fix successful!');
    console.log('All CTA buttons should now work correctly.');
} else {
    console.log('❌ SOME CHECKS FAILED - Please clear cache and reload');
    console.log('Mac: Cmd+Shift+R | Windows: Ctrl+Shift+R');
}
console.log('='.repeat(60));
