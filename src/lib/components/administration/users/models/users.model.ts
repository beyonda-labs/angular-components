import { Observable } from 'rxjs';

import { BadgeVariant } from '../../../badge/models/badge.model';
import { FormSelectField } from '../../../form/models/fields/form-select-field.model';
import { FormRow } from '../../../form/models/form.model';
import { FormFieldOption } from '../../../form/models/form-field.model';
import { PageHandle } from '../../../page/models/page.model';
import { PageCategoriesConfig } from '../../../page/models/page-categories.model';
import { PageFormConfig } from '../../../page/models/page-form.model';
import { PageOrganization, PageOrganizationItem } from '../../../page/models/page-organization.model';
import { SearchFieldOption } from '../../../search/models/search.model';
import { TableCell } from '../../../table/models/table-cell.model';
import { OrganizationFolder } from '../../models/organization-folders.model';

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

export interface UserContent {
    counts: Record<string, number>;
    usedByOthers: Record<string, UserContentUsage[]>;
}

export interface UserContentFormOptions {
    contentLabels: Readonly<Record<string, string>>;
    prefix: string;
}

export interface UserContentResponse {
    counts?: Record<string, number>;
    usedByOthers?: Record<string, UserContentUsage[]>;
}

export interface UserContentUsage {
    id: string;
    name: string | null;
    users: UserContentUser[];
}

export interface UserContentUser {
    id: string;
    name: string | null;
    ownerName: string | null;
}

export interface UserDeleteFormOptions extends UserContentFormOptions {
    contents: UserContent[];
    users: UserRow[];
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
    organizationField: FormSelectField | null;
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

export interface UsersPageConfigOptions {
    config: UsersConfig;
    formConfig: PageFormConfig<UserFormValue, UserRow>;
    isOrganizationShown: boolean;
    loadRow: (user: UserRow) => TableCell[];
    onDelete: (users: UserRow[]) => void;
    onReady: (handle: PageHandle<UserRow, OrganizationFolder>) => void;
    onResendInvitation: (user: UserRow) => void;
    onTransfer: (user: UserRow) => void;
    organizations: PageOrganization[];
    roleOptions: SearchFieldOption[];

    categoriesConfig?: PageCategoriesConfig<OrganizationFolder>;
}

export interface UsersRowOptions {
    isOrganizationShown: boolean;
    onEdit: (user: UserRow) => void;
    prefix: string;
    rolePrefix: string;
}

export interface UserTransferFields {
    targetUserId: string;
}

export interface UserTransferFormOptions extends UserContentFormOptions {
    content: UserContent;
    searchTargets: (search: string, limit: number) => Observable<UserTransferTarget[]>;
    user: UserRow;
}

export interface UserTransferFormValue {
    main: UserTransferFields;
}

export interface UserTransferResponse {
    transferred: Record<string, number>;
}

export interface UserTransferTarget {
    email: string;
    id: string;

    name?: string | null;
    surname?: string | null;
}

export interface UserTransferTargetsResponse {
    options: UserTransferTarget[];
}

export class UsersConfig {
    baseUrl: string;
    contentLabels: Readonly<Record<string, string>>;
    foldersHeight: string;
    height: string;
    prefix: string;
    rolePrefix: string;
    storageKey: string;

    constructor({
        baseUrl = '/users',
        contentLabels = {},
        foldersHeight = 'calc(100vh - 255px)',
        height = 'calc(100vh - 220px)',
        prefix = 'angular-components.users',
        rolePrefix = `${prefix}.roles`,
        storageKey = 'users'
    }: UsersConfigParameters = {}) {
        this.baseUrl = baseUrl;
        this.contentLabels = contentLabels;
        this.foldersHeight = foldersHeight;
        this.height = height;
        this.prefix = prefix;
        this.rolePrefix = rolePrefix;
        this.storageKey = storageKey;
    }
}

export interface UsersConfigParameters {
    baseUrl?: string;
    contentLabels?: Readonly<Record<string, string>>;
    foldersHeight?: string;
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

export const USERS_CONTENT_PATH = '/content';

export const USERS_EXTRA_ROLE_VARIANT = BadgeVariant.Info;

export const USERS_EXTRA_ROLES_FIELD = 'extraRoleIds';

export const USERS_FORM_SECTION = 'main';

export const USERS_INVITATION_PATH = '/invitation';

export const USERS_LIST_SEPARATOR = ', ';

export const USERS_RESEND_INVITATION_ACTION = 'resend-invitation';

export const USERS_ROLES_PATH = '/roles';

export const USERS_TRANSFER_ACTION = 'transfer';

export const USERS_TRANSFER_PATH = '/transfer';

export const USERS_TRANSFER_TARGETS_LIMIT = 20;

export const USERS_TRANSFER_TARGETS_PATH = '/transfer-targets';
