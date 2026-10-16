const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u;
const DAY_DIGITS = 2;
const YEAR_DIGITS = 4;

export function dateInputValue(timestamp: unknown): string {
    if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
        return '';
    }

    const date = new Date(timestamp);

    return [
        String(date.getFullYear()).padStart(YEAR_DIGITS, '0'),
        String(date.getMonth() + 1).padStart(DAY_DIGITS, '0'),
        String(date.getDate()).padStart(DAY_DIGITS, '0')
    ].join('-');
}

export function dayEnd(value: string): number | null {
    const start = dayStart(value);

    if (start === null) {
        return null;
    }

    const next = new Date(start);

    next.setDate(next.getDate() + 1);

    return next.getTime() - 1;
}

export function dayStart(value: string): number | null {
    const match = DATE_INPUT_PATTERN.exec(value.trim());

    if (!match) {
        return null;
    }

    const [year, month, day] = match.slice(1).map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        ? date.getTime()
        : null;
}
