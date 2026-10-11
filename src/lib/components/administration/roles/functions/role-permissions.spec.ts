import { faFileLines, faRectangleList, faUser } from '@fortawesome/free-regular-svg-icons';

import {
    groupRolePermissions,
    rolePermissionDescription,
    rolePermissionGroupLabel,
    rolePermissionLabel,
    rolePermissionSections
} from './role-permissions';

describe('role permissions', () => {
    const translations: Record<string, string> = {
        'angular-components.roles.permissions.users.invite.description': 'Can invite people.',
        'angular-components.roles.permissions.users.invite.label': 'Invite users',
        'angular-components.roles.permissions.users.label': 'Users',
        'my-app.permissions.templates.edit-content.description': 'Can change what the templates say.',
        'my-app.permissions.templates.edit-content.label': 'Edit the content of templates',
        'my-app.permissions.templates.label': 'Templates'
    };
    const translate = (key: string): string => translations[key] ?? key;

    describe('groupRolePermissions', () => {
        it('groups the permissions by their group, ordered by group, each in the order given', () => {
            const groups = groupRolePermissions([
                { group: 'users', key: 'users.read' },
                { group: 'templates', key: 'templates.edit' },
                { group: 'users', key: 'users.invite' }
            ]);

            expect(groups).toEqual([
                { entries: [{ group: 'templates', key: 'templates.edit' }], group: 'templates' },
                {
                    entries: [
                        { group: 'users', key: 'users.read' },
                        { group: 'users', key: 'users.invite' }
                    ],
                    group: 'users'
                }
            ]);
        });

        it('adds the permissions a role holds that the list leaves out, grouped by their prefix', () => {
            const groups = groupRolePermissions(
                [{ group: 'templates', key: 'templates.edit' }],
                ['templates.edit', 'users.read', 'templates.publish']
            );

            expect(groups.map(({ entries, group }) => [group, entries.map(({ key }) => key)])).toEqual([
                ['templates', ['templates.edit', 'templates.publish']],
                ['users', ['users.read']]
            ]);
        });
    });

    describe('rolePermissionLabel', () => {
        it('reads the label of a permission under the prefix of the app, by group and action', () => {
            expect(
                rolePermissionLabel(
                    { group: 'templates', key: 'templates.editContent' },
                    'my-app.permissions',
                    translate
                )
            ).toBe('Edit the content of templates');
        });

        it('falls back to the labels the library ships for its own permissions', () => {
            expect(rolePermissionLabel({ group: 'users', key: 'users.invite' }, 'my-app.permissions', translate)).toBe(
                'Invite users'
            );
        });

        it('makes the action readable when nobody translates it', () => {
            expect(
                rolePermissionLabel(
                    { group: 'templates', key: 'templates.change-status' },
                    'my-app.permissions',
                    translate
                )
            ).toBe('Change status');
        });
    });

    describe('rolePermissionDescription', () => {
        it('reads the description under the prefix of the app, then the library, and gives none without one', () => {
            expect(
                rolePermissionDescription(
                    { group: 'templates', key: 'templates.editContent' },
                    'my-app.permissions',
                    translate
                )
            ).toBe('Can change what the templates say.');
            expect(
                rolePermissionDescription({ group: 'users', key: 'users.invite' }, 'my-app.permissions', translate)
            ).toBe('Can invite people.');
            expect(
                rolePermissionDescription(
                    { group: 'templates', key: 'templates.publish' },
                    'my-app.permissions',
                    translate
                )
            ).toBeUndefined();
        });
    });

    describe('rolePermissionGroupLabel', () => {
        it('reads the label of a group under the prefix, then the library, then makes the group readable', () => {
            expect(rolePermissionGroupLabel('templates', 'my-app.permissions', translate)).toBe('Templates');
            expect(rolePermissionGroupLabel('users', 'my-app.permissions', translate)).toBe('Users');
            expect(rolePermissionGroupLabel('contentBlocks', 'my-app.permissions', translate)).toBe('Content blocks');
        });
    });

    describe('rolePermissionSections', () => {
        it('makes a section per group, with the icon the app gives it, the library one or the default', () => {
            const sections = rolePermissionSections(
                groupRolePermissions([
                    { group: 'templates', key: 'templates.editContent' },
                    { group: 'users', key: 'users.invite' },
                    { group: 'documents', key: 'documents.read' }
                ]),
                { groupIcons: { templates: faFileLines }, permissionPrefix: 'my-app.permissions', translate }
            );

            expect(sections.map(({ icon, key, label }) => [key, label, icon])).toEqual([
                ['documents', 'Documents', faRectangleList],
                ['templates', 'Templates', faFileLines],
                ['users', 'Users', faUser]
            ]);
            expect(sections[1].options).toEqual([
                {
                    description: 'Can change what the templates say.',
                    label: 'Edit the content of templates',
                    value: 'templates.editContent'
                }
            ]);
        });
    });
});
