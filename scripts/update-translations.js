/*
 * Copy the built i18n bundle(s) into the dist assets folder.
 */

const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '../src/lib/assets/i18n');
const destDir = path.join(__dirname, '../dist/assets/i18n');

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

async function copyI18nFiles() {
    try {
        // Ensure destination directory exists and copy recursively
        await fs.copy(sourceDir, destDir);

        console.log(`✔ i18n files copied → ${destDir}`);
    } catch (error) {
        // Print a readable error and fail the process (important for CI)
        console.error(`✖ Error copying i18n files from ${sourceDir} to ${destDir}`);
        console.error(error);

        process.exitCode = 1;
    }
}

module.exports = {
    copyI18nFiles
};

if (require.main === module) {
    copyI18nFiles();
}
