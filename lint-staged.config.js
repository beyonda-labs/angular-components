/*
 * Windows caps a command line at ~8 KB, so a bulk commit would blow past it if every staged path were
 * passed at once. Each task is split into chunks instead.
 */

const CHUNK_SIZE = 30;

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

module.exports = {
    '*.{ts,html}': files => [...chunked('eslint --fix', files), ...chunked('prettier --write', files)],
    '*.css': files => [...chunked('stylelint --fix', files), ...chunked('prettier --write', files)],
    '*.json': files => chunked('prettier --write', files)
};
