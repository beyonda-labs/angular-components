const { spawn } = require('node:child_process');
const { existsSync, watch } = require('node:fs');
const path = require('node:path');

const { checkTranslations, sourceDirs } = require('./check-translations');
const { mergeTranslations } = require('./merge-translations');
const { copyI18nFiles } = require('./update-translations');

const WATCH_DEBOUNCE_MS = 250;
const TRANSLATION_FILE_PATTERN = /\.(en|es)\.json$/;

let debounceTimer = null;
let isPipelineRunning = false;
let hasPendingRun = false;

function isTranslationFile(fileName) {
    return TRANSLATION_FILE_PATTERN.test(fileName);
}

async function runI18nPipeline(reason) {
    if (isPipelineRunning) {
        hasPendingRun = true;
        return;
    }

    isPipelineRunning = true;

    console.log(`[i18n] ${reason}`);

    try {
        checkTranslations();
        mergeTranslations();
        await copyI18nFiles();

        console.log('[i18n] Bundle actualizado');
    } catch (error) {
        const message = error instanceof Error ? (error.stack ?? error.message) : String(error);

        console.error('[i18n] Error actualizando traducciones');
        console.error(message);
    } finally {
        isPipelineRunning = false;

        if (hasPendingRun) {
            hasPendingRun = false;
            await runI18nPipeline('Reintentando cambios pendientes');
        }
    }
}

function scheduleI18nPipeline(fileName) {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
        debounceTimer = null;
        void runI18nPipeline(`Cambio detectado en ${fileName}`);
    }, WATCH_DEBOUNCE_MS);
}

function createTranslationWatchers() {
    return sourceDirs.flatMap(sourceDir => {
        const absoluteSourceDir = path.resolve(sourceDir);

        if (!existsSync(absoluteSourceDir)) {
            console.log(`[watch] Omitiendo ruta inexistente: ${absoluteSourceDir}`);
            return [];
        }

        return watch(absoluteSourceDir, { recursive: true }, (_eventType, fileName) => {
            if (!fileName) return;

            const normalizedFileName = fileName.toString().replace(/\\/g, '/');

            if (!isTranslationFile(normalizedFileName)) return;

            console.log(`[watch] ${normalizedFileName}`);
            scheduleI18nPipeline(normalizedFileName);
        });
    });
}

function startAngularBuildWatch() {
    const command = process.platform === 'win32' ? 'cmd.exe' : 'npx';
    const args =
        process.platform === 'win32'
            ? ['/d', '/s', '/c', 'npx ng build --watch --configuration=development']
            : ['ng', 'build', '--watch', '--configuration=development'];

    const childProcess = spawn(command, args, {
        stdio: 'inherit',
        shell: false
    });

    childProcess.once('exit', code => {
        process.exit(code ?? 0);
    });

    return childProcess;
}

async function main() {
    await runI18nPipeline('Generando traducciones iniciales');

    const watchers = createTranslationWatchers();
    const buildProcess = startAngularBuildWatch();

    const shutdown = signal => {
        console.log(`[watch] Cerrando por ${signal}`);

        for (const watcher of watchers) {
            watcher.close();
        }

        buildProcess.kill(signal);
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
}

void main();
