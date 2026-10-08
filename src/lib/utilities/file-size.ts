const BYTES_PER_UNIT = 1024;
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];

export function formatBytes(bytes?: null | number): string {
    if (bytes === null || bytes === undefined) {
        return '';
    }

    let value = bytes;
    let unitIndex = 0;

    while (value >= BYTES_PER_UNIT && unitIndex < SIZE_UNITS.length - 1) {
        value /= BYTES_PER_UNIT;
        unitIndex += 1;
    }

    const decimals = unitIndex === 0 || value >= 100 ? 0 : 1;

    return `${value.toFixed(decimals)} ${SIZE_UNITS[unitIndex]}`;
}
