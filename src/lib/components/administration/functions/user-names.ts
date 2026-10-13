import { NamedUser } from '../models/user-names.model';

export function userContactLabel(user: NamedUser): string {
    const fullName = userFullName(user);

    return fullName && fullName !== user.email ? `${fullName} (${user.email})` : user.email;
}

export function userDisplayName(user: NamedUser): string {
    return userFullName(user) || user.email;
}

export function userFullName({ name, surname }: Pick<NamedUser, 'name' | 'surname'>): string {
    return [name, surname]
        .map(part => part?.trim() ?? '')
        .filter(Boolean)
        .join(' ');
}
