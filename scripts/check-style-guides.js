/*
 * Verify that every component module documents itself.
 *
 * Aborts when a module:
 *   - has no `docs/style-guide/` folder
 *   - has a style-guide that is not registered in the global style-guide component
 *   - has no `docs/<module>-readme.md`
 */

const fs = require('fs');
const path = require('path');

const componentsDir = path.resolve(__dirname, '../src/lib/components');
const globalStyleGuideDir = path.join(componentsDir, 'style-guide');

/* Modules that are infrastructure rather than a documented component. */
const EXEMPT = new Set(['style-guide']);

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/** Every module folder directly under `components/`. */
function findModules() {
    return fs
        .readdirSync(componentsDir)
        .filter(entry => fs.statSync(path.join(componentsDir, entry)).isDirectory())
        .filter(entry => !EXEMPT.has(entry))
        .sort();
}

/** The text of the global style-guide component and its template. */
function readGlobalStyleGuide() {
    return ['style-guide.component.ts', 'style-guide.component.html']
        .map(file => path.join(globalStyleGuideDir, file))
        .filter(file => fs.existsSync(file))
        .map(file => fs.readFileSync(file, 'utf8'))
        .join('\n');
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

function checkStyleGuides() {
    const globalStyleGuide = readGlobalStyleGuide();
    const errors = [];

    findModules().forEach(module => {
        const moduleDir = path.join(componentsDir, module);
        const styleGuideDir = path.join(moduleDir, 'docs', 'style-guide');
        const readme = path.join(moduleDir, 'docs', `${module}-readme.md`);

        if (!fs.existsSync(styleGuideDir)) {
            errors.push(`${module}: no docs/style-guide/`);
        } else if (!globalStyleGuide.includes(`bey-${module}-style-guide`)) {
            errors.push(`${module}: style-guide exists but is not registered in the global style-guide`);
        }

        if (!fs.existsSync(readme)) {
            errors.push(`${module}: no docs/${module}-readme.md`);
        }
    });

    if (errors.length > 0) {
        errors.forEach(error => console.error(`✖ ${error}`));
        throw new Error(`${errors.length} module(s) are not documented`);
    }

    console.log('✔ Every module has a style-guide and a readme');
}

module.exports = {
    checkStyleGuides
};

if (require.main === module) {
    try {
        checkStyleGuides();
    } catch (error) {
        console.error(`\n✖ ${error.message}`);
        process.exit(1);
    }
}
