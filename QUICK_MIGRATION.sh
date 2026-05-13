#!/bin/bash
#
# Quick ARIA Migration Script
# Automates the migration from Zenclaw to ARIA n8n webhook
#

set -e

echo "========================================="
echo "ARIA n8n Migration Script"
echo "========================================="
echo ""

# Check we're in the frontend directory
if [ ! -f "console-streaming.js" ]; then
    echo "Error: console-streaming.js not found"
    echo "Please run this script from the frontend directory"
    exit 1
fi

# Step 1: Backup existing files
echo "Step 1: Creating backups..."
cp console-streaming.js console-streaming-zenclaw-backup.js
echo "✓ Backed up console-streaming.js"

# Step 2: Check if aria-client.js exists
if [ ! -f "aria-client.js" ]; then
    echo "Error: aria-client.js not found"
    echo "Please ensure aria-client.js is in the frontend directory"
    exit 1
fi

# Step 3: Replace console-streaming.js
echo ""
echo "Step 2: Replacing console-streaming.js..."
if [ -f "console-streaming-aria.js" ]; then
    cp console-streaming-aria.js console-streaming.js
    echo "✓ Replaced console-streaming.js with ARIA version"
else
    echo "Warning: console-streaming-aria.js not found"
    echo "Skipping console-streaming.js replacement"
fi

# Step 4: Update HTML files
echo ""
echo "Step 3: Checking HTML files..."
HTML_FILES=$(find . -maxdepth 2 -name "*.html" -type f)

for html_file in $HTML_FILES; do
    if grep -q "console-streaming.js" "$html_file"; then
        echo "Found console-streaming.js reference in: $html_file"
        
        # Check if aria-client.js is already included
        if ! grep -q "aria-client.js" "$html_file"; then
            echo "  → Need to add aria-client.js before console-streaming.js"
            echo "  → Manual update required for: $html_file"
            echo ""
            echo "  Add this line before <script src=\"console-streaming.js\">:"
            echo "  <script src=\"aria-client.js\"></script>"
            echo ""
        else
            echo "  ✓ aria-client.js already included"
        fi
    fi
done

# Step 5: Test connection
echo ""
echo "Step 4: Testing ARIA connection..."
echo "Open your browser console and run:"
echo ""
echo "  await window.AriaClient.testAriaConnection();"
echo ""

# Step 6: Summary
echo "========================================="
echo "Migration Steps Completed"
echo "========================================="
echo ""
echo "Files modified:"
echo "  ✓ console-streaming.js (backed up to console-streaming-zenclaw-backup.js)"
echo ""
echo "Next steps:"
echo "  1. Update HTML files to include aria-client.js"
echo "  2. Test the console in your browser"
echo "  3. Check browser console for any errors"
echo "  4. Verify requests go to 43.156.108.96:5678"
echo ""
echo "Rollback command (if needed):"
echo "  cp console-streaming-zenclaw-backup.js console-streaming.js"
echo ""
echo "========================================="
