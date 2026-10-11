import { BadgeVariant } from '../../badge/models/badge.model';
import { PageOrganization, PageOrganizationItem } from '../../page/models/page-organization.model';

export enum UserStatus {
    Active = 'active',
    Inactive = 'inactive',
    Invited = 'invited',
    Unverified = 'unverified'
}

export interface UserExtraRole {
    id: string;
    name: string;
}

export interface UserFormFields {
    roles: string[];

    email?: string;
    extraRoleIds?: string[];
    language?: string;
    name?: string;
    organizationId?: string;
    surname?: string;
}

export interface UserFormValue {
    main: UserFormFields;
}

export interface UserOrganizationRole extends UserExtraRole {
    organizationId: string;
}

export interface UserRoles {
    extraRoles: UserOrganizationRole[];
    roles: string[];
}

export interface UserRolesResponse {
    roles: string[];

    extraRoles?: UserOrganizationRole[];
}

export interface UserRow extends PageOrganizationItem {
    actions: string[];
    createdAt: number;
    email: string;
    id: string;
    roles: string[];
    status: UserStatus;

    extraRoles?: UserExtraRole[];
    lastLoginAt?: number;
    name?: string;
    surname?: string;
}

export interface UsersFormOptions {
    extraRoles: UserOrganizationRole[];
    isOrganizationAsked: boolean;
    organizations: PageOrganization[];
    prefix: string;
    rolePrefix: string;
    roles: string[];
}

export interface UsersRowOptions {
    isOrganizationShown: boolean;
    onEdit: (user: UserRow) => void;
    prefix: string;
    rolePrefix: string;
}

export class UsersConfig {
    baseUrl: string;
    height: string;
    prefix: string;
    rolePrefix: string;
    storageKey: string;

    constructor({
        baseUrl = '/users',
        height = 'calc(100vh - 220px)',
        prefix = 'angular-components.users',
        rolePrefix = `${prefix}.roles`,
        storageKey = 'users'
    }: UsersConfigParameters = {}) {
        this.baseUrl = baseUrl;
        this.height = height;
        this.prefix = prefix;
        this.rolePrefix = rolePrefix;
        this.storageKey = storageKey;
    }
}

export interface UsersConfigParameters {
    baseUrl?: string;
    height?: string;
    prefix?: string;
    rolePrefix?: string;
    storageKey?: string;
}

export const USER_STATUS_BADGE_VARIANTS: Readonly<Record<UserStatus, BadgeVariant>> = {
    [UserStatus.Active]: BadgeVariant.Success,
    [UserStatus.Inactive]: BadgeVariant.Neutral,
    [UserStatus.Invited]: BadgeVariant.Info,
    [UserStatus.Unverified]: BadgeVariant.Warning
};

export const USER_STATUS_TRANSITIONS: Readonly<Record<UserStatus, readonly UserStatus[]>> = {
    [UserStatus.Active]: [UserStatus.Inactive],
    [UserStatus.Inactive]: [UserStatus.Active],
    [UserStatus.Invited]: [UserStatus.Inactive],
    [UserStatus.Unverified]: [UserStatus.Inactive]
};

export const USERS_EXTRA_ROLE_VARIANT = BadgeVariant.Info;

export const USERS_EXTRA_ROLES_FIELD = 'extraRoleIds';

export const USERS_FORM_SECTION = 'main';

export const USERS_ORGANIZATIONS_PATH = '/organizations';

export const USERS_RESEND_INVITATION_ACTION = 'resend-invitation';

export const USERS_ROLES_PATH = '/roles';

export const USERS_SUPERADMIN_ROLE = 'superadmin';
