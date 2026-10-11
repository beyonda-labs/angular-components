import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { FormCheckboxGroupField } from '../../form/models/fields/form-checkbox-group-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormField } from '../../form/models/form-field.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import { UserFormValue, UserRow, UserStatus } from '../models/users.model';
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
});
