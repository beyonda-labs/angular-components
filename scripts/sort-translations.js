/*
 * Sort all `.en.json` and `.es.json` translation files alphabetically (deep),
 * rewriting only the files whose content changes.
 */

const fs = require('fs');
const path = require('path');

const sourceDirs = [
    path.resolve(__dirname, '../src/lib/components'),
    path.resolve(__dirname, '../src/lib/internal'),
    path.resolve(__dirname, '../src/lib/services')
];

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

/** Return a copy of `obj` with its keys (and nested keys) sorted alphabetically. */
function sortObjectDeep(obj) {
    if (Array.isArray(obj)) return obj.map(sortObjectDeep);
    if (!(obj instanceof Object)) return obj;

    return Object.keys(obj)
        .sort((a, b) => a.localeCompare(b))
        .reduce((acc, key) => {
            acc[key] = sortObjectDeep(obj[key]);
            return acc;
        }, {});
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

function sortTranslations() {
    const files = languages.flatMap(lang =>
        sourceDirs.flatMap(dir => findFilesRecursively(dir, `.${lang}.json`))
    );

    let sortedCount = 0;

    files.forEach(filePath => {
        let json;
        try {
            json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (err) {
            throw new Error(`Invalid JSON in: ${filePath}\n  ${err.message}`);
        }

        const sorted = `${JSON.stringify(sortObjectDeep(json), null, 4)}\n`;
        const current = fs.readFileSync(filePath, 'utf8');

        if (sorted !== current) {
            fs.writeFileSync(filePath, sorted, 'utf8');
            sortedCount++;
        }
    });

    console.log(`✔ Sorted translations in ${sortedCount} of ${files.length} files`);
}

module.exports = {
    sortObjectDeep,
    sortTranslations
};

if (require.main === module) {
    try {
        sortTranslations();
    } catch (error) {
        console.error(`✖ ${error.message}`);
        process.exit(1);
    }
}
