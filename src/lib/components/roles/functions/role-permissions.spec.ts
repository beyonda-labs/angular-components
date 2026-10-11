import {
    groupRolePermissions,
    rolePermissionGroupLabel,
    rolePermissionLabel,
    toRolePermissions
} from './role-permissions';

describe('role permissions', () => {
    const translations: Record<string, string> = {
        'angular-components.roles.permissions.users.invite': 'Invite users',
        'angular-components.roles.permissions.users.label': 'Users',
        'my-app.permissions.templates.edit-content': 'Edit the content of templates',
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

    describe('rolePermissionGroupLabel', () => {
        it('reads the label of a group under the prefix, then the library, then makes the group readable', () => {
            expect(rolePermissionGroupLabel('templates', 'my-app.permissions', translate)).toBe('Templates');
            expect(rolePermissionGroupLabel('users', 'my-app.permissions', translate)).toBe('Users');
            expect(rolePermissionGroupLabel('contentBlocks', 'my-app.permissions', translate)).toBe('Content blocks');
        });
    });

    describe('toRolePermissions', () => {
        it('joins the permissions checked in every group, once each', () => {
            expect(
                toRolePermissions({
                    templates: ['templates.edit'],
                    users: ['users.read', 'templates.edit'],
                    none: null
                })
            ).toEqual(['templates.edit', 'users.read']);
            expect(toRolePermissions(undefined)).toEqual([]);
        });
    });
});
