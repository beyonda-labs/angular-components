import { RoleRow, RolesPageMode } from '../models/roles.model';

export function rolesPageMode(current: RolesPageMode, rows: Pick<RoleRow, 'sources'>[]): RolesPageMode {
    if (rows.length === 0) {
        return current;
    }

    return rows.some(({ sources }) => sources !== undefined) ? RolesPageMode.Read : RolesPageMode.Manage;
}
