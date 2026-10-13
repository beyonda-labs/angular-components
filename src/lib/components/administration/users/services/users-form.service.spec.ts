import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
    buttonByName,
    controlByName,
    queryAll,
    queryButton,
    queryControl,
    renderComponent,
    settle,
    textsOf
} from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import formEn from '../../../form/assets/form.en.json';
import { FormComponent } from '../../../form/form.component';
import { FormInfoField } from '../../../form/models/fields/form-info-field.model';
import { FormListField } from '../../../form/models/fields/form-list-field.model';
import { FormSelectField } from '../../../form/models/fields/form-select-field.model';
import { FormButton, FormButtonType, FormConfig } from '../../../form/models/form.model';
import { FormField, FormFieldOption } from '../../../form/models/form-field.model';
import { PageFormConfig } from '../../../page/models/page-form.model';
import usersEn from '../assets/users.en.json';
import {
    UserEditableField,
    UserFormValue,
    UserOrganizationRole,
    UserRow,
    UsersFormOptions,
    UserStatus
} from '../models/users.model';
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

    function buildForm(overrides: Partial<UsersFormOptions> = {}): void {
        form = service.buildFormConfig({
            extraRoles: [],
            isOrganizationAsked: false,
            organizations: [],
            prefix: 'demo.users',
            rolePrefix: 'demo.roles',
            roles: ['admin', 'editor'],
            ...overrides
        });
    }

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
        buildForm();
    });

    it('asks for the email, the names, the roles and the language of a new user', () => {
        const fields = fieldsFor();

        expect(form.prefix).toBe('demo.users.form');
        expect(fields.map(field => field.key)).toEqual(['email', 'name', 'surname', 'roles', 'language']);
        expect(fields[3]).toMatchObject({
            emptyKey: 'demo.users.form.main.roles.empty',
            isRemovable: true,
            isRequired: true,
            options: [
                { label: 'Administrator', value: 'admin' },
                { label: 'editor', value: 'editor' }
            ],
            picker: {}
        });
        expect(form.toFormValue()).toBeUndefined();
    });

    it('shows the email of a user it edits, and offers the roles the user already has', () => {
        const fields = fieldsFor(user);

        expect(fields.map(field => field.key)).toEqual(['email', 'name', 'surname', 'roles']);
        expect((fields[0] as FormInfoField).items).toEqual([{ label: 'ada@example.test' }]);
        expect(((fields[3] as FormListField).options as FormFieldOption[]).map(({ value }) => value)).toEqual([
            'admin',
            'editor',
            'owner'
        ]);
        expect(form.toFormValue(user)).toEqual({ main: { name: 'Ada', roles: ['owner'], surname: '' } });
    });

    it('asks for the status of a user whose row says what may change, disabling every other field', () => {
        const row: UserRow = {
            ...user,
            editableFields: [UserEditableField.Roles, UserEditableField.Status],
            status: UserStatus.Inactive
        };
        const fields = fieldsFor(row);

        expect(fields.map(({ isDisabled, key }) => [key, isDisabled])).toEqual([
            ['email', false],
            ['name', true],
            ['surname', true],
            ['status', false],
            ['roles', false]
        ]);
        expect((fields[3] as FormSelectField).options).toEqual([
            { label: 'demo.users.status.active', value: 'active' },
            { label: 'demo.users.status.inactive', value: 'inactive' }
        ]);
        expect(form.toFormValue(row)).toEqual({
            main: { name: 'Ada', roles: ['owner'], status: 'inactive', surname: '' }
        });
    });

    it('shows the status of an invited user disabled, among the choices, since only an account may change it', () => {
        const fields = fieldsFor({ ...user, editableFields: [UserEditableField.Name], status: UserStatus.Invited });
        const status = fields.find(({ key }) => key === 'status') as FormSelectField;

        expect(status.isDisabled).toBe(true);
        expect((status.options as FormFieldOption[]).map(({ value }) => value)).toEqual([
            'active',
            'inactive',
            'invited'
        ]);
    });

    it('sends only the fields the row lets change, and the status only when it changes', () => {
        const row: UserRow = { ...user, editableFields: [UserEditableField.Name, UserEditableField.Status] };

        expect(
            form.toItem({ main: { name: 'Grace', roles: ['admin'], status: UserStatus.Inactive, surname: 'H' } }, row)
        ).toEqual({ name: 'Grace', status: 'inactive' });
        expect(form.toItem({ main: { name: 'Grace', roles: ['admin'], status: UserStatus.Active } }, row)).toEqual({
            name: 'Grace'
        });
    });

    it('keeps every field enabled and asks no status for a row of a server that names no editable fields', () => {
        const fields = fieldsFor(user);

        expect(fields.every(({ isDisabled }) => isDisabled === false)).toBe(true);
        expect(fields.map(({ key }) => key)).not.toContain('status');
        expect(form.toItem({ main: { name: 'Ada', roles: ['owner'], surname: 'L' } }, user)).toEqual({
            name: 'Ada',
            roles: ['owner'],
            surname: 'L'
        });
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
            buildForm({ isOrganizationAsked: true, organizations, roles: ['admin'] });
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

        it('shows the organization of a user it edits disabled next to the status, and never sends it', () => {
            const row: UserRow = {
                ...user,
                editableFields: [UserEditableField.Name, UserEditableField.Roles, UserEditableField.Status],
                organizationId: 'o2',
                organizationName: 'Globex'
            };
            const fields = fieldsFor(row);
            const value = form.toFormValue(row);

            expect(fields.map(({ columns, isDisabled, key }) => [key, columns, isDisabled])).toEqual([
                ['email', 12, false],
                ['name', 6, false],
                ['surname', 6, true],
                ['status', 6, false],
                ['organizationId', 6, true],
                ['roles', 12, false]
            ]);
            expect((fields[4] as FormSelectField).options).toEqual([{ label: 'Globex', value: 'o2' }]);
            expect(value?.main.organizationId).toBe('o2');
            expect(form.toItem(value as UserFormValue, row)).not.toHaveProperty('organizationId');
        });

        it('sends the organization chosen', () => {
            expect(
                form.toItem({ main: { email: 'grace@example.test', organizationId: 'o1', roles: ['admin'] } })
            ).toEqual({ email: 'grace@example.test', organizationId: 'o1', roles: ['admin'] });
        });

        it('chooses the organization of the folder it opens in, among the ones offered', () => {
            expect(form.toFormValue(undefined, { id: 'o2', label: 'Globex' })).toEqual({
                main: { organizationId: 'o2', roles: [] }
            });
            expect(form.toFormValue(undefined, { id: 'o9', label: 'Initech' })).toBeUndefined();
        });
    });

    it('asks a superadmin for the organization with a single one too, chosen already', () => {
        buildForm({ isOrganizationAsked: true, organizations: [{ id: 'o1', name: 'Acme' }], roles: [] });

        expect(fieldsFor().find(field => field.key === 'organizationId')).toMatchObject({
            isRequired: true,
            options: [{ label: 'Acme', value: 'o1' }]
        });
        expect(form.toFormValue()).toEqual({ main: { organizationId: 'o1', roles: [] } });
    });

    it('asks a superadmin for the organization even with none to offer, so nothing is sent without one', () => {
        buildForm({ isOrganizationAsked: true, roles: [] });

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

        function extraRolesField(row?: UserRow): FormListField | undefined {
            return fieldsFor(row).find(field => field.key === 'extraRoleIds') as FormListField | undefined;
        }

        function build(isOrganizationAsked: boolean, roles = extraRoles): void {
            buildForm({
                extraRoles: roles,
                isOrganizationAsked,
                organizations: [
                    { id: 'o1', name: 'Acme' },
                    { id: 'o2', name: 'Globex' }
                ],
                roles: ['admin']
            });
        }

        function optionsAt(field: FormListField | undefined, organizationId?: string): FormFieldOption[] {
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
            expect(extraRolesField()).toMatchObject({
                emptyKey: 'demo.users.form.main.extra-role-ids.empty',
                isRemovable: true,
                picker: {}
            });
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

    describe('rendered', () => {
        const SUBMIT = 'demo.submit';
        const extraRoles: UserOrganizationRole[] = [
            { id: 'r1', name: 'Reviewers', organizationId: 'o1' },
            { id: 'r2', name: 'Auditors', organizationId: 'o2' }
        ];
        let fixture: ComponentFixture<FormComponent<UserFormValue>>;
        let sent: unknown[];

        function build(isOrganizationAsked = false): void {
            buildForm({
                extraRoles,
                isOrganizationAsked,
                organizations: [
                    { id: 'o1', name: 'Acme' },
                    { id: 'o2', name: 'Globex' },
                    { id: 'o3', name: 'Initech' }
                ],
                prefix: 'angular-components.users'
            });
        }

        async function renderForm(row?: UserRow): Promise<void> {
            fixture = await renderComponent(FormComponent<UserFormValue>, {
                config: new FormConfig<UserFormValue>({
                    buttons: [new FormButton({ label: SUBMIT, type: FormButtonType.Submit })],
                    initialValue: form.toFormValue(row),
                    onSubmit: value => sent.push(form.toItem(value, row)),
                    prefix: form.prefix,
                    sections: form.buildSections(row)
                })
            });
        }

        function listNamed(name: string): HTMLElement {
            const list = queryAll(fixture, 'ul').find(candidate => candidate.getAttribute('aria-label') === name);

            if (!list) {
                throw new Error(`No list named ${name}`);
            }

            return list;
        }

        function rowsOf(name: string): string[] {
            return textsOf(queryAll(listNamed(name), 'li'));
        }

        function suggestions(): HTMLButtonElement[] {
            return queryAll<HTMLButtonElement>(document.body, '[role="option"]');
        }

        async function openSearch(name: string): Promise<void> {
            controlByName(fixture, name).dispatchEvent(new Event('focus'));
            await settle(fixture);
        }

        async function pick(name: string, label: string): Promise<void> {
            await openSearch(name);
            const option = suggestions().find(candidate => candidate.textContent?.trim() === label);

            if (!option) {
                throw new Error(`No suggestion ${label}`);
            }

            option.dispatchEvent(new MouseEvent('mousedown'));
            await settle(fixture);
        }

        async function chooseOrganization(id: string): Promise<void> {
            const select = controlByName<HTMLSelectElement>(fixture, 'Organization');

            select.value = id;
            select.dispatchEvent(new Event('change'));
            await settle(fixture);
        }

        beforeEach(() => {
            const translate = TestBed.inject(TranslateService);

            translate.setTranslation('en', formEn, true);
            translate.setTranslation('en', usersEn, true);
            translate.use('en');
            sent = [];
        });

        afterEach(() => {
            fixture.destroy();
        });

        it('adds a role picked from the search above "Roles" and takes one away with its remove button', async () => {
            build();
            await renderForm(user);

            await pick('Roles', 'Administrator');
            buttonByName(fixture, 'Remove owner').click();
            await settle(fixture);
            buttonByName(fixture, SUBMIT).click();

            expect(controlByName(fixture, 'Roles').getAttribute('placeholder')).toBe('Search a role by its name');
            expect(rowsOf('Roles')).toEqual(['Administrator']);
            expect(sent).toEqual([{ extraRoleIds: [], name: 'Ada', roles: ['admin'] }]);
        });

        it('suggests only the roles the list lacks, matching what is typed whatever its case and accents', async () => {
            build();
            await renderForm({ ...user, roles: ['admin'] });

            await openSearch('Roles');
            const search = controlByName(fixture, 'Roles');
            search.value = 'ÉDIT';
            search.dispatchEvent(new Event('input'));
            await settle(fixture);

            expect(textsOf(suggestions())).toEqual(['editor']);
        });

        it('holds the invitation back until one role at least is in "Roles"', async () => {
            build();
            await renderForm();
            const email = controlByName(fixture, 'Email');

            email.value = 'grace@example.test';
            email.dispatchEvent(new Event('input'));
            await settle(fixture);

            expect(fixture.nativeElement.textContent).toContain('Choose one role at least.');
            expect(buttonByName(fixture, SUBMIT).disabled).toBe(true);

            await pick('Roles', 'editor');

            expect(buttonByName(fixture, SUBMIT).disabled).toBe(false);
        });

        it('shows the roles and the extra roles a row does not let change without search nor remove buttons', async () => {
            build();
            await renderForm({
                ...user,
                editableFields: [UserEditableField.Name],
                extraRoles: [{ id: 'r1', name: 'Reviewers' }]
            });

            expect(rowsOf('Roles')).toEqual(['owner']);
            expect(rowsOf('Additional roles')).toEqual(['Reviewers']);
            expect(queryControl(fixture, 'Roles')).toBeNull();
            expect(queryControl(fixture, 'Additional roles')).toBeNull();
            expect(queryButton(fixture, 'Remove owner')).toBeNull();
            expect(queryButton(fixture, 'Remove Reviewers')).toBeNull();
        });

        it('offers in an invitation the extra roles of the organization chosen, dropping those of the one before', async () => {
            build(true);
            await renderForm();

            expect(queryControl(fixture, 'Additional roles')).toBeNull();

            await chooseOrganization('o1');
            await pick('Additional roles', 'Reviewers');

            expect(rowsOf('Additional roles')).toEqual(['Reviewers']);

            await chooseOrganization('o2');
            await openSearch('Additional roles');

            expect(fixture.nativeElement.textContent).toContain('No additional roles.');
            expect(textsOf(suggestions())).toEqual(['Auditors']);

            await chooseOrganization('o3');

            expect(queryControl(fixture, 'Additional roles')).toBeNull();
            expect(fixture.nativeElement.textContent).not.toContain('No additional roles.');
        });
    });
});
