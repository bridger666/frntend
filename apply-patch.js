#!/usr/bin/env node
/**
 * Universal Line-Range Patcher for JavaScript Files
 * 
 * Usage: node apply-patch.js <file> <startLine> <endLine> <replacementFile>
 * 
 * Example:
 *   node apply-patch.js console.js 210 245 /tmp/new-block.js
 * 
 * Line numbers are 1-based (matching `nl -ba` output).
 * Replaces lines startLine..endLine (inclusive) with content from replacementFile.
 */

const fs = require('fs');
const path = require('path');

function main() {
    // Parse arguments
    const args = process.argv.slice(2);
    
    if (args.length !== 4) {
        console.error('Usage: node apply-patch.js <file> <startLine> <endLine> <replacementFile>');
        console.error('');
        console.error('Example:');
        console.error('  node apply-patch.js console.js 210 245 /tmp/new-block.js');
        console.error('');
        console.error('Line numbers are 1-based (matching nl -ba output).');
        process.exit(1);
    }
    
    const [targetFile, startLineStr, endLineStr, replacementFile] = args;
    const startLine = parseInt(startLineStr, 10);
    const endLine = parseInt(endLineStr, 10);
    
    // Validate inputs
    if (isNaN(startLine) || isNaN(endLine)) {
        console.error('Error: startLine and endLine must be integers');
        process.exit(1);
    }
    
    if (startLine < 1 || endLine < 1) {
        console.error('Error: Line numbers must be >= 1 (1-based indexing)');
        process.exit(1);
    }
    
    if (startLine > endLine) {
        console.error('Error: startLine must be <= endLine');
        process.exit(1);
    }
    
    if (!fs.existsSync(targetFile)) {
        console.error(`Error: Target file not found: ${targetFile}`);
        process.exit(1);
    }
    
    if (!fs.existsSync(replacementFile)) {
        console.error(`Error: Replacement file not found: ${replacementFile}`);
        process.exit(1);
    }
    
    // Read files
    const targetContent = fs.readFileSync(targetFile, 'utf8');
    const replacementContent = fs.readFileSync(replacementFile, 'utf8');
    
    // Split into lines (preserve line endings)
    const targetLines = targetContent.split('\n');
    const totalLines = targetLines.length;
    
    // Validate line range
    if (startLine > totalLines) {
        console.error(`Error: startLine ${startLine} exceeds file length ${totalLines}`);
        process.exit(1);
    }
    
    if (endLine > totalLines) {
        console.error(`Error: endLine ${endLine} exceeds file length ${totalLines}`);
        process.exit(1);
    }
    
    // Create backup
    const backupFile = `${targetFile}.backup`;
    fs.writeFileSync(backupFile, targetContent, 'utf8');
    console.log(`✓ Created backup: ${backupFile}`);
    
    // Build new content
    // Lines before replacement (1-based to 0-based: line 1 = index 0)
    const before = targetLines.slice(0, startLine - 1);
    
    // Lines after replacement (endLine is inclusive, so we start at endLine)
    const after = targetLines.slice(endLine);
    
    // Replacement content (remove trailing newline if present to avoid double newlines)
    let replacement = replacementContent;
    if (replacement.endsWith('\n')) {
        replacement = replacement.slice(0, -1);
    }
    
    // Combine
    const newContent = [
        ...before,
        replacement,
        ...after
    ].join('\n');
    
    // Write result
    fs.writeFileSync(targetFile, newContent, 'utf8');
    
    // Report
    const linesReplaced = endLine - startLine + 1;
    const replacementLines = replacement.split('\n').length;
    
    console.log(`✓ Patched ${targetFile}`);
    console.log(`  Replaced lines ${startLine}-${endLine} (${linesReplaced} lines)`);
    console.log(`  With ${replacementLines} lines from ${replacementFile}`);
    console.log(`  Total lines: ${totalLines} → ${before.length + replacementLines + after.length}`);
}

main();
