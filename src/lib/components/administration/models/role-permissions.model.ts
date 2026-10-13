import { IconDefinition } from '@fortawesome/angular-fontawesome';
import { faBuilding, faClipboard, faIdBadge, faRectangleList, faUser } from '@fortawesome/free-regular-svg-icons';

export interface RolePermissionEntry {
    group: string;
    key: string;
}

export interface RolePermissionGroup {
    entries: RolePermissionEntry[];
    group: string;
}

export interface RolePermissionSectionsOptions {
    groupIcons: Readonly<Record<string, IconDefinition>>;
    permissionPrefix: string;
    translate: (key: string) => unknown;
}

export interface RolePermissionsFields {
    permissions: string[];
}

export interface RolePermissionsOptions {
    actionOrder: string[];
    groupIcons: Readonly<Record<string, IconDefinition>>;
    groupOrder: string[];
    permissionPrefix: string;
    permissions: RolePermissionEntry[];
}

export interface RoleViewFields {
    description: string;
    name: string;
}

export interface RoleViewOptions extends RoleViewSettings {
    permissions: RolePermissionEntry[];
}

export interface RoleViewSettings {
    actionOrder: string[];
    groupIcons: Readonly<Record<string, IconDefinition>>;
    groupOrder: string[];
    permissionPrefix: string;
    prefix: string;
    rolePrefix: string;
}

export interface RoleViewValue {
    main: RoleViewFields;
    permissions: RolePermissionsFields;
}

export interface ViewedRole {
    isBase: boolean;
    name: string;
    permissions: string[];

    description?: string;
}

export const ROLES_DEFAULT_ACTION_ORDER: readonly string[] = [
    'read',
    'read-definition',
    'create',
    'edit',
    'edit-definition',
    'delete',
    'duplicate',
    'complete',
    'download',
    'change-status',
    'convert-to-block',
    'convert-to-template',
    'replace-content',
    'export',
    'import',
    'share',
    'create-category',
    'edit-category',
    'delete-category',
    'move',
    'restore-trash-item',
    'delete-trash-item',
    'empty-trash',
    'invite',
    'manage'
];

export const ROLES_DEFAULT_GROUP_ICON: IconDefinition = faRectangleList;

export const ROLES_DEFAULT_PREFIX = 'angular-components.roles';

export const ROLES_DEFAULT_ROLE_PREFIX = 'angular-components.users.roles';

export const ROLES_FORM_SECTION = 'main';

export const ROLES_LIBRARY_GROUP_ICONS: Readonly<Record<string, IconDefinition>> = {
    audit: faClipboard,
    organization: faBuilding,
    roles: faIdBadge,
    users: faUser
};

export const ROLES_LIBRARY_PERMISSION_PREFIX = 'angular-components.roles.permissions';

export const ROLES_PERMISSIONS_FIELD = 'permissions';

export const ROLES_PERMISSIONS_SECTION = 'permissions';

export const ROLE_VIEW_DEFAULTS: Readonly<RoleViewSettings> = {
    actionOrder: [...ROLES_DEFAULT_ACTION_ORDER],
    groupIcons: {},
    groupOrder: [],
    permissionPrefix: ROLES_LIBRARY_PERMISSION_PREFIX,
    prefix: ROLES_DEFAULT_PREFIX,
    rolePrefix: ROLES_DEFAULT_ROLE_PREFIX
};
