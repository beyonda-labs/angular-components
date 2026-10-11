import { BadgeVariant } from '../../badge/models/badge.model';
import { PageOrganization, PageOrganizationItem } from '../../page/models/page-organization.model';

export interface RoleFields {
    name: string;

    description?: string;
    organizationId?: string;
}

export interface RoleFormValue {
    main: RoleFields;
    permissions: Record<string, string[]>;
}

export interface RolePermissionEntry {
    group: string;
    key: string;
}

export interface RolePermissionGroup {
    entries: RolePermissionEntry[];
    group: string;
}

export interface RolePermissionsOptions {
    permissionPrefix: string;
    permissions: RolePermissionEntry[];
}

export interface RolePermissionsResponse {
    permissions: RolePermissionEntry[];
}

export interface RoleRequest {
    description: string;
    name: string;
    permissions: string[];

    organizationId?: string;
}

export interface RoleRow extends PageOrganizationItem {
    actions: string[];
    id: string;
    isBase: boolean;
    memberCount: number;
    name: string;
    permissions: string[];

    description?: string;
}

export interface RolesFormOptions extends RolePermissionsOptions {
    isOrganizationAsked: boolean;
    organizations: PageOrganization[];
    prefix: string;
}

export interface RolesRowOptions {
    isOrganizationShown: boolean;
    onEdit: (role: RoleRow) => void;
    onView: (role: RoleRow) => void;
    prefix: string;
    rolePrefix: string;
}

export interface RolesViewOptions extends RolePermissionsOptions {
    prefix: string;
    rolePrefix: string;
}

export class RolesConfig {
    baseUrl: string;
    height: string;
    permissionPrefix: string;
    prefix: string;
    rolePrefix: string;
    storageKey: string;
    usersUrl: string;

    constructor({
        baseUrl = '/roles',
        height = 'calc(100vh - 220px)',
        permissionPrefix = ROLES_LIBRARY_PERMISSION_PREFIX,
        prefix = 'angular-components.roles',
        rolePrefix = 'angular-components.users.roles',
        storageKey = 'roles',
        usersUrl = '/users'
    }: RolesConfigParameters = {}) {
        this.baseUrl = baseUrl;
        this.height = height;
        this.permissionPrefix = permissionPrefix;
        this.prefix = prefix;
        this.rolePrefix = rolePrefix;
        this.storageKey = storageKey;
        this.usersUrl = usersUrl;
    }
}

export interface RolesConfigParameters {
    baseUrl?: string;
    height?: string;
    permissionPrefix?: string;
    prefix?: string;
    rolePrefix?: string;
    storageKey?: string;
    usersUrl?: string;
}

export const ROLE_NAME_MAX_LENGTH = 60;

export const ROLE_TYPE_VARIANTS: Readonly<Record<'base' | 'extra', BadgeVariant>> = {
    base: BadgeVariant.Primary,
    extra: BadgeVariant.Info
};

export const ROLES_FORM_SECTION = 'main';

export const ROLES_LIBRARY_PERMISSION_PREFIX = 'angular-components.roles.permissions';

export const ROLES_PERMISSIONS_PATH = '/permissions';

export const ROLES_PERMISSIONS_SECTION = 'permissions';
