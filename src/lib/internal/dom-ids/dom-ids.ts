let domIdCount = 0;

export function nextDomId(prefix: string): string {
    domIdCount += 1;

    return `${prefix}-${domIdCount}`;
}
