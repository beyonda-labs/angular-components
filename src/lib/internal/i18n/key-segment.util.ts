export function toKeySegment(identifier: string): string {
    return identifier
        .replaceAll(/([\da-z])([A-Z])/gu, '$1-$2')
        .replaceAll(/([A-Z]+)([A-Z][a-z])/gu, '$1-$2')
        .toLowerCase();
}
