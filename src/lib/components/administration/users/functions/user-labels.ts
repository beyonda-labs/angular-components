import { UserRow } from '../models/users.model';

export function userFullName({ name, surname }: Pick<UserRow, 'name' | 'surname'>): string {
    return [name, surname]
        .map(part => part?.trim() ?? '')
        .filter(Boolean)
        .join(' ');
}
