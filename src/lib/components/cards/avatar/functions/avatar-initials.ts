const COMBINING_MARKS = /\p{M}/gu;

export function avatarInitials(name?: string | null, surname?: string | null): string {
    return [name, surname].map(part => toInitial(part)).join('');
}

function toInitial(part?: string | null): string {
    return (part ?? '').trim().normalize('NFD').replaceAll(COMBINING_MARKS, '').charAt(0).toUpperCase();
}
