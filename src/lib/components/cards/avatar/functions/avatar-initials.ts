export function avatarInitials(name?: string | null, surname?: string | null): string {
    return [name, surname].map(part => (part ?? '').trim().charAt(0).toUpperCase()).join('');
}
