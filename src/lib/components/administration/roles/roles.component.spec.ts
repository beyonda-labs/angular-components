import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { buttonByName, queryAll, queryButton, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { SessionUser } from '../../../services/session/models/session.model';
import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormCheckboxSectionsField } from '../../form/models/fields/form-checkbox-sections-field.model';
import { FormHandle } from '../../form/models/form.model';
import { FormField } from '../../form/models/form-field.model';
import { RolePermissionEntry } from '../models/role-permissions.model';
import rolesEn from './assets/roles.en.json';
import { RoleFormValue, RoleRow, RolesConfig, RoleSourceType } from './models/roles.model';
import { RolesComponent } from './roles.component';

const MANAGER: SessionUser = {
    allowedPaths: ['/roles'],
    email: 'manager@example.test',
    organizationId: 'o2',
    redirectPath: '/roles',
    roles: ['adminuser']
};
const PERMISSIONS: RolePermissionEntry[] = [
    { group: 'templates', key: 'templates.publish' },
    { group: 'templates', key: 'templates.edit' },
    { group: 'documents', key: 'documents.read' }
];
const PERMISSIONS_URL = 'https://api.test/api/roles/permissions';
const PREFIX = 'angular-components.roles';
const ROLES_URL = 'https://api.test/api/roles';

