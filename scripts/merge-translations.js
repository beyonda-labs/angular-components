/*
 * Merge i18n JSON files for each language and write a single bundle per lang.
 */

const fs = require('fs');
const path = require('path');

const { sortObjectDeep } = require('./sort-translations');

const sourceDirs = [
    path.resolve(__dirname, '../src/lib/components'),
    path.resolve(__dirname, '../src/lib/internal'),
    path.resolve(__dirname, '../src/lib/services')
];

const targetDir = path.resolve(__dirname, '../src/lib/assets/i18n');
const styleGuideTargetDir = path.resolve(__dirname, '../src/lib/assets/i18n-style-guide');
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

/** Demo text: anything under a `docs/` folder, plus the global style-guide module itself. */
function isStyleGuideFile(filePath) {
    const segments = filePath.split(path.sep);

    return segments.includes('docs') || segments.includes('style-guide');
}

/** Merge a list of files into one object, validating each one. */
function mergeFiles(files) {
    return files.reduce((acc, filePath) => {
        try {
            const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return deepMerge(acc, json);
        } catch (err) {
            throw new Error(`Invalid JSON in: ${filePath}
  ${err.message}`);
        }
    }, {});
}

/** Write a merged bundle with alphabetically sorted keys. */
function writeBundle(dir, fileName, merged) {
    fs.mkdirSync(dir, { recursive: true });

    const outFile = path.join(dir, fileName);
    fs.writeFileSync(outFile, `${JSON.stringify(sortObjectDeep(merged), null, 4)}
`, 'utf8');
    console.log(`✔ ${outFile}`);

    return outFile;
}

function mergeTranslations() {
    languages.forEach(lang => {
        const extension = `.${lang}.json`;
        const files = sourceDirs.flatMap(dir => findFilesRecursively(dir, extension));

        const libraryFiles = files.filter(filePath => !isStyleGuideFile(filePath));
        const styleGuideFiles = files.filter(filePath => isStyleGuideFile(filePath));

        writeBundle(targetDir, `angular-components.${lang}.json`, mergeFiles(libraryFiles));
        writeBundle(styleGuideTargetDir, `angular-components-style-guide.${lang}.json`, mergeFiles(styleGuideFiles));
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
