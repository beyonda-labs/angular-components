import { Observable } from 'rxjs';

import { PageOrganization, PageOrganizationItem } from '../../../page/models/page-organization.model';
import { ROLE_VIEW_DEFAULTS, RoleViewSettings } from '../../models/role-permissions.model';
import { NamedUser } from '../../models/user-names.model';

export enum GroupsPageMode {
    Manage = 'manage',
    Read = 'read',
    ReadWithRoles = 'read-with-roles'
}

export interface GroupDetail extends GroupRow {
    extraRoles: GroupExtraRole[];
    members: GroupMember[];
}

export interface GroupEditFields {
    extraRoleIds: string[];
    name: string;
    userIds: string[];
}

export interface GroupEditFormFields extends GroupEditFields {
    organizationId?: string;
}

export interface GroupEditFormValue {
    main: GroupEditFormFields;
}

export interface GroupEditOptions {
    detail: GroupDetail;
    isOrganizationShown: boolean;
    prefix: string;
    searchExtraRoles: (search: string, limit: number) => Observable<GroupExtraRole[]>;
    searchMembers: (search: string, limit: number) => Observable<GroupMember[]>;
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
    roleCount?: number;
}

export interface GroupsFormOptions {
    isOrganizationAsked: boolean;
    organizations: PageOrganization[];
    prefix: string;
}

export interface GroupsRowOptions {
    isOrganizationShown: boolean;
    mode: GroupsPageMode;
    onEdit: (group: GroupRow) => void;
    onView: (group: GroupRow) => void;
    prefix: string;
}

export interface GroupView {
    id: string;
    members: GroupViewMember[];
    name: string;

    extraRoles?: GroupViewRole[];
}

export interface GroupViewMember extends NamedUser {
    id: string;
}

export interface GroupViewOptions {
    group: GroupView;
    onRoleClick: (role: GroupViewRole) => void;
    prefix: string;
}

export interface GroupViewRole {
    id: string;
    name: string;
    permissions: string[];

    description?: string;
}

export class GroupsConfig {
    baseUrl: string;
    foldersHeight: string;
    height: string;
    prefix: string;
    rolesConfig: RoleViewSettings;
    storageKey: string;
    usersUrl: string;

    constructor({
        baseUrl = '/groups',
        foldersHeight = 'calc(100vh - 255px)',
        height = 'calc(100vh - 220px)',
        prefix = 'angular-components.groups',
        rolesConfig = ROLE_VIEW_DEFAULTS,
        storageKey = 'groups',
        usersUrl = '/users'
    }: GroupsConfigParameters = {}) {
        this.baseUrl = baseUrl;
        this.foldersHeight = foldersHeight;
        this.height = height;
        this.prefix = prefix;
        this.rolesConfig = rolesConfig;
        this.storageKey = storageKey;
        this.usersUrl = usersUrl;
    }
}

export interface GroupsConfigParameters {
    baseUrl?: string;
    foldersHeight?: string;
    height?: string;
    prefix?: string;
    rolesConfig?: RoleViewSettings;
    storageKey?: string;
    usersUrl?: string;
}

export const GROUP_NAME_MAX_LENGTH = 100;

export const GROUPS_EXTRA_ROLES_FIELD = 'extraRoleIds';

export const GROUPS_FORM_SECTION = 'main';

export const GROUPS_MEMBER_OPTIONS_PATH = '/member-options';

export const GROUPS_ROLE_OPTIONS_PATH = '/role-options';

export const GROUPS_SEARCH_LIMIT = 20;

export const GROUPS_SEARCH_MAX_LIMIT = 50;
