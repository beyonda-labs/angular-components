import { BadgeVariant } from '../../badge/models/badge.model';
import { PageItem } from '../../page/models/page-item.model';

export enum OrganizationStatus {
    Active = 'active',
    Inactive = 'inactive'
}

export interface OrganizationAdminFields {
    email: string;

    language?: string;
    name?: string;
    surname?: string;
}

export interface OrganizationAdminFormValue {
    main: OrganizationAdminFields;
}

export interface OrganizationAdminInvitation {
    email: string;
    organizationId: string;
    roles: string[];

    language?: string;
    name?: string;
    surname?: string;
}

export interface OrganizationFields {
    name: string;
}

export interface OrganizationFormValue {
    main: OrganizationFields;
}

export interface OrganizationRow extends PageItem {
    actions: string[];
    createdAt: number;
    id: string;
    name: string;
    status: OrganizationStatus;
    userCount: number;
}

export interface OrganizationsRowOptions {
    onEdit: (organization: OrganizationRow) => void;
    prefix: string;
}

export class OrganizationsConfig {
    adminRole: string;
    baseUrl: string;
    height: string;
    prefix: string;
    storageKey: string;
    usersUrl: string;

    constructor({
        adminRole = 'adminuser',
        baseUrl = '/organizations',
        height = 'calc(100vh - 220px)',
        prefix = 'angular-components.organizations',
        storageKey = 'organizations',
        usersUrl = '/users'
    }: OrganizationsConfigParameters = {}) {
        this.adminRole = adminRole;
        this.baseUrl = baseUrl;
        this.height = height;
        this.prefix = prefix;
        this.storageKey = storageKey;
        this.usersUrl = usersUrl;
    }
}

export interface OrganizationsConfigParameters {
    adminRole?: string;
    baseUrl?: string;
    height?: string;
    prefix?: string;
    storageKey?: string;
    usersUrl?: string;
}

export const ORGANIZATION_NAME_MAX_LENGTH = 100;

export const ORGANIZATION_STATUS_BADGE_VARIANTS: Readonly<Record<OrganizationStatus, BadgeVariant>> = {
    [OrganizationStatus.Active]: BadgeVariant.Success,
    [OrganizationStatus.Inactive]: BadgeVariant.Neutral
};

export const ORGANIZATION_STATUS_TRANSITIONS: Readonly<Record<OrganizationStatus, readonly OrganizationStatus[]>> = {
    [OrganizationStatus.Active]: [OrganizationStatus.Inactive],
    [OrganizationStatus.Inactive]: [OrganizationStatus.Active]
};

export const ORGANIZATIONS_FORM_SECTION = 'main';

export const ORGANIZATIONS_INVITE_ADMIN_ACTION = 'invite-admin';
