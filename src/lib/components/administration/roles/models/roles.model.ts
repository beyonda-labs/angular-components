import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { BadgeVariant } from '../../../badge/models/badge.model';
import { PageOrganization, PageOrganizationItem } from '../../../page/models/page-organization.model';
import {
    RolePermissionEntry,
    RolePermissionsFields,
    RolePermissionsOptions,
    ROLES_DEFAULT_ACTION_ORDER,
    ROLES_DEFAULT_PREFIX,
    ROLES_DEFAULT_ROLE_PREFIX,
    ROLES_LIBRARY_PERMISSION_PREFIX
} from '../../models/role-permissions.model';

export enum RoleSourceType {
    Direct = 'direct',
    Group = 'group'
}

export enum RolesPageMode {
    Manage = 'manage',
    Read = 'read'
}

export type RoleSource =
    | { groupId: string; groupName: string; type: RoleSourceType.Group }
    | { type: RoleSourceType.Direct };

export interface RoleFields {
    name: string;

    description?: string;
    organizationId?: string;
}

export interface RoleFormValue {
    main: RoleFields;
    permissions: RolePermissionsFields;
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
    name: string;
    permissions: string[];

    description?: string;
    groupCount?: number;
    memberCount?: number;
    sources?: RoleSource[];
}

export interface RolesDuplicateFormOptions extends RolesFormOptions {
    rolePrefix: string;
}

export interface RolesDuplicateOptions extends RolesDuplicateFormOptions {
    baseUrl: string;
}

export interface RolesFormOptions extends RolePermissionsOptions {
    isOrganizationAsked: boolean;
    organizations: PageOrganization[];
    prefix: string;
}

export interface RolesRowOptions {
    isOrganizationShown: boolean;
    isReadOnly: boolean;
    onEdit: (role: RoleRow) => void;
    onView: (role: RoleRow) => void;
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
        prefix = ROLES_DEFAULT_PREFIX,
        rolePrefix = ROLES_DEFAULT_ROLE_PREFIX,
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

export const ROLE_COPY_SEPARATOR = ' ';

export const ROLE_NAME_MAX_LENGTH = 60;

export const ROLE_TYPE_VARIANTS: Readonly<Record<'base' | 'extra', BadgeVariant>> = {
    base: BadgeVariant.Primary,
    extra: BadgeVariant.Info
};

export const ROLES_PERMISSIONS_PATH = '/permissions';

export const ROLES_SOURCES_SEPARATOR = ' · ';
