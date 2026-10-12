import { RoleFormValue, RoleRequest, ROLES_PERMISSIONS_FIELD } from '../models/roles.model';

export function toRoleCreateRequest(value: RoleFormValue): RoleRequest {
    const { organizationId } = value.main;

    return { ...toRoleEditRequest(value), ...(organizationId ? { organizationId } : {}) };
}

export function toRoleEditRequest({ main, permissions }: RoleFormValue): RoleRequest {
    const { description, name } = main;

    return {
        name: name.trim(),
        description: description?.trim() ?? '',
        permissions: [...new Set(permissions[ROLES_PERMISSIONS_FIELD] ?? [])]
    };
}
