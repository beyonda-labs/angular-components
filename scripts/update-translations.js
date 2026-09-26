/*
 * Copy the built i18n bundle(s) into the dist assets folder.
 */

const fs = require('fs-extra');
const path = require('path');

const bundles = [
    { source: path.join(__dirname, '../src/lib/assets/i18n'), dest: path.join(__dirname, '../dist/assets/i18n') },
    {
        source: path.join(__dirname, '../src/lib/assets/i18n-style-guide'),
        dest: path.join(__dirname, '../dist/assets/i18n-style-guide')
    }
];

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

async function copyI18nFiles() {
    for (const { source, dest } of bundles) {
        try {
            // Ensure destination directory exists and copy recursively
            await fs.copy(source, dest);

            console.log(`✔ i18n files copied → ${dest}`);
        } catch (error) {
            // Print a readable error and fail the process (important for CI)
            console.error(`✖ Error copying i18n files from ${source} to ${dest}`);
            console.error(error);

            process.exitCode = 1;
        }
    }
}

module.exports = {
    copyI18nFiles
};

if (require.main === module) {
    copyI18nFiles();
}
