import { PageOrganization, PageOrganizationItem } from '../../page/models/page-organization.model';

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

export interface GroupMembersFields {
    userIds: string[];
}

export interface GroupMembersFormValue {
    main: GroupMembersFields;
}

export interface GroupMembersResponse {
    members: GroupMember[];
}

export interface GroupRow extends PageOrganizationItem {
    actions: string[];
    createdAt: number;
    id: string;
    memberCount: number;
    name: string;
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

export const GROUPS_FORM_SECTION = 'main';

export const GROUPS_MEMBER_OPTIONS_PATH = '/member-options';

export const GROUPS_MEMBERS_ACTION = 'members';

export const GROUPS_MEMBERS_PATH = '/members';
