/*
 * Verify that every custom property read by the CSS resolves to something.
 *
 * A `var(--x)` with no definition and no fallback is not an error for the CSS
 * parser: the declaration is simply dropped, so a colour or a shadow silently
 * never paints. This check turns that into a failure.
 *
 * Aborts on:
 *   - A `--bey-*` read with neither a definition anywhere in the library nor a
 *     fallback value
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '../src/lib');

/* Bootstrap and third-party variables are defined outside this repo. */
const EXTERNAL_PREFIXES = ['--bs-'];

const DEFINITION = /^\s*(--[a-zA-Z0-9-]+)\s*:/gm;
const USAGE = /var\(\s*(--[a-zA-Z0-9-]+)\s*(,)?/g;

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

/** A property set from a template binding counts as defined. */
function collectTemplateDefinitions(files) {
    return files.flatMap(file =>
        [...fs.readFileSync(file, 'utf8').matchAll(/\[style\.(--[a-zA-Z0-9-]+)\]/g)].map(match => match[1])
    );
}

function isExternal(name) {
    return EXTERNAL_PREFIXES.some(prefix => name.startsWith(prefix));
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

function checkTokens() {
    const cssFiles = findFilesRecursively(sourceDir, '.css');
    const htmlFiles = findFilesRecursively(sourceDir, '.html');

    const defined = new Set(collectTemplateDefinitions(htmlFiles));
    const reads = [];

    cssFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');

        [...content.matchAll(DEFINITION)].forEach(match => defined.add(match[1]));

        [...content.matchAll(USAGE)]
            .filter(match => !match[2] && !isExternal(match[1]))
            .forEach(match => reads.push({ file, name: match[1] }));
    });

    const orphans = reads.filter(read => !defined.has(read.name));

    if (orphans.length > 0) {
        orphans.forEach(({ file, name }) =>
            console.error(`✖ ${name} is read but never defined, and has no fallback`)
        );
        orphans.forEach(({ file }) => console.error(`    ${path.relative(process.cwd(), file)}`));
        throw new Error(`${orphans.length} custom propert(ies) resolve to nothing`);
    }

    console.log(`✔ Every custom property read by the CSS resolves (${defined.size} defined)`);
}

module.exports = {
    checkTokens
};

if (require.main === module) {
    try {
        checkTokens();
    } catch (error) {
        console.error(`\n✖ ${error.message}`);
        process.exit(1);
    }
}
