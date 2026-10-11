import { userRoleLabel } from '../../functions/user-role-labels';
import { RoleRow } from '../models/roles.model';

export function roleLabel(
    { isBase, name }: Pick<RoleRow, 'isBase' | 'name'>,
    rolePrefix: string,
    translate: (key: string) => string
): string {
    return isBase ? userRoleLabel(name, rolePrefix, translate) : name;
}
