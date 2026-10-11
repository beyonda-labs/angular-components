import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { buttonByName, queryAll, queryButton, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { SessionUser } from '../../services/session/models/session.model';
import { ModalFormConfig } from '../form/components/modal/models/modal-form.model';
import { FormHandle } from '../form/models/form.model';
import { FormField } from '../form/models/form-field.model';
import rolesEn from './assets/roles.en.json';
import { RoleFormValue, RolePermissionEntry, RoleRow, RolesConfig } from './models/roles.model';
import { RolesComponent } from './roles.component';

const MANAGER: SessionUser = {
    allowedPaths: ['/roles'],
    email: 'manager@example.test',
    organizationId: 'o2',
    redirectPath: '/roles',
    roles: ['adminuser']
};
const PERMISSIONS: RolePermissionEntry[] = [
    { group: 'templates', key: 'templates.edit' },
    { group: 'templates', key: 'templates.publish' },
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

    it('offers nothing to change on a base role, as the backend lists no action for it', async () => {
        await render();

        await click(rowWith('normaluser'));

        expect(queryButton(fixture, `${PREFIX}.actions.edit.label`)).toBeNull();
        expect(queryButton(fixture, 'angular-components.header.menu')).toBeNull();
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
});
