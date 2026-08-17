export function matchesAcceptPattern(pattern: string, mimeType: string): boolean {
    if (pattern.endsWith('/*')) {
        return mimeType.startsWith(pattern.slice(0, -1));
    }

    return pattern === mimeType;
}

export function isAcceptedMimeType(accept: string[], mimeType: string): boolean {
    return accept.length === 0 || accept.some(pattern => matchesAcceptPattern(pattern, mimeType));
}
