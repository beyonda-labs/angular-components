import { withoutOrganizationFolders } from '../../functions/organization-folders';
import { OrganizationFolder } from '../../models/organization-folders.model';
import { RoleRow, RolesPageMode } from '../models/roles.model';

export function rolesPageMode(
    current: RolesPageMode,
    rows: (Pick<RoleRow, 'sources'> | OrganizationFolder)[]
): RolesPageMode {
    const roles = withoutOrganizationFolders(rows);

    if (roles.length === 0) {
        return current;
    }

    return roles.some(({ sources }) => sources !== undefined) ? RolesPageMode.Read : RolesPageMode.Manage;
}