describe('RolesComponent', () => {
    let fixture: ComponentFixture<RolesComponent>;
    let httpTesting: HttpTestingController;
    let modalForms: FakeModalFormService;

    function buildBase(overrides: Partial<RoleRow> = {}): RoleRow {
        return {
            actions: [],
            id: 'normaluser',
            isBase: true,
            memberCount: 5,
            name: 'normaluser',
            permissions: ['documents.read'],
            ...overrides
        };
    }

    function buildRole(overrides: Partial<RoleRow> = {}): RoleRow {
        return {
            actions: ['edit', 'delete'],
            description: 'Review the templates',
            groupCount: 3,
            id: 'r1',
            isBase: false,
            memberCount: 2,
            name: 'Reviewers',
            permissions: ['templates.edit', 'templates.publish'],
            ...overrides
        };
    }

    function buildHandle(): FormHandle<unknown> {
        return {
            close: jest.fn(),
            goToStep: jest.fn(),
            isDirty: jest.fn(() => true),
            patchValue: jest.fn(),
            requestClose: jest.fn(),
            reset: jest.fn(),
            value: jest.fn()
        };
    }

    async function render(
        roles: RoleRow[] = [buildBase(), buildRole()],
        globalActions: string[] = ['create'],
        config = new RolesConfig()
    ): Promise<void> {
        fixture = await renderComponent(RolesComponent, { config });
        httpTesting.expectOne(PERMISSIONS_URL).flush({ permissions: PERMISSIONS });
        await settle(fixture);
        reload().flush({
            globalActions,
            results: roles,
            search: { filters: [], page: 1, size: 25, total: roles.length }
        });
        await settle(fixture);
    }

    function reload(url = ROLES_URL): TestRequest {
        return httpTesting.expectOne(request => request.url === url && request.method === 'GET');
    }

    function rowWith(text: string): HTMLElement {
        const row = queryAll(fixture, '[role="row"]').find(candidate => candidate.textContent?.includes(text));

        if (!row) {
            throw new Error(`No row with ${text}`);
        }

        return row;
    }

    function fieldsOf(form: ModalFormConfig | undefined, section: string): FormField[] {
        return (
            form?.sections
                .filter(({ key }) => key === section)
                .flatMap(({ rows }) => rows.flatMap(row => row.fields)) ?? []
        );
    }

    function permissionsOffered(): [string, string[]][] {
        const [checklist] = fieldsOf(modalForms.forms().at(-1), 'permissions') as FormCheckboxSectionsField[];

        return checklist.sections.map(({ key, options }) => [key, options.map(({ value }) => value)]);
    }

    async function click(button: HTMLElement): Promise<void> {
        button.click();
        await settle(fixture);
    }

    async function useMenuAction(rowText: string, action: string): Promise<void> {
        await click(rowWith(rowText));
        await click(buttonByName(fixture, 'angular-components.header.menu'));
        await click(buttonByName(fixture, `${PREFIX}.actions.${action}.label`));
    }

    async function editReviewers(main: Record<string, unknown>, permissions: string[]): Promise<TestRequest> {
        await click(buttonByName(fixture, 'Reviewers'));
        modalForms.forms().at(-1)?.onSubmit?.({ main, permissions: { permissions } }, buildHandle());

        return httpTesting.expectOne(`${ROLES_URL}/r1`);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RolesComponent],
            providers: [provideRouter([]), provideBeyTesting({ user: MANAGER })]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        modalForms = TestBed.inject(FakeModalFormService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('lists the base roles and the extra roles, with their type, permission, member and group counts', async () => {
        await render();

        expect(rowWith('normaluser').textContent).toContain(`${PREFIX}.type.base`);
        expect(rowWith('normaluser').textContent).toContain('5');
        expect(rowWith('Reviewers').textContent).toContain(`${PREFIX}.type.extra`);
        expect(rowWith('Reviewers').textContent).toContain('Review the templates');
        expect(rowWith('Reviewers').textContent).toContain('2');
        expect(rowWith('Reviewers').textContent).toContain('3');
        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.columns.group-count`);
    });

    it('labels the base roles from the role prefix of the config', async () => {
        TestBed.inject(TranslateService).setTranslation('en', { 'my-app': { roles: { normaluser: 'User' } } }, true);

        await render(undefined, undefined, new RolesConfig({ rolePrefix: 'my-app.roles' }));

        expect(rowWith('User').textContent).toContain(`${PREFIX}.type.base`);
    });

    it('creates a role with its name, description and the permissions checked, in the organization of the manager', async () => {
        await render();

        await click(buttonByName(fixture, `${PREFIX}.actions.create.label`));
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.(
            {
                main: { description: ' Read only ', name: ' Readers ' },
                permissions: { permissions: ['documents.read'] }
            },
            buildHandle()
        );
        const request = httpTesting.expectOne(current => current.url === ROLES_URL && current.method === 'POST');
        request.flush(buildRole({ id: 'r2', name: 'Readers' }));
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(form?.title).toBe(`${PREFIX}.form.create.title`);
        expect(fieldsOf(form, 'main').map(({ key }) => key)).toEqual(['name', 'description']);
        expect(fieldsOf(form, 'permissions').map(({ key, label }) => [key, label])).toEqual([
            ['permissions', `${PREFIX}.form.permissions.label`]
        ]);
        expect(request.request.body).toEqual({
            name: 'Readers',
            description: 'Read only',
            permissions: ['documents.read']
        });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.create-success` }]);
    });

    it('offers the permissions by group in the order of the server, each group in the default order of the actions', async () => {
        await render();

        await click(buttonByName(fixture, `${PREFIX}.actions.create.label`));

        expect(permissionsOffered()).toEqual([
            ['templates', ['templates.edit', 'templates.publish']],
            ['documents', ['documents.read']]
        ]);
    });

    it('offers the permissions in the order of the groups and the actions the config gives', async () => {
        await render(undefined, undefined, new RolesConfig({ actionOrder: ['publish'], groupOrder: ['documents'] }));

        await click(buttonByName(fixture, `${PREFIX}.actions.create.label`));

        expect(permissionsOffered()).toEqual([
            ['documents', ['documents.read']],
            ['templates', ['templates.publish', 'templates.edit']]
        ]);
    });

    it('edits an extra role from its name, with its permissions checked', async () => {
        await render();

        const request = await editReviewers({ description: 'Review', name: 'Reviewers' }, [
            'documents.read',
            'templates.edit'
        ]);
        request.flush(buildRole());
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(modalForms.forms().at(-1)?.title).toBe(`${PREFIX}.form.edit.title`);
        expect(modalForms.forms().at(-1)?.initialValue).toEqual({
            main: { description: 'Review the templates', name: 'Reviewers' },
            permissions: { permissions: ['templates.edit', 'templates.publish'] }
        });
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({
            name: 'Reviewers',
            description: 'Review',
            permissions: ['documents.read', 'templates.edit']
        });
    });

    it('shows the permissions of a base role from its name, in a form that only shows them', async () => {
        await render();

        await click(buttonByName(fixture, 'normaluser'));
        const form = modalForms.forms().at(-1);

        expect(form?.title).toBe(`${PREFIX}.view.title`);
        expect(form?.isSubmitHidden).toBe(true);
        expect(fieldsOf(form, 'permissions').every(({ isDisabled }) => isDisabled === true)).toBe(true);
        expect((form?.initialValue as RoleFormValue | undefined)?.permissions).toEqual({
            permissions: ['documents.read']
        });
    });

    it('deletes the roles selected once the user confirms that their users lose the permissions', async () => {
        const modal = TestBed.inject(FakeModalService);
        modal.setConfirmationAnswer(true);
        await render();

        await useMenuAction('Reviewers', 'delete');
        const request = httpTesting.expectOne(current => current.url === ROLES_URL && current.method === 'DELETE');
        request.flush(null);
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(modal.confirmations()).toEqual([
            expect.objectContaining({
                message: `${PREFIX}.modal.delete.message`,
                messageParameters: { count: 1 },
                title: `${PREFIX}.modal.delete.title`
            })
        ]);
        expect(request.request.body).toEqual({ ids: ['r1'] });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.delete-success` }]);
    });

    it('deletes nothing when the user does not confirm', async () => {
        await render();

        await useMenuAction('Reviewers', 'delete');

        httpTesting.expectNone(current => current.method === 'DELETE');
        expect(TestBed.inject(FakeModalService).confirmations()).toHaveLength(1);
    });

    it.each([
        ['an extra role', buildRole({ actions: ['edit', 'duplicate', 'delete'] }), 'Reviewers'],
        ['a base role', buildBase({ actions: ['duplicate'] }), 'normaluser']
    ])('offers to duplicate %s whose actions list it', async (_, role, name) => {
        await render([role]);

        await useMenuAction(name, 'duplicate');

        expect(modalForms.forms().at(-1)?.title).toBe(`${PREFIX}.duplicate.title`);
    });

    it('does not offer to duplicate a role whose actions leave it out', async () => {
        await render([buildRole({ actions: ['delete'] })]);

        await click(rowWith('Reviewers'));
        await click(buttonByName(fixture, 'angular-components.header.menu'));

        expect(queryButton(fixture, `${PREFIX}.actions.delete.label`)).not.toBeNull();
        expect(queryButton(fixture, `${PREFIX}.actions.duplicate.label`)).toBeNull();
    });

    it('duplicates a role in the create form filled in with it, then creates the copy and reloads', async () => {
        TestBed.inject(TranslateService).setTranslation(
            'en',
            { 'angular-components': { roles: { duplicate: { 'copy-suffix': '(copy)' } } } },
            true
        );
        await render([buildBase(), buildRole({ actions: ['edit', 'duplicate', 'delete'] })]);
        const handle = buildHandle();

        await useMenuAction('Reviewers', 'duplicate');
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.(
            {
                main: { description: 'Review', name: ' Reviewers (copy) ' },
                permissions: { permissions: ['templates.edit'] }
            },
            handle
        );
        const request = httpTesting.expectOne(current => current.url === ROLES_URL && current.method === 'POST');
        request.flush(buildRole({ id: 'r2', name: 'Reviewers (copy)' }));
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(fieldsOf(form, 'main').map(({ key }) => key)).toEqual(['name', 'description']);
        expect(form?.initialValue).toEqual({
            main: { description: 'Review the templates', name: 'Reviewers (copy)' },
            permissions: { permissions: ['templates.edit', 'templates.publish'] }
        });
        expect(request.request.body).toEqual({
            name: 'Reviewers (copy)',
            description: 'Review',
            permissions: ['templates.edit']
        });
        expect(handle.close).toHaveBeenCalled();
        expect(TestBed.inject(FakeToastService).successes()).toEqual([
            { message: `${PREFIX}.toast.duplicate-success` }
        ]);
    });

    it('keeps the duplicate form open, with the reason of the server, when the name is taken', async () => {
        await render([buildRole({ actions: ['duplicate'] })]);
        const handle = buildHandle();

        await useMenuAction('Reviewers', 'duplicate');
        modalForms
            .forms()
            .at(-1)
            ?.onSubmit?.({ main: { name: 'Reviewers' }, permissions: { permissions: ['templates.edit'] } }, handle);
        httpTesting
            .expectOne(current => current.url === ROLES_URL && current.method === 'POST')
            .flush({ errorCode: 'error', messageKey: 'roles.existing-name' }, { status: 409, statusText: '' });
        await settle(fixture);

        expect(handle.close).not.toHaveBeenCalled();
        expect(TestBed.inject(FakeModalService).errors()).toEqual([
            expect.objectContaining({ message: 'angular-components.http.error.roles.existing-name' })
        ]);
        expect(TestBed.inject(FakeToastService).successes()).toEqual([]);
    });

    it('offers nothing to change on a base role, as the backend lists no action for it', async () => {
        await render();

        await click(rowWith('normaluser'));

        expect(queryButton(fixture, `${PREFIX}.actions.edit.label`)).toBeNull();
        expect(queryButton(fixture, 'angular-components.header.menu')).toBeNull();
    });

    it('shows the permissions of the selected base role from the view action of the header, out of the menu', async () => {
        await render([buildBase({ actions: ['view', 'duplicate'] }), buildRole()]);

        await click(rowWith('normaluser'));

        expect(queryButton(fixture, `${PREFIX}.actions.edit.label`)).toBeNull();

        await click(buttonByName(fixture, 'angular-components.page.actions.view.label'));

        expect(modalForms.forms().at(-1)?.title).toBe(`${PREFIX}.view.title`);
        expect((modalForms.forms().at(-1)?.initialValue as RoleFormValue | undefined)?.permissions).toEqual({
            permissions: ['documents.read']
        });
    });

    it('offers no view on a role the caller edits, whose actions leave it out', async () => {
        await render([buildRole()]);

        await click(rowWith('Reviewers'));

        expect(queryButton(fixture, `${PREFIX}.actions.edit.label`)).not.toBeNull();
        expect(queryButton(fixture, 'angular-components.page.actions.view.label')).toBeNull();
    });

    it.each([
        [
            'roles.existing-name',
            409,
            'Name already in use',
            'There is already a role with this name in this organization, or it is the name of a base role.'
        ],
        [
            'roles.invalid-permissions',
            400,
            'Permissions not valid',
            'Some of the permissions chosen cannot go into a role: they are not yours to give, or they manage users, organizations or roles. Reload the page and try again.'
        ],
        [
            'roles.not-found',
            404,
            'Role not found',
            'This role does not exist or is out of your reach. Reload the page and try again.'
        ],
        ['roles.base-role', 409, 'Base role', 'The base roles of the application cannot be changed nor deleted.']
    ])(
        'shows the reason the server gives for refusing a role, such as %s',
        async (messageKey, status, title, message) => {
            const translate = TestBed.inject(TranslateService);
            await render();
            translate.setTranslation('en', rolesEn, true);

            const request = await editReviewers({ name: 'Reviewers' }, ['templates.edit']);
            request.flush({ errorCode: 'error', messageKey }, { status, statusText: '' });
            await settle(fixture);
            const [error] = TestBed.inject(FakeModalService).errors();

            expect([translate.instant(error.title), translate.instant(error.message)]).toEqual([title, message]);
        }
    );

    describe('for a member who reads their own roles', () => {
        const own = [
            buildBase({ actions: ['view'], memberCount: undefined, sources: [{ type: RoleSourceType.Direct }] }),
            buildRole({
                actions: ['view'],
                groupCount: undefined,
                memberCount: undefined,
                sources: [{ groupId: 'g1', groupName: 'Sales', type: RoleSourceType.Group }]
            })
        ];

        beforeEach(async () => {
            await render(own, []);
            reload().flush({ globalActions: [], results: own, search: { filters: [], page: 1, size: 25, total: 2 } });
            await settle(fixture);
        });

        it('says where each role comes from instead of who holds it', () => {
            const text = fixture.nativeElement.textContent as string;

            expect(text).toContain(`${PREFIX}.table.columns.sources`);
            expect(text).not.toContain(`${PREFIX}.table.columns.member-count`);
            expect(text).not.toContain(`${PREFIX}.table.columns.group-count`);
            expect(rowWith('normaluser').textContent).toContain(`${PREFIX}.sources.direct`);
            expect(rowWith('Reviewers').textContent).toContain(`${PREFIX}.sources.group`);
        });

        it('opens the permissions of a role from its name', async () => {
            await click(buttonByName(fixture, 'Reviewers'));

            expect(modalForms.forms().at(-1)?.title).toBe(`${PREFIX}.view.title`);
            expect((modalForms.forms().at(-1)?.initialValue as RoleFormValue | undefined)?.permissions).toEqual({
                permissions: ['templates.edit', 'templates.publish']
            });
        });

        it('opens the permissions of the selected role from the view action of the header', async () => {
            await click(rowWith('Reviewers'));
            await click(buttonByName(fixture, 'angular-components.page.actions.view.label'));

            expect(modalForms.forms().at(-1)?.title).toBe(`${PREFIX}.view.title`);
            expect((modalForms.forms().at(-1)?.initialValue as RoleFormValue | undefined)?.permissions).toEqual({
                permissions: ['templates.edit', 'templates.publish']
            });
        });
    });
});
