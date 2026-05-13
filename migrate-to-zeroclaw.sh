#!/bin/bash
#
# Zeroclaw Migration Script
# Migrates frontend from Zenclaw (port 8080) to Zeroclaw (port 3100)
#

set -e

echo "========================================="
echo "Zeroclaw Migration Script"
echo "========================================="
echo ""

# Check we're in the frontend directory
if [ ! -f "console-streaming.js" ]; then
    echo "Error: console-streaming.js not found"
    echo "Please run this script from the frontend directory"
    exit 1
fi

if [ ! -f "apply-patch.js" ]; then
    echo "Error: apply-patch.js not found"
    echo "Please ensure apply-patch.js is in the frontend directory"
    exit 1
fi

# Backup original
echo "Creating backup..."
cp console-streaming.js console-streaming-zenclaw-backup.js
echo "✓ Backed up to console-streaming-zenclaw-backup.js"
echo ""

# 1. Update header comment
echo "[1/7] Updating header comment..."
cat > /tmp/zeroclaw-header.js << 'EOF'
/**
 * AIVORY AI Console - Zeroclaw Integration
 * Handles message streaming and API communication
 */
EOF
node apply-patch.js console-streaming.js 1 4 /tmp/zeroclaw-header.js
echo "✓ Header updated"

# 2. Update constants
echo "[2/7] Updating endpoint constants..."
cat > /tmp/zeroclaw-constants.js << 'EOF'
const ZEROCLAW_ENDPOINT = 'http://43.156.108.96:3100/webhook';
const ZEROCLAW_TRIGGER_ENDPOINT = 'http://43.156.108.96:3100/webhook';
EOF
node apply-patch.js console-streaming.js 10 11 /tmp/zeroclaw-constants.js
echo "✓ Constants updated (port 8080 → 3100)"

# 3. Update connection test function
echo "[3/7] Updating connection test function..."
cat > /tmp/zeroclaw-test.js << 'EOF'
async function testZeroclawConnection() {
    try {
        const response = await fetch(ZEROCLAW_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'ping',
                history: [],
                system_prompt: 'Reply with "pong"'
            })
        });
        
        if (response.ok) {
            console.log('✅ Zeroclaw connection successful');
            return true;
        } else {
            console.warn('⚠️ Zeroclaw returned status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Zeroclaw connection failed:', error.message);
        console.error('Endpoint:', ZEROCLAW_ENDPOINT);
        console.error('This could be due to:');
        console.error('  1. CORS policy blocking the request');
        console.error('  2. Network/firewall blocking the connection');
        console.error('  3. Server is temporarily unavailable');
        return false;
    }
}
EOF
node apply-patch.js console-streaming.js 20 48 /tmp/zeroclaw-test.js
echo "✓ Connection test function updated"

# 4. Update test call
echo "[4/7] Updating connection test call..."
cat > /tmp/zeroclaw-test-call.js << 'EOF'
        setTimeout(() => testZeroclawConnection(), 1000);
EOF
node apply-patch.js console-streaming.js 53 53 /tmp/zeroclaw-test-call.js
echo "✓ Test call updated"

# 5. Update section comment
echo "[5/7] Updating section comment..."
cat > /tmp/zeroclaw-section.js << 'EOF'
// ============================================================================
// MESSAGE SENDING WITH ZEROCLAW
// ============================================================================
EOF
node apply-patch.js console-streaming.js 57 59 /tmp/zeroclaw-section.js
echo "✓ Section comment updated"

# 6. Update fetch call
echo "[6/7] Updating fetch endpoint..."
cat > /tmp/zeroclaw-fetch.js << 'EOF'
        const response = await fetch(ZEROCLAW_ENDPOINT, {
EOF
node apply-patch.js console-streaming.js 78 78 /tmp/zeroclaw-fetch.js
echo "✓ Fetch endpoint updated"

# 7. Update error message
echo "[7/7] Updating error messages..."
cat > /tmp/zeroclaw-error.js << 'EOF'
        console.error('Zeroclaw fetch error:', error);
        addMessage('assistant', `⚠️ Connection error: ${error.message}\n\nUnable to reach Zeroclaw AI service at ${ZEROCLAW_ENDPOINT}. Please check that the Zeroclaw server is running on port 3100.`);
EOF
node apply-patch.js console-streaming.js 141 142 /tmp/zeroclaw-error.js
echo "✓ Error messages updated"

# Cleanup temp files
rm -f /tmp/zeroclaw-*.js

echo ""
echo "========================================="
echo "✅ Migration Complete!"
echo "========================================="
echo ""
echo "Changes made:"
echo "  • Zenclaw → Zeroclaw (all references)"
echo "  • Port 8080 → Port 3100"
echo "  • Endpoint: /chat → /webhook"
echo ""
echo "Backup saved to:"
echo "  console-streaming-zenclaw-backup.js"
echo ""
echo "Next steps:"
echo "  1. Verify changes: grep -n 'ZEROCLAW' console-streaming.js"
echo "  2. Test in browser: http://localhost:3000/console"
echo "  3. Check browser console for connection test"
echo ""
echo "Rollback command (if needed):"
echo "  cp console-streaming-zenclaw-backup.js console-streaming.js"
echo ""
echo "========================================="
