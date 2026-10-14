import {
    BeyGroupMember,
    BeyGroupRow,
    BeyOrganizationSummary,
    BeyOrganizationSummaryMember,
    BeyRolePermissionEntry,
    BeyRoleRow,
    BeyRoleViewSettings
} from '@beyonda-labs/angular-components';
import { faFileLines, faFolderOpen } from '@fortawesome/free-regular-svg-icons';

export interface StyleGuideExtraRole {
    id: string;
    name: string;
}

export interface StyleGuideGroup extends BeyGroupRow {
    extraRoles: StyleGuideExtraRole[];
    members: BeyGroupMember[];
}

export const STYLE_GUIDE_BACKEND_PATH = '/style-guide/';

export const STYLE_GUIDE_CREATED_AT = Date.UTC(2026, 0, 12, 9, 0, 0);

export const STYLE_GUIDE_PEOPLE: readonly BeyOrganizationSummaryMember[] = [
    { email: 'ada@example.test', id: 'u1', name: 'Ada', surname: 'Lovelace' },
    { email: 'grace@example.test', id: 'u2', name: 'Grace', surname: 'Hopper' },
    { email: 'alan@example.test', id: 'u3', name: 'Alan', surname: 'Turing' },
    { email: 'katherine@example.test', id: 'u4', name: 'Katherine', surname: 'Johnson' },
    { email: 'margaret@example.test', id: 'u5', name: null, surname: null }
];

export const STYLE_GUIDE_PERMISSIONS: readonly BeyRolePermissionEntry[] = [
    { group: 'documents', key: 'documents.create' },
    { group: 'documents', key: 'documents.download' },
    { group: 'documents', key: 'documents.read' },
    { group: 'organization', key: 'organization.read' },
    { group: 'templates', key: 'templates.create' },
    { group: 'templates', key: 'templates.delete' },
    { group: 'templates', key: 'templates.edit' },
    { group: 'templates', key: 'templates.publish' },
    { group: 'templates', key: 'templates.read' },
    { group: 'users', key: 'users.read' }
];

export const STYLE_GUIDE_ROLES: readonly BeyRoleRow[] = [
    {
        actions: ['view', 'duplicate'],
        description: 'Everything the application allows.',
        groupCount: 0,
        id: 'admin',
        isBase: true,
        memberCount: 1,
        name: 'admin',
        permissions: [
            'documents.create',
            'documents.download',
            'documents.read',
            'organization.read',
            'templates.create',
            'templates.delete',
            'templates.edit',
            'templates.publish',
            'templates.read',
            'users.read'
        ]
    },
    {
        actions: ['view', 'duplicate'],
        groupCount: 0,
        id: 'editor',
        isBase: true,
        memberCount: 4,
        name: 'editor',
        permissions: ['documents.create', 'documents.read', 'templates.create', 'templates.edit', 'templates.read']
    },
    {
        actions: ['edit', 'duplicate', 'delete'],
        description: 'Publish the templates the editors prepare.',
        groupCount: 1,
        id: 'r1',
        isBase: false,
        memberCount: 1,
        name: 'Reviewers',
        permissions: ['templates.publish', 'templates.read']
    },
    {
        actions: ['edit', 'duplicate', 'delete'],
        description: 'Download the documents for the archive.',
        groupCount: 1,
        id: 'r2',
        isBase: false,
        memberCount: 0,
        name: 'Archivists',
        permissions: ['documents.download', 'documents.read']
    }
];

export const STYLE_GUIDE_EXTRA_ROLES: readonly StyleGuideExtraRole[] = [
    { id: 'r1', name: 'Reviewers' },
    { id: 'r2', name: 'Archivists' }
];

export const STYLE_GUIDE_GROUPS: readonly StyleGuideGroup[] = [
    {
        actions: ['edit', 'delete'],
        createdAt: STYLE_GUIDE_CREATED_AT,
        extraRoleCount: 1,
        extraRoles: [STYLE_GUIDE_EXTRA_ROLES[0]],
        id: 'g1',
        memberCount: 2,
        members: [
            { email: 'ada@example.test', id: 'u1', name: 'Ada Lovelace' },
            { email: 'grace@example.test', id: 'u2', name: 'Grace Hopper' }
        ],
        name: 'Sales'
    },
    {
        actions: ['edit', 'delete'],
        createdAt: STYLE_GUIDE_CREATED_AT,
        extraRoleCount: 0,
        extraRoles: [],
        id: 'g2',
        memberCount: 1,
        members: [{ email: 'alan@example.test', id: 'u3', name: 'Alan Turing' }],
        name: 'Support'
    },
    {
        actions: ['edit', 'delete'],
        createdAt: STYLE_GUIDE_CREATED_AT,
        extraRoleCount: 1,
        extraRoles: [STYLE_GUIDE_EXTRA_ROLES[1]],
        id: 'g3',
        memberCount: 0,
        members: [],
        name: 'Legal'
    }
];

export const STYLE_GUIDE_ORGANIZATION: BeyOrganizationSummary = {
    administrators: [STYLE_GUIDE_PEOPLE[0]],
    counts: {
        byStatus: { active: 4, inactive: 0, invited: 1, unverified: 0 },
        extraRoles: 2,
        groups: 3,
        members: 5
    },
    createdAt: STYLE_GUIDE_CREATED_AT,
    extraRoles: [
        {
            description: 'Publish the templates the editors prepare.',
            id: 'r1',
            name: 'Reviewers',
            permissions: ['templates.publish', 'templates.read']
        },
        {
            description: 'Download the documents for the archive.',
            id: 'r2',
            name: 'Archivists',
            permissions: ['documents.download', 'documents.read']
        }
    ],
    groups: [
        { id: 'g1', memberCount: 2, members: [STYLE_GUIDE_PEOPLE[0], STYLE_GUIDE_PEOPLE[1]], name: 'Sales' },
        { id: 'g2', memberCount: 1, members: [STYLE_GUIDE_PEOPLE[2]], name: 'Support' },
        { id: 'g3', memberCount: 0, members: [], name: 'Legal' }
    ],
    id: 'o1',
    name: 'Acme',
    status: 'active',
    ungroupedMembers: [STYLE_GUIDE_PEOPLE[3], STYLE_GUIDE_PEOPLE[4]]
};

export const STYLE_GUIDE_ROLE_SETTINGS: BeyRoleViewSettings = {
    actionOrder: ['read', 'create', 'edit', 'publish', 'download', 'delete'],
    groupIcons: { documents: faFileLines, templates: faFolderOpen },
    groupOrder: ['templates', 'documents'],
    permissionPrefix: 'angular-components-style-guide.roles.permissions',
    prefix: 'angular-components.roles',
    rolePrefix: 'angular-components-style-guide.roles.base'
};
