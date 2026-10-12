import { BadgeVariant } from '../../../badge/models/badge.model';
import { PageItem } from '../../../page/models/page-item.model';

export enum OrganizationStatus {
    Active = 'active',
    Inactive = 'inactive'
}

export interface OrganizationContent {
    counts: Record<string, number>;
}

export interface OrganizationContentResponse {
    counts?: Record<string, number>;
}

export interface OrganizationDeleteFields {
    name: string;
}

export interface OrganizationDeleteFormOptions {
    contentLabels: Readonly<Record<string, string>>;
    counts: Readonly<Record<string, number>>;
    organization: OrganizationRow;
    prefix: string;
}

export interface OrganizationDeleteFormValue {
    main: OrganizationDeleteFields;
}

export interface OrganizationDetail extends OrganizationRow {
    administrators: OrganizationGroupMember[];
    groups: OrganizationGroup[];
    ungroupedMembers: OrganizationGroupMember[];
}

export interface OrganizationEditFields {
    name: string;
    status: OrganizationStatus;
}

export interface OrganizationEditFormValue {
    main: OrganizationEditFields;
}

export interface OrganizationEditRequest {
    name: string;

    status?: OrganizationStatus;
}

export interface OrganizationFields {
    name: string;
}

export interface OrganizationFormValue {
    main: OrganizationFields;
}

export interface OrganizationGroup {
    id: string;
    members: OrganizationGroupMember[];
    name: string;
}

export interface OrganizationGroupMember {
    email: string;
    id: string;
    name: string;
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
    baseUrl: string;
    contentLabels: Readonly<Record<string, string>>;
    height: string;
    prefix: string;
    storageKey: string;

    constructor({
        baseUrl = '/organizations',
        contentLabels = {},
        height = 'calc(100vh - 220px)',
        prefix = 'angular-components.organizations',
        storageKey = 'organizations'
    }: OrganizationsConfigParameters = {}) {
        this.baseUrl = baseUrl;
        this.contentLabels = contentLabels;
        this.height = height;
        this.prefix = prefix;
        this.storageKey = storageKey;
    }
}

export interface OrganizationsConfigParameters {
    baseUrl?: string;
    contentLabels?: Readonly<Record<string, string>>;
    height?: string;
    prefix?: string;
    storageKey?: string;
}

export const ORGANIZATION_NAME_MAX_LENGTH = 100;

export const ORGANIZATION_STATUS_BADGE_VARIANTS: Readonly<Record<OrganizationStatus, BadgeVariant>> = {
    [OrganizationStatus.Active]: BadgeVariant.Success,
    [OrganizationStatus.Inactive]: BadgeVariant.Neutral
};

export const ORGANIZATIONS_ADMINISTRATORS_SECTION = 'administrators';

export const ORGANIZATIONS_CONTENT_PATH = '/content';

export const ORGANIZATIONS_FORM_SECTION = 'main';

export const ORGANIZATIONS_GROUPS_SECTION = 'groups';

export const ORGANIZATIONS_LIBRARY_CONTENT: readonly string[] = ['users', 'groups', 'roles'];

export const ORGANIZATIONS_UNGROUPED_KEY = 'ungrouped';
