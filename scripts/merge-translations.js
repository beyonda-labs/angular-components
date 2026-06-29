/*
 * Merge i18n JSON files for each language and write a single bundle per lang.
 */

const fs = require('fs');
const path = require('path');

const sourceDirs = [
    path.resolve(__dirname, '../src/lib/components'),
    path.resolve(__dirname, '../src/lib/internal'),
    path.resolve(__dirname, '../src/lib/services')
];

const targetDir = path.resolve(__dirname, '../src/lib/assets/i18n');
const languages = ['en', 'es'];

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

/** Deep-merge `source` into `target` (objects only). */
function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && target[key] instanceof Object) {
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

function mergeTranslations() {
    fs.mkdirSync(targetDir, { recursive: true });

    languages.forEach(lang => {
        const extension = `.${lang}.json`;

        // Gather all JSON files for this language
        const files = sourceDirs.flatMap(dir => findFilesRecursively(dir, extension));

        // Merge them, validating each one
        const merged = files.reduce((acc, filePath) => {
            try {
                const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                return deepMerge(acc, json);
            } catch (err) {
                throw new Error(`Invalid JSON in: ${filePath}\n  ${err.message}`);
            }
        }, {});

        // Write output
        const outFile = path.join(targetDir, `angular-components.${lang}.json`);
        fs.writeFileSync(outFile, JSON.stringify(merged, null, 4), 'utf8');
        console.log(`✔ Merged translations for ${lang} → ${outFile}`);
    });
}

module.exports = {
    mergeTranslations
};

if (require.main === module) {
    try {
        mergeTranslations();
    } catch (error) {
        console.error(`✖ ${error.message}`);
        process.exit(1);
    }
}
