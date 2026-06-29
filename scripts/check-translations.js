/*
 * Verify that every `.en.json` translation file has a corresponding `.es.json`
 * and that both files share the same key structure.
 *
 * Aborts on:
 *   - Missing `.es.json` file
 *   - Missing keys in `.es.json`
 */

const fs = require('fs');
const path = require('path');

const sourceDirs = [path.resolve(__dirname, '../src/lib/components'), path.resolve(__dirname, '../src/lib/internal')];

const BASE_LANG = 'en';
const TARGET_LANG = 'es';

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/** Recursively collect files ending with a given extension. */
function findFilesRecursively(dir, extension) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).flatMap(entry => {
        const full = path.join(dir, entry);
        return fs.statSync(full).isDirectory()
            ? findFilesRecursively(full, extension)
            : entry.endsWith(extension)
              ? [full]
              : [];
    });
}

/** Recursively collect all key paths from an object. */
function collectKeys(obj, prefix = '') {
    return Object.keys(obj).flatMap(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        return obj[key] instanceof Object && !Array.isArray(obj[key]) ? collectKeys(obj[key], fullKey) : fullKey;
    });
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

function checkTranslations() {
    const enExtension = `.${BASE_LANG}.json`;
    const enFiles = sourceDirs.flatMap(dir => findFilesRecursively(dir, enExtension));

    let hasErrors = false;

    enFiles.forEach(enFile => {
        const esFile = enFile.replace(enExtension, `.${TARGET_LANG}.json`);

        // Check existence
        if (!fs.existsSync(esFile)) {
            console.error(`✖ Missing translation file: ${esFile}`);
            hasErrors = true;
            return;
        }

        // Parse JSON files
        let enJson, esJson;
        try {
            enJson = JSON.parse(fs.readFileSync(enFile, 'utf8'));
            esJson = JSON.parse(fs.readFileSync(esFile, 'utf8'));
        } catch (err) {
            console.error(`✖ Invalid JSON:\n  ${err.message}`);
            hasErrors = true;
            return;
        }

        // Compare keys
        const enKeys = collectKeys(enJson);
        const esKeys = new Set(collectKeys(esJson));

        const missingKeys = enKeys.filter(key => !esKeys.has(key));

        if (missingKeys.length > 0) {
            console.error(`✖ Missing keys in ${path.basename(esFile)}:`);
            missingKeys.forEach(k => console.error(`  - ${k}`));
            hasErrors = true;
        }
    });

    if (hasErrors) {
        throw new Error('i18n check failed');
    }

    console.log('✔ All translation files are consistent');
}

module.exports = {
    checkTranslations,
    sourceDirs
};

if (require.main === module) {
    try {
        checkTranslations();
    } catch (error) {
        console.error(`\n✖ ${error.message}`);
        process.exit(1);
    }
}
