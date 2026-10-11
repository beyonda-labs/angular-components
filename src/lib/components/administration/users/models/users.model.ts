import { BadgeVariant } from '../../../badge/models/badge.model';
import { FormRow } from '../../../form/models/form.model';
import { FormFieldOption } from '../../../form/models/form-field.model';
import { PageOrganization, PageOrganizationItem } from '../../../page/models/page-organization.model';

export enum UserEditableField {
    ExtraRoleIds = 'extraRoleIds',
    Name = 'name',
    Roles = 'roles',
    Status = 'status',
    Surname = 'surname'
}

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
    status?: UserStatus;
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

    editableFields?: UserEditableField[];
    extraRoles?: UserExtraRole[];
    lastLoginAt?: number;
    name?: string;
    surname?: string;
}

export interface UserSectionOptions {
    extraRolesRows: FormRow[];
    organizationOptions: FormFieldOption[] | null;
    prefix: string;
    roleOptions: FormFieldOption[];
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

export const USER_STATUS_CHOICES: readonly UserStatus[] = [UserStatus.Active, UserStatus.Inactive];

export const USERS_EXTRA_ROLE_VARIANT = BadgeVariant.Info;

export const USERS_EXTRA_ROLES_FIELD = 'extraRoleIds';

export const USERS_FORM_SECTION = 'main';

export const USERS_RESEND_INVITATION_ACTION = 'resend-invitation';

export const USERS_ROLES_PATH = '/roles';
