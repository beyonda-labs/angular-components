import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, queryAll, queryButton, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { ModalFormConfig } from '../form/components/modal/models/modal-form.model';
import { FormInfoField } from '../form/models/fields/form-info-field.model';
import { FormSelectField } from '../form/models/fields/form-select-field.model';
import { FormHandle } from '../form/models/form.model';
import { FormField } from '../form/models/form-field.model';
import { UserRow, UsersConfig, UserStatus } from './models/users.model';
import { UsersComponent } from './users.component';

const PREFIX = 'angular-components.users';
const SEARCH_DEBOUNCE_MS = 350;
const USERS_URL = 'https://api.test/api/users';

describe('UsersComponent', () => {
    let fixture: ComponentFixture<UsersComponent>;
    let httpTesting: HttpTestingController;
    let modalForms: FakeModalFormService;

    function buildUser(overrides: Partial<UserRow> = {}): UserRow {
        return {
            actions: ['edit', 'change-status'],
            createdAt: Date.UTC(2026, 0, 2),
            email: 'ada@example.test',
            id: 'u1',
            name: 'Ada',
            roles: ['editor'],
            status: UserStatus.Active,
            surname: 'Lovelace',
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
        users: UserRow[] = [buildUser()],
        globalActions: string[] = ['create'],
        config = new UsersConfig()
    ): Promise<void> {
        fixture = await renderComponent(UsersComponent, { config });
        httpTesting.expectOne(`${USERS_URL}/roles`).flush({ roles: ['admin', 'editor'] });
        await settle(fixture);
        httpTesting
            .expectOne(request => request.url === USERS_URL)
            .flush({ globalActions, results: users, search: { filters: [], page: 1, size: 25, total: users.length } });
        await settle(fixture);
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

    async function useMenuAction(rowText: string, action: string): Promise<void> {
        rowWith(rowText).click();
        await settle(fixture);
        buttonByName(fixture, 'angular-components.header.menu').click();
        await settle(fixture);
        buttonByName(fixture, `${PREFIX}.actions.${action}.label`).click();
        await settle(fixture);
    }

    function reload(): TestRequest {
        return httpTesting.expectOne(request => request.url === USERS_URL);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UsersComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting({
                    translations: { en: { 'my-app': { roles: { editor: 'Editor' } } } }
                })
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        modalForms = TestBed.inject(FakeModalFormService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('lists the users with their names, emails, roles and status', async () => {
        await render([
            buildUser(),
            buildUser({
                email: 'grace@example.test',
                id: 'u2',
                name: undefined,
                surname: undefined,
                status: UserStatus.Invited
            })
        ]);

        expect(rowWith('ada@example.test').textContent).toContain('Ada Lovelace');
        expect(rowWith('ada@example.test').textContent).toContain('editor');
        expect(rowWith('ada@example.test').textContent).toContain(`${PREFIX}.status.active`);
        expect(rowWith('grace@example.test').textContent).toContain(`${PREFIX}.table.no-name`);
        expect(rowWith('grace@example.test').textContent).toContain(`${PREFIX}.status.invited`);
    });

    it('labels the roles from the translations of the app, falling back to the name of the role', async () => {
        await render(
            [buildUser({ roles: ['editor', 'auditor'] })],
            [],
            new UsersConfig({ rolePrefix: 'my-app.roles' })
        );

        expect(rowWith('ada@example.test').textContent).toContain('Editor');
        expect(rowWith('ada@example.test').textContent).toContain('auditor');
    });

    it('sends the text of the search box as the text of the search, matching names and emails at once', async () => {
        await render();
        const box = fixture.nativeElement.querySelector('[role="searchbox"]') as HTMLInputElement;

        box.value = 'ada';
        box.dispatchEvent(new Event('input'));
        await new Promise(resolve => {
            setTimeout(resolve, SEARCH_DEBOUNCE_MS);
        });
        await settle(fixture);
        const request = reload();
        request.flush({ globalActions: [], results: [] });

        expect(JSON.parse(atob(request.request.params.get('search') ?? ''))).toEqual(
            expect.objectContaining({ filters: [], text: 'ada' })
        );
    });

    it('invites a user with the roles picked and the language of the invitation', async () => {
        await render();

        buttonByName(fixture, `${PREFIX}.actions.create.label`).click();
        await settle(fixture);
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.(
            { main: { email: ' grace@example.test ', language: 'es', name: 'Grace', roles: ['admin'], surname: '' } },
            buildHandle()
        );
        const request = httpTesting.expectOne(USERS_URL);
        request.flush(buildUser({ email: 'grace@example.test', id: 'u2' }));
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(form?.title).toBe(`${PREFIX}.form.create.title`);
        expect(fieldsOf(form).map(field => field.key)).toEqual(['email', 'name', 'surname', 'roles', 'language']);
        expect((fieldsOf(form).at(-1) as FormSelectField).options).toEqual([
            { label: 'English', value: 'en' },
            { label: 'Español', value: 'es' }
        ]);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({
            email: 'grace@example.test',
            language: 'es',
            name: 'Grace',
            roles: ['admin']
        });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.create-success` }]);
    });

    it('edits the roles and names of a user from its name, showing the email read-only', async () => {
        await render();

        buttonByName(fixture, 'Ada Lovelace').click();
        await settle(fixture);
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.({ main: { name: 'Ada', roles: ['admin', 'editor'], surname: 'Byron' } }, buildHandle());
        const request = httpTesting.expectOne(`${USERS_URL}/u1`);
        request.flush(buildUser());
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(form?.title).toBe(`${PREFIX}.form.edit.title`);
        expect(form?.initialValue).toEqual({ main: { name: 'Ada', roles: ['editor'], surname: 'Lovelace' } });
        expect((fieldsOf(form)[0] as FormInfoField).items).toEqual([{ label: 'ada@example.test' }]);
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ name: 'Ada', roles: ['admin', 'editor'], surname: 'Byron' });
    });

    it('changes the status of a user to one its current status reaches', async () => {
        await render([buildUser({ status: UserStatus.Unverified })]);

        await useMenuAction('ada@example.test', 'change-status');
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.({ main: { status: 'inactive' } }, buildHandle());
        const request = httpTesting.expectOne(`${USERS_URL}/u1/status`);
        request.flush(buildUser({ status: UserStatus.Inactive }));
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect((fieldsOf(form)[0] as FormSelectField).options).toEqual([
            { label: `${PREFIX}.status.inactive`, value: 'inactive' }
        ]);
        expect(request.request.body).toEqual({ status: 'inactive' });
    });

    it('sends the invitation again to an invited user', async () => {
        await render([buildUser({ actions: ['resend-invitation'], status: UserStatus.Invited })]);

        await useMenuAction('ada@example.test', 'resend-invitation');
        const request = httpTesting.expectOne(`${USERS_URL}/u1/invitation`);
        request.flush(null);

        expect(request.request.method).toBe('POST');
        expect(TestBed.inject(FakeToastService).successes()).toEqual([
            { message: `${PREFIX}.toast.resend-invitation-success` }
        ]);
    });

    it('offers only the actions the backend lists', async () => {
        await render([buildUser({ actions: [] })], []);

        rowWith('ada@example.test').click();
        await settle(fixture);

        expect(queryButton(fixture, `${PREFIX}.actions.create.label`)).toBeNull();
        expect(queryButton(fixture, `${PREFIX}.actions.edit.label`)).toBeNull();
        expect(queryButton(fixture, 'Ada Lovelace')).toBeNull();
    });

    it('still lists the users when the roles cannot be read', async () => {
        fixture = await renderComponent(UsersComponent, { config: new UsersConfig({ baseUrl: '/staff' }) });
        httpTesting.expectOne('https://api.test/api/staff/roles').flush(null, { status: 403, statusText: 'Forbidden' });
        await settle(fixture);
        httpTesting
            .expectOne(request => request.url === 'https://api.test/api/staff')
            .flush({ globalActions: [], results: [buildUser()] });
        await settle(fixture);

        expect(rowWith('ada@example.test')).toBeTruthy();
    });
});
