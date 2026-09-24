/*
 * Two things this config has to handle:
 *
 * - Windows caps a command line at ~8 KB, so a bulk commit would blow past it if every staged
 *   path were passed at once. Each task is split into chunks instead.
 * - stylelint exits non-zero on any problem, whatever its severity, so it cannot be pointed at
 *   the CSS that predates the style rules. Those files are listed in stylelint-baseline.json and
 *   are skipped here; `pnpm run stylelint` still reports them.
 */

const path = require('path');

const { files: baseline } = require('./stylelint-baseline.json');

const CHUNK_SIZE = 30;

const baselinePaths = new Set(baseline.map(file => path.resolve(__dirname, file)));

function chunked(command, files) {
    const chunks = [];

    for (let index = 0; index < files.length; index += CHUNK_SIZE) {
        const batch = files
            .slice(index, index + CHUNK_SIZE)
            .map(file => `"${file}"`)
            .join(' ');

        chunks.push(`${command} ${batch}`);
    }

    return chunks;
}

function enforced(files) {
    return files.filter(file => !baselinePaths.has(path.resolve(file)));
}

module.exports = {
    '*.{ts,html}': files => [...chunked('eslint --fix', files), ...chunked('prettier --write', files)],
    '*.css': files => [...chunked('stylelint --fix', enforced(files)), ...chunked('prettier --write', files)],
    '*.json': files => chunked('prettier --write', files)
};
