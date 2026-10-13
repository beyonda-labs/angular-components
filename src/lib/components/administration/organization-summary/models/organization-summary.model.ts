import { IconDefinition } from '@fortawesome/angular-fontawesome';
import { faShieldHalved, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';

import { CardConfig } from '../../../cards/card/models/card.model';
import { CardListConfig } from '../../../cards/card-list/models/card-list.model';
import { CardStatsConfig } from '../../../cards/card-stats/models/card-stats.model';
import { ROLE_VIEW_DEFAULTS, RoleViewSettings } from '../../models/role-permissions.model';
import { NamedUser } from '../../models/user-names.model';

export interface OrganizationSummary {
    administrators: OrganizationSummaryAdministrator[];
    counts: OrganizationSummaryCounts;
    createdAt: number;
    extraRoles: OrganizationSummaryExtraRole[];
    groups: OrganizationSummaryGroup[];
    id: string;
    name: string;
    status: string;

    ungroupedMembers?: OrganizationSummaryMember[];
}

export interface OrganizationSummaryAdministrator extends NamedUser {
    id: string;
}

export interface OrganizationSummaryCounts {
    extraRoles: number;
    groups: number;
    members: number;

    byStatus?: OrganizationSummaryStatusCounts;
}

export interface OrganizationSummaryExtraRole {
    id: string;
    name: string;

    description?: string | null;
    permissions?: string[];
}

export interface OrganizationSummaryGroup {
    id: string;
    members: OrganizationSummaryMember[];
    name: string;

    memberCount?: number;
}

export interface OrganizationSummaryMember extends NamedUser {
    id: string;
}

export interface OrganizationSummaryStatDefinition {
    icon: IconDefinition;
    key: keyof Omit<OrganizationSummaryCounts, 'byStatus'>;
    textKey: string;
}

export interface OrganizationSummaryStatusCounts {
    active: number;
    inactive: number;
    invited: number;
    unverified: number;
}

export interface OrganizationSummaryTexts {
    createdAt: string;
}

export interface OrganizationSummaryView {
    administrators: CardListConfig;
    breakdown: string;
    card: CardConfig;
    createdAtParameters: Record<string, string>;
    extraRoles: CardListConfig;
    groups: CardListConfig;
    name: string;
    stats: CardStatsConfig;
}

export interface OrganizationSummaryViewOptions {
    language: string;
    onRoleClick: (role: OrganizationSummaryExtraRole) => void;
}

export class OrganizationSummaryConfig {
    organizationsUrl: string;
    prefix: string;
    rolesConfig: RoleViewSettings;

    constructor({
        organizationsUrl = '/organizations',
        prefix = 'angular-components.organization-summary',
        rolesConfig = ROLE_VIEW_DEFAULTS
    }: OrganizationSummaryConfigParameters = {}) {
        this.organizationsUrl = organizationsUrl;
        this.prefix = prefix;
        this.rolesConfig = rolesConfig;
    }
}

export interface OrganizationSummaryConfigParameters {
    organizationsUrl?: string;
    prefix?: string;
    rolesConfig?: RoleViewSettings;
}

export const ORGANIZATION_SUMMARY_BREAKDOWN_SEPARATOR = ' · ';

export const ORGANIZATION_SUMMARY_COUNT_ONE = 'one';

export const ORGANIZATION_SUMMARY_COUNT_OTHER = 'other';

export const ORGANIZATION_SUMMARY_GROUP_ICON: IconDefinition = faUsers;

export const ORGANIZATION_SUMMARY_PATH = '/current';

export const ORGANIZATION_SUMMARY_ROLE_ICON: IconDefinition = faShieldHalved;

export const ORGANIZATION_SUMMARY_STATS: readonly OrganizationSummaryStatDefinition[] = [
    { icon: faUser, key: 'members', textKey: 'members' },
    { icon: faUsers, key: 'groups', textKey: 'groups' },
    { icon: faShieldHalved, key: 'extraRoles', textKey: 'extra-roles' }
];

export const ORGANIZATION_SUMMARY_STATUS_KEYS: readonly (keyof OrganizationSummaryStatusCounts)[] = [
    'active',
    'inactive',
    'invited',
    'unverified'
];

export const ORGANIZATION_SUMMARY_UNGROUPED_KEY = 'ungrouped';
