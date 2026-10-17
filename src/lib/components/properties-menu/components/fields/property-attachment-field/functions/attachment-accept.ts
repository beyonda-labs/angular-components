export function acceptedMimeTypes(accept: string | undefined): string[] {
    return (accept ?? '')
        .split(',')
        .map(pattern => pattern.trim())
        .filter(Boolean);
}
