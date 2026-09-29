import { config } from 'rxjs';

const SHOWN_ERROR_HANDLERS = new WeakSet<(error: unknown) => void>();
const SHOWN_ERRORS = new WeakSet<object>();

export function ignoreShownErrors(): void {
    const previous = config.onUnhandledError;

    if (previous && SHOWN_ERROR_HANDLERS.has(previous)) {
        return;
    }

    const handler = (error: unknown): void => {
        if (isShown(error)) {
            return;
        }

        if (!previous) {
            throw error;
        }

        previous(error);
    };

    SHOWN_ERROR_HANDLERS.add(handler);
    config.onUnhandledError = handler;
}

export function markAsShown<T>(error: T): T {
    if (isObject(error)) {
        SHOWN_ERRORS.add(error);
    }

    return error;
}

function isObject(value: unknown): value is object {
    return typeof value === 'object' && value !== null;
}

function isShown(error: unknown): boolean {
    return isObject(error) && SHOWN_ERRORS.has(error);
}
