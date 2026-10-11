import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { FormCheckboxGroupField } from '../../form/models/fields/form-checkbox-group-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormField, FormFieldOption } from '../../form/models/form-field.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import { UserFormValue, UserOrganizationRole, UserRow, UserStatus } from '../models/users.model';
import { UsersFormService } from './users-form.service';

describe('UsersFormService', () => {
    let form: PageFormConfig<UserFormValue, UserRow>;
    let service: UsersFormService;

    const user: UserRow = {
        actions: ['edit'],
        createdAt: 0,
        email: 'ada@example.test',
        id: 'u1',
        name: 'Ada',
        roles: ['owner'],
        status: UserStatus.Active
    };

    function fieldsFor(row?: UserRow): FormField[] {
        return form.buildSections(row).flatMap(section => section.rows.flatMap(row => row.fields));
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideBeyTesting({ translations: { en: { demo: { roles: { admin: 'Administrator' } } } } })
            ]
        });

        service = TestBed.inject(UsersFormService);
        form = service.buildFormConfig({
            extraRoles: [],
            isOrganizationAsked: false,
            organizations: [],
            prefix: 'demo.users',
            rolePrefix: 'demo.roles',
            roles: ['admin', 'editor']
        });
    });

    it('asks for the email, the names, the roles and the language of a new user', () => {
        const fields = fieldsFor();

        expect(form.prefix).toBe('demo.users.form');
        expect(fields.map(field => field.key)).toEqual(['email', 'name', 'surname', 'roles', 'language']);
        expect((fields[3] as FormCheckboxGroupField).options).toEqual([
            { label: 'Administrator', value: 'admin' },
            { label: 'editor', value: 'editor' }
        ]);
        expect(form.toFormValue()).toBeUndefined();
    });

    it('shows the email of a user it edits, and offers the roles the user already has', () => {
        const fields = fieldsFor(user);

        expect(fields.map(field => field.key)).toEqual(['email', 'name', 'surname', 'roles']);
        expect((fields[0] as FormInfoField).items).toEqual([{ label: 'ada@example.test' }]);
        expect(
            ((fields[3] as FormCheckboxGroupField).options as { value: string }[]).map(({ value }) => value)
        ).toEqual(['admin', 'editor', 'owner']);
        expect(form.toFormValue(user)).toEqual({ main: { name: 'Ada', roles: ['owner'], surname: '' } });
    });

    it('sends the roles and only the texts that were filled in, trimmed', () => {
        expect(
            form.toItem({
                main: { email: ' grace@example.test ', language: '', name: 'Grace ', roles: ['admin'], surname: ' ' }
            })
        ).toEqual({ email: 'grace@example.test', name: 'Grace', roles: ['admin'] });
    });

    describe('for a superadmin of several organizations', () => {
        const organizations = [
            { id: 'o1', name: 'Acme' },
            { id: 'o2', name: 'Globex' }
        ];

        beforeEach(() => {
            form = service.buildFormConfig({
                extraRoles: [],
                isOrganizationAsked: true,
                organizations,
                prefix: 'demo.users',
                rolePrefix: 'demo.roles',
                roles: ['admin']
            });
        });

        it('asks a new user for the organization, required and offering each one by name, with none chosen', () => {
            const fields = fieldsFor();

            expect(fields.map(field => field.key)).toEqual([
                'email',
                'name',
                'surname',
                'organizationId',
                'roles',
                'language'
            ]);
            expect(fields[3]).toMatchObject({
                isRequired: true,
                options: [
                    { label: 'Acme', value: 'o1' },
                    { label: 'Globex', value: 'o2' }
                ]
            });
            expect(form.toFormValue()).toBeUndefined();
        });

        it('never asks for the organization of a user it edits, since users do not move', () => {
            expect(fieldsFor(user).map(field => field.key)).not.toContain('organizationId');
        });

        it('sends the organization chosen', () => {
            expect(
                form.toItem({ main: { email: 'grace@example.test', organizationId: 'o1', roles: ['admin'] } })
            ).toEqual({ email: 'grace@example.test', organizationId: 'o1', roles: ['admin'] });
        });
    });

    it('asks a superadmin for the organization with a single one too, chosen already', () => {
        form = service.buildFormConfig({
            extraRoles: [],
            isOrganizationAsked: true,
            organizations: [{ id: 'o1', name: 'Acme' }],
            prefix: 'demo.users',
            rolePrefix: 'demo.roles',
            roles: []
        });

        expect(fieldsFor().find(field => field.key === 'organizationId')).toMatchObject({
            isRequired: true,
            options: [{ label: 'Acme', value: 'o1' }]
        });
        expect(form.toFormValue()).toEqual({ main: { organizationId: 'o1', roles: [] } });
    });

    it('asks a superadmin for the organization even with none to offer, so nothing is sent without one', () => {
        form = service.buildFormConfig({
            extraRoles: [],
            isOrganizationAsked: true,
            organizations: [],
            prefix: 'demo.users',
            rolePrefix: 'demo.roles',
            roles: []
        });

        expect(fieldsFor().find(field => field.key === 'organizationId')).toMatchObject({
            isRequired: true,
            options: []
        });
        expect(form.toFormValue()).toBeUndefined();
    });

    describe('with extra roles', () => {
        const extraRoles: UserOrganizationRole[] = [
            { id: 'r1', name: 'Reviewers', organizationId: 'o1' },
            { id: 'r2', name: 'Auditors', organizationId: 'o2' }
        ];

        function extraRolesField(row?: UserRow): FormCheckboxGroupField | undefined {
            return fieldsFor(row).find(field => field.key === 'extraRoleIds') as FormCheckboxGroupField | undefined;
        }

        function build(isOrganizationAsked: boolean, roles = extraRoles): void {
            form = service.buildFormConfig({
                extraRoles: roles,
                isOrganizationAsked,
                organizations: [
                    { id: 'o1', name: 'Acme' },
                    { id: 'o2', name: 'Globex' }
                ],
                prefix: 'demo.users',
                rolePrefix: 'demo.roles',
                roles: ['admin']
            });
        }

        function optionsAt(field: FormCheckboxGroupField | undefined, organizationId?: string): FormFieldOption[] {
            const { options } = field ?? {};

            return typeof options === 'function'
                ? options({ main: { organizationId } })
                : ((options as FormFieldOption[]) ?? []);
        }

        it('offers a manager the extra roles of the organization after the roles, labelled with their names', () => {
            build(false, [extraRoles[0]]);

            expect(fieldsFor().map(field => field.key)).toEqual([
                'email',
                'name',
                'surname',
                'roles',
                'extraRoleIds',
                'language'
            ]);
            expect(optionsAt(extraRolesField())).toEqual([{ label: 'Reviewers', value: 'r1' }]);
            expect(
                form.toItem({ main: { email: 'grace@example.test', extraRoleIds: ['r1'], roles: ['admin'] } })
            ).toEqual({ email: 'grace@example.test', extraRoleIds: ['r1'], roles: ['admin'] });
        });

        it('offers no extra roles where the organization has none, and sends none', () => {
            build(false, []);

            expect(extraRolesField()).toBeUndefined();
            expect(form.toItem({ main: { email: 'grace@example.test', roles: ['admin'] } })).toEqual({
                email: 'grace@example.test',
                roles: ['admin']
            });
        });

        it('checks the extra roles a user holds, still offering one the organization no longer lists', () => {
            build(false, [extraRoles[0]]);
            const holder: UserRow = { ...user, extraRoles: [{ id: 'r9', name: 'Former' }] };

            expect(optionsAt(extraRolesField(holder))).toEqual([
                { label: 'Reviewers', value: 'r1' },
                { label: 'Former', value: 'r9' }
            ]);
            expect(form.toFormValue(holder)).toEqual({
                main: { extraRoleIds: ['r9'], name: 'Ada', roles: ['owner'], surname: '' }
            });
            expect(form.toItem({ main: { extraRoleIds: [], roles: ['owner'] } })).toEqual({
                extraRoleIds: [],
                roles: ['owner']
            });
        });

        it('offers a superadmin the extra roles of the organization chosen in the invitation, hidden without one', () => {
            build(true);
            const field = extraRolesField();

            expect(optionsAt(field, 'o1')).toEqual([{ label: 'Reviewers', value: 'r1' }]);
            expect(optionsAt(field, 'o2')).toEqual([{ label: 'Auditors', value: 'r2' }]);
            expect(typeof field?.isHidden === 'function' && field.isHidden({ main: {} })).toBe(true);
            expect(typeof field?.isHidden === 'function' && field.isHidden({ main: { organizationId: 'o1' } })).toBe(
                false
            );
        });

        it('sends a superadmin only the extra roles of the organization chosen at last', () => {
            build(true);

            expect(
                form.toItem({
                    main: { email: 'grace@example.test', extraRoleIds: ['r1', 'r2'], organizationId: 'o2', roles: [] }
                })
            ).toEqual({ email: 'grace@example.test', extraRoleIds: ['r2'], organizationId: 'o2', roles: [] });
        });

        it('offers a superadmin the extra roles of the organization of the user it edits', () => {
            build(true);

            expect(optionsAt(extraRolesField({ ...user, organizationId: 'o2' }))).toEqual([
                { label: 'Auditors', value: 'r2' }
            ]);
            expect(extraRolesField({ ...user, organizationId: 'o3' })).toBeUndefined();
        });

        it('filters by the roles and the extra roles, naming the organization of each to a superadmin', () => {
            const roles = { extraRoles, roles: ['admin'] };
            const organizations = [
                { id: 'o1', name: 'Acme' },
                { id: 'o2', name: 'Globex' }
            ];

            expect(service.buildRoleFilterOptions(roles, 'demo.roles', organizations)).toEqual([
                { label: 'Administrator', value: 'admin' },
                { label: 'Reviewers (Acme)', value: 'r1' },
                { label: 'Auditors (Globex)', value: 'r2' }
            ]);
            expect(service.buildRoleFilterOptions(roles, 'demo.roles', []).map(({ label }) => label)).toEqual([
                'Administrator',
                'Reviewers',
                'Auditors'
            ]);
        });
    });
});
