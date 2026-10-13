import { ViewedRole } from '../models/role-permissions.model';
import { userRoleLabel } from './user-role-labels';

export function roleLabel(
    { isBase, name }: Pick<ViewedRole, 'isBase' | 'name'>,
    rolePrefix: string,
    translate: (key: string) => string
): string {
    return isBase ? userRoleLabel(name, rolePrefix, translate) : name;
}
