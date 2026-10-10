import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, queryAll, queryButton, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { ModalFormConfig } from '../form/components/modal/models/modal-form.model';
import { FormInfoField } from '../form/models/fields/form-info-field.model';
import { FormSelectField } from '../form/models/fields/form-select-field.model';
import { FormHandle } from '../form/models/form.model';
import { FormField } from '../form/models/form-field.model';
import { OrganizationRow, OrganizationsConfig, OrganizationStatus } from './models/organizations.model';
import { OrganizationsComponent } from './organizations.component';

const ORGANIZATIONS_URL = 'https://api.test/api/organizations';
const PREFIX = 'angular-components.organizations';
const USERS_URL = 'https://api.test/api/users';

describe('OrganizationsComponent', () => {
    let fixture: ComponentFixture<OrganizationsComponent>;
    let httpTesting: HttpTestingController;
    let modalForms: FakeModalFormService;

    function buildOrganization(overrides: Partial<OrganizationRow> = {}): OrganizationRow {
        return {
            actions: ['edit', 'change-status', 'invite-admin'],
            createdAt: Date.UTC(2026, 0, 2),
            id: 'o2',
            name: 'Globex',
            status: OrganizationStatus.Active,
            userCount: 7,
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
        organizations: OrganizationRow[] = [buildOrganization()],
        globalActions: string[] = ['create'],
        config = new OrganizationsConfig()
    ): Promise<void> {
        fixture = await renderComponent(OrganizationsComponent, { config });
        reload().flush({
            globalActions,
            results: organizations,
            search: { filters: [], page: 1, size: 25, total: organizations.length }
        });
        await settle(fixture);
    }

    function reload(url = ORGANIZATIONS_URL): TestRequest {
        return httpTesting.expectOne(request => request.url === url && request.method === 'GET');
    }

    function rowWith(text: string): HTMLElement {
        const row = queryAll(fixture, '[role="row"]').find(candidate => candidate.textContent?.includes(text));

        if (!row) {
            throw new Error(`No row with ${text}`);
        }

        return row;
    }

    function fieldsOf(form: ModalFormConfig | undefined): FormField[] {
        return form?.sections.flatMap(section => section.rows.flatMap(row => row.fields)) ?? [];
    }

    async function openMenu(rowText: string): Promise<void> {
        rowWith(rowText).click();
        await settle(fixture);
        buttonByName(fixture, 'angular-components.header.menu').click();
        await settle(fixture);
    }

    async function useMenuAction(rowText: string, action: string): Promise<void> {
        await openMenu(rowText);
        buttonByName(fixture, `${PREFIX}.actions.${action}.label`).click();
        await settle(fixture);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OrganizationsComponent],
            providers: [provideRouter([]), provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        modalForms = TestBed.inject(FakeModalFormService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('lists the organizations by name, with their status and how many users they have', async () => {
        await render([
            buildOrganization(),
            buildOrganization({ id: 'o3', name: 'Initech', status: OrganizationStatus.Inactive, userCount: 0 })
        ]);

        expect(rowWith('Globex').textContent).toContain(`${PREFIX}.status.active`);
        expect(rowWith('Globex').textContent).toContain('7');
        expect(rowWith('Initech').textContent).toContain(`${PREFIX}.status.inactive`);
        expect(rowWith('Initech').textContent).toContain('0');
    });

    it('sorts the organizations by name at first', async () => {
        fixture = await renderComponent(OrganizationsComponent, { config: new OrganizationsConfig() });
        const request = reload();
        request.flush({ globalActions: [], results: [] });
        await settle(fixture);

        expect(JSON.parse(atob(request.request.params.get('search') ?? ''))).toEqual(
            expect.objectContaining({ sort: { direction: 'asc', field: 'name' } })
        );
    });

    it('creates an organization with the name typed, trimmed', async () => {
        await render();

        buttonByName(fixture, `${PREFIX}.actions.create.label`).click();
        await settle(fixture);
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.({ main: { name: '  Initech ' } }, buildHandle());
        const request = httpTesting.expectOne(
            current => current.url === ORGANIZATIONS_URL && current.method === 'POST'
        );
        request.flush(buildOrganization({ id: 'o3', name: 'Initech' }));
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(form?.title).toBe(`${PREFIX}.form.create.title`);
        expect(fieldsOf(form).map(field => field.key)).toEqual(['name']);
        expect(request.request.body).toEqual({ name: 'Initech' });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.create-success` }]);
    });

    it('renames an organization from its name', async () => {
        await render();

        buttonByName(fixture, 'Globex').click();
        await settle(fixture);
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.({ main: { name: 'Globex Corporation' } }, buildHandle());
        const request = httpTesting.expectOne(`${ORGANIZATIONS_URL}/o2`);
        request.flush(buildOrganization({ name: 'Globex Corporation' }));
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(form?.title).toBe(`${PREFIX}.form.edit.title`);
        expect(form?.initialValue).toEqual({ main: { name: 'Globex' } });
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ name: 'Globex Corporation' });
    });

    it('deactivates an active organization and reactivates an inactive one', async () => {
        await render([
            buildOrganization(),
            buildOrganization({ id: 'o3', name: 'Initech', status: OrganizationStatus.Inactive })
        ]);

        await useMenuAction('Globex', 'change-status');
        const deactivation = modalForms.forms().at(-1);
        deactivation?.onSubmit?.({ main: { status: 'inactive' } }, buildHandle());
        const request = httpTesting.expectOne(`${ORGANIZATIONS_URL}/o2/status`);
        request.flush(buildOrganization({ status: OrganizationStatus.Inactive }));
        await settle(fixture);
        reload().flush({
            globalActions: [],
            results: [buildOrganization({ id: 'o3', name: 'Initech', status: OrganizationStatus.Inactive })]
        });
        await settle(fixture);
        await useMenuAction('Initech', 'change-status');

        expect((fieldsOf(deactivation)[0] as FormSelectField).options).toEqual([
            { label: `${PREFIX}.status.inactive`, value: 'inactive' }
        ]);
        expect(request.request.body).toEqual({ status: 'inactive' });
        expect((fieldsOf(modalForms.forms().at(-1))[0] as FormSelectField).options).toEqual([
            { label: `${PREFIX}.status.active`, value: 'active' }
        ]);
    });

    it('never offers to deactivate an organization that holds an active superadmin', async () => {
        await render([buildOrganization({ actions: ['edit', 'invite-admin'] })]);

        await openMenu('Globex');

        expect(queryButton(fixture, `${PREFIX}.actions.change-status.label`)).toBeNull();
        expect(queryButton(fixture, `${PREFIX}.actions.invite-admin.label`)).not.toBeNull();
    });

    it('shows the reason the server gives for refusing a deactivation', async () => {
        await render();

        await useMenuAction('Globex', 'change-status');
        modalForms
            .forms()
            .at(-1)
            ?.onSubmit?.({ main: { status: 'inactive' } }, buildHandle());
        httpTesting
            .expectOne(`${ORGANIZATIONS_URL}/o2/status`)
            .flush(
                { errorCode: 'conflict', messageKey: 'organizations.has-superadmin' },
                { status: 409, statusText: 'Conflict' }
            );
        await settle(fixture);

        expect(TestBed.inject(FakeModalService).errors()).toEqual([
            expect.objectContaining({
                message: 'angular-components.http.error.organizations.has-superadmin'
            })
        ]);
    });

    it('invites the admin of an organization into it, with the admin role of the config', async () => {
        await render(undefined, undefined, new OrganizationsConfig({ adminRole: 'manager', usersUrl: '/staff' }));

        await useMenuAction('Globex', 'invite-admin');
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.(
            { main: { email: ' grace@example.test ', language: 'es', name: 'Grace', surname: ' ' } },
            buildHandle()
        );
        const request = httpTesting.expectOne('https://api.test/api/staff');
        request.flush({ id: 'u9' });
        await settle(fixture);
        reload().flush({ globalActions: [], results: [buildOrganization({ userCount: 8 })] });

        expect(form?.title).toBe(`${PREFIX}.invite-admin.title`);
        expect((fieldsOf(form)[0] as FormInfoField).items).toEqual([{ label: 'Globex' }]);
        expect(fieldsOf(form).map(field => field.key)).toEqual([
            'organization',
            'email',
            'name',
            'surname',
            'language'
        ]);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({
            email: 'grace@example.test',
            language: 'es',
            name: 'Grace',
            organizationId: 'o2',
            roles: ['manager']
        });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([
            { message: `${PREFIX}.toast.invite-admin-success` }
        ]);
    });

    it('invites the admin with the role adminuser and into /users by default', async () => {
        await render();

        await useMenuAction('Globex', 'invite-admin');
        modalForms
            .forms()
            .at(-1)
            ?.onSubmit?.({ main: { email: 'grace@example.test' } }, buildHandle());
        const request = httpTesting.expectOne(USERS_URL);
        request.flush({ id: 'u9' });
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(request.request.body).toEqual({
            email: 'grace@example.test',
            organizationId: 'o2',
            roles: ['adminuser']
        });
    });

    it('offers only the actions the backend lists', async () => {
        await render([buildOrganization({ actions: [] })], []);

        rowWith('Globex').click();
        await settle(fixture);

        expect(queryButton(fixture, `${PREFIX}.actions.create.label`)).toBeNull();
        expect(queryButton(fixture, `${PREFIX}.actions.invite-admin.label`)).toBeNull();
        expect(queryButton(fixture, 'Globex')).toBeNull();
    });
});
