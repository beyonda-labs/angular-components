import { PageOrganization, PageOrganizationItem } from '../../page/models/page-organization.model';

export interface GroupDetail extends GroupRow {
    extraRoles: GroupExtraRole[];
    members: GroupMember[];
}

export interface GroupEditFields {
    name: string;
    userIds: string[];

    extraRoleIds?: string[];
}

export interface GroupEditFormValue {
    main: GroupEditFields;
}

export interface GroupEditOptions {
    detail: GroupDetail;
    memberOptions: GroupMember[];
    prefix: string;
    roleOptions: GroupExtraRole[];
}

export interface GroupExtraRole {
    id: string;
    name: string;
}

export interface GroupFields {
    name: string;

    organizationId?: string;
}

export interface GroupFormValue {
    main: GroupFields;
}

export interface GroupMember {
    email: string;
    id: string;
    name: string;
}

export interface GroupMemberOptionsResponse {
    users: GroupMember[];
}

export interface GroupRoleOptionsResponse {
    extraRoles: GroupExtraRole[];
}

export interface GroupRow extends PageOrganizationItem {
    actions: string[];
    createdAt: number;
    id: string;
    memberCount: number;
    name: string;

    extraRoleCount?: number;
}

export interface GroupsFormOptions {
    isOrganizationAsked: boolean;
    organizations: PageOrganization[];
    prefix: string;
}

export interface GroupsRowOptions {
    isOrganizationShown: boolean;
    onEdit: (group: GroupRow) => void;
}

export class GroupsConfig {
    baseUrl: string;
    height: string;
    prefix: string;
    storageKey: string;
    usersUrl: string;

    constructor({
        baseUrl = '/groups',
        height = 'calc(100vh - 220px)',
        prefix = 'angular-components.groups',
        storageKey = 'groups',
        usersUrl = '/users'
    }: GroupsConfigParameters = {}) {
        this.baseUrl = baseUrl;
        this.height = height;
        this.prefix = prefix;
        this.storageKey = storageKey;
        this.usersUrl = usersUrl;
    }
}

export interface GroupsConfigParameters {
    baseUrl?: string;
    height?: string;
    prefix?: string;
    storageKey?: string;
    usersUrl?: string;
}

export const GROUP_NAME_MAX_LENGTH = 100;

export const GROUPS_EXTRA_ROLES_FIELD = 'extraRoleIds';

export const GROUPS_FORM_SECTION = 'main';

export const GROUPS_MEMBER_OPTIONS_PATH = '/member-options';

export const GROUPS_ROLE_OPTIONS_PATH = '/role-options';
