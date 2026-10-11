import { IconDefinition } from '@fortawesome/angular-fontawesome';
import { faBuilding, faIdBadge, faRectangleList, faUser } from '@fortawesome/free-regular-svg-icons';

import { BadgeVariant } from '../../../badge/models/badge.model';
import { PageOrganization, PageOrganizationItem } from '../../../page/models/page-organization.model';

export interface RoleFields {
    name: string;

    description?: string;
    organizationId?: string;
}

export interface RoleFormValue {
    main: RoleFields;
    permissions: RolePermissionsFields;
}

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
    groupCount?: number;
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
    actionOrder: string[];
    baseUrl: string;
    groupIcons: Record<string, IconDefinition>;
    groupOrder: string[];
    height: string;
    permissionPrefix: string;
    prefix: string;
    rolePrefix: string;
    storageKey: string;
    usersUrl: string;

    constructor({
        actionOrder = [...ROLES_DEFAULT_ACTION_ORDER],
        baseUrl = '/roles',
        groupIcons = {},
        groupOrder = [],
        height = 'calc(100vh - 220px)',
        permissionPrefix = ROLES_LIBRARY_PERMISSION_PREFIX,
        prefix = 'angular-components.roles',
        rolePrefix = 'angular-components.users.roles',
        storageKey = 'roles',
        usersUrl = '/users'
    }: RolesConfigParameters = {}) {
        this.actionOrder = actionOrder;
        this.baseUrl = baseUrl;
        this.groupIcons = groupIcons;
        this.groupOrder = groupOrder;
        this.height = height;
        this.permissionPrefix = permissionPrefix;
        this.prefix = prefix;
        this.rolePrefix = rolePrefix;
        this.storageKey = storageKey;
        this.usersUrl = usersUrl;
    }
}

export interface RolesConfigParameters {
    actionOrder?: string[];
    baseUrl?: string;
    groupIcons?: Record<string, IconDefinition>;
    groupOrder?: string[];
    height?: string;
    permissionPrefix?: string;
    prefix?: string;
    rolePrefix?: string;
    storageKey?: string;
    usersUrl?: string;
}

export const ROLE_NAME_MAX_LENGTH = 60;

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

export const ROLE_TYPE_VARIANTS: Readonly<Record<'base' | 'extra', BadgeVariant>> = {
    base: BadgeVariant.Primary,
    extra: BadgeVariant.Info
};

export const ROLES_FORM_SECTION = 'main';

export const ROLES_LIBRARY_GROUP_ICONS: Readonly<Record<string, IconDefinition>> = {
    organization: faBuilding,
    roles: faIdBadge,
    users: faUser
};

export const ROLES_LIBRARY_PERMISSION_PREFIX = 'angular-components.roles.permissions';

export const ROLES_PERMISSIONS_PATH = '/permissions';

export const ROLES_PERMISSIONS_FIELD = 'permissions';

export const ROLES_PERMISSIONS_SECTION = 'permissions';
