/*
 * Verify the translation files against the rules in `rules/angular/i18n.md`.
 *
 * Aborts on:
 *   - Missing `.es.json` file
 *   - Missing keys in `.es.json`
 *   - The same key defined by two files, which the merge would silently collapse
 *   - Keys deeper than the agreed shape
 *
 * Warns on:
 *   - Key segments that are not kebab-case (a pending migration, not yet a failure)
 */

const fs = require('fs');
const path = require('path');

const sourceDirs = [
    path.resolve(__dirname, '../src/lib/components'),
    path.resolve(__dirname, '../src/lib/internal'),
    path.resolve(__dirname, '../src/lib/services')
];

const BASE_LANG = 'en';
const TARGET_LANG = 'es';
const MAX_DEPTH = 6;
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/u;

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

/** Read and parse a JSON file, or record the failure. */
function readJson(file, errors) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        errors.push(`Invalid JSON in ${file}\n  ${err.message}`);
        return undefined;
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

function checkTranslations() {
    const enExtension = `.${BASE_LANG}.json`;
    const enFiles = sourceDirs.flatMap(dir => findFilesRecursively(dir, enExtension));

    const errors = [];
    const warnings = [];
    const owners = new Map();

    enFiles.forEach(enFile => {
        const esFile = enFile.replace(enExtension, `.${TARGET_LANG}.json`);

        if (!fs.existsSync(esFile)) {
            errors.push(`Missing translation file: ${esFile}`);
            return;
        }

        const enJson = readJson(enFile, errors);
        const esJson = readJson(esFile, errors);

        if (!enJson || !esJson) return;

        const enKeys = collectKeys(enJson);
        const esKeys = new Set(collectKeys(esJson));

        enKeys
            .filter(key => !esKeys.has(key))
            .forEach(key => errors.push(`Missing key in ${path.basename(esFile)}: ${key}`));

        enKeys.forEach(key => {
            const segments = key.split('.');

            if (segments.length > MAX_DEPTH) {
                errors.push(`Key deeper than ${MAX_DEPTH} levels in ${path.basename(enFile)}: ${key}`);
            }

            segments
                .filter(segment => !KEBAB_CASE.test(segment))
                .forEach(segment => warnings.push(`Key segment is not kebab-case: ${key} (\`${segment}\`)`));

            const owner = owners.get(key);

            if (owner && owner !== enFile) {
                errors.push(`Key defined twice, the merge would keep only one: ${key}`);
                errors.push(`  ${path.relative(process.cwd(), owner)}`);
                errors.push(`  ${path.relative(process.cwd(), enFile)}`);
            }

            owners.set(key, enFile);
        });
    });

    if (warnings.length > 0) {
        console.warn(`⚠ ${warnings.length} key(s) still to migrate to kebab-case`);
    }

    if (errors.length > 0) {
        errors.forEach(error => console.error(`✖ ${error}`));
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
