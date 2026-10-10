import { toKeySegment } from '../../../utilities/key-segment';
import { UserRow } from '../models/users.model';

export function userFullName({ name, surname }: Pick<UserRow, 'name' | 'surname'>): string {
    return [name, surname]
        .map(part => part?.trim() ?? '')
        .filter(Boolean)
        .join(' ');
}

export function userRoleLabel(role: string, rolePrefix: string, translate: (key: string) => string): string {
    const key = `${rolePrefix}.${toKeySegment(role)}`;
    const label = translate(key);

    return label && label !== key ? label : role;
}
