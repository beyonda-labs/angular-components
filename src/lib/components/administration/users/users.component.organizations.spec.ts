import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, queryAll, queryButton, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { SessionUser } from '../../../services/session/models/session.model';
import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormHandle } from '../../form/models/form.model';
import { FormField } from '../../form/models/form-field.model';
import { PageItemType } from '../../page/models/page-categories.model';
import { PageOrganization } from '../../page/models/page-organization.model';
import { PageSearch } from '../../page/models/page-search.model';
import { OrganizationFolder } from '../models/organization-folders.model';
import { UserEditableField, UserRow, UsersConfig, UserStatus } from './models/users.model';
import { UsersComponent } from './users.component';

const ORGANIZATIONS: PageOrganization[] = [
    { id: 'o1', name: 'Acme' },
    { id: 'o2', name: 'Globex' }
];
const ACME: OrganizationFolder = {
    actions: [],
    entryType: PageItemType.Category,
    id: 'o1',
    name: 'Acme',
    itemCount: 1
};
const GLOBEX: OrganizationFolder = { actions: [], entryType: PageItemType.Category, id: 'o2', name: 'Globex' };
const ORGANIZATIONS_URL = 'https://api.test/api/users/organizations';
const PREFIX = 'angular-components.users';
const SEARCH_DEBOUNCE_MS = 350;
const USERS_URL = 'https://api.test/api/users';

describe('UsersComponent — organizations', () => {
    let fixture: ComponentFixture<UsersComponent>;
    let httpTesting: HttpTestingController;

    function buildUser(overrides: Partial<UserRow> = {}): UserRow {
        return {
            actions: ['edit'],
            createdAt: 0,
            email: 'ada@example.test',
            id: 'u1',
            name: 'Ada',
            organizationId: 'o2',
            organizationName: 'Globex',
            roles: ['editor'],
            status: UserStatus.Active,
            ...overrides
        };
    }

    function buildSuperadmin(overrides: Partial<UserRow> = {}): UserRow {
        return buildUser({
            actions: [],
            email: 'root@example.test',
            id: 'root',
            name: 'Root',
            organizationId: null,
            organizationName: null,
            roles: ['superadmin'],
            ...overrides
        });
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

    async function configure(roles: string[], organizationId?: string): Promise<void> {
        const user: SessionUser = {
            allowedPaths: ['/users'],
            email: 'root@example.test',
            organizationId,
            redirectPath: '/users',
            roles
        };

        await TestBed.configureTestingModule({
            imports: [UsersComponent],
            providers: [provideRouter([]), provideBeyTesting({ user })]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    }

    async function render(
        organizations: PageOrganization[] | null,
        users: (UserRow | OrganizationFolder)[] = [buildUser()],
        globalActions: string[] = ['create']
    ): Promise<TestRequest> {
        fixture = await renderComponent(UsersComponent, { config: new UsersConfig() });

        if (organizations) {
            httpTesting.expectOne(ORGANIZATIONS_URL).flush({ organizations });
        }

        httpTesting.expectOne(`${USERS_URL}/roles`).flush({ roles: ['adminuser', 'editor'] });
        await settle(fixture);
        const request = answerList(users, globalActions);
        await settle(fixture);

        return request;
    }

    function answerList(
        users: (UserRow | OrganizationFolder)[] = [buildUser()],
        globalActions: string[] = ['create']
    ): TestRequest {
        const request = httpTesting.expectOne(current => current.url === USERS_URL && current.method === 'GET');

        request.flush({ globalActions, results: users, search: { total: users.length } });

        return request;
    }

    function breadcrumb(): string {
        return queryAll(fixture, 'nav[aria-label="angular-components.breadcrumb.label"]')[0]?.textContent ?? '';
    }

    function fieldsOf(form: ModalFormConfig | undefined): FormField[] {
        return form?.sections.flatMap(section => section.rows.flatMap(row => row.fields)) ?? [];
    }

    function filterSelects(): HTMLSelectElement[] {
        return queryAll<HTMLSelectElement>(queryAll(fixture, '[role="group"]')[0], 'select');
    }

    function rowWith(text: string): HTMLElement {
        const row = queryAll(fixture, '[role="row"]').find(candidate => candidate.textContent?.includes(text));

        if (!row) {
            throw new Error(`No row with ${text}`);
        }

        return row;
    }

    async function choose(select: HTMLSelectElement, value: string): Promise<void> {
        select.value = value;
        select.dispatchEvent(new Event('change'));
        await settle(fixture);
    }

    async function click(button: HTMLElement): Promise<void> {
        button.click();
        await settle(fixture);
    }

    async function openAcme(
        users: UserRow[] = [buildUser({ organizationId: 'o1', organizationName: 'Acme' })]
    ): Promise<TestRequest> {
        await click(buttonByName(fixture, 'Acme'));
        httpTesting.expectOne(`${USERS_URL}/categories/o1/path`).flush([{ id: 'o1', name: 'Acme' }]);
        await settle(fixture);
        const request = answerList(users);
        await settle(fixture);

        return request;
    }

    async function invite(main: Record<string, unknown>): Promise<TestRequest> {
        await click(buttonByName(fixture, `${PREFIX}.actions.create.label`));
        TestBed.inject(FakeModalFormService).forms().at(-1)?.onSubmit?.({ main }, buildHandle());

        return httpTesting.expectOne(current => current.url === USERS_URL && current.method === 'POST');
    }

    async function searchFor(text: string, users: UserRow[]): Promise<TestRequest> {
        const box = fixture.nativeElement.querySelector('[role="searchbox"]') as HTMLInputElement;

        box.value = text;
        box.dispatchEvent(new Event('input'));
        await new Promise(resolve => {
            setTimeout(resolve, SEARCH_DEBOUNCE_MS);
        });
        await settle(fixture);
        const request = answerList(users);
        await settle(fixture);

        return request;
    }

    function lastForm(): ModalFormConfig | undefined {
        return TestBed.inject(FakeModalFormService).forms().at(-1);
    }

    function organizationField(): FormField | undefined {
        return fieldsOf(lastForm()).find(field => field.key === 'organizationId');
    }

    afterEach(() => {
        httpTesting.verify();
    });

    describe('for a superadmin of several organizations', () => {
        beforeEach(async () => {
            await configure(['superadmin']);
            await render(ORGANIZATIONS, [ACME, GLOBEX, buildSuperadmin()]);
        });

        it('shows the organization of every user a search at the root finds, the superadmins as the system', async () => {
            await searchFor('example', [
                buildUser(),
                buildSuperadmin(),
                buildUser({
                    email: 'initech@example.test',
                    id: 'u3',
                    organizationId: 'o3',
                    organizationName: 'Initech',
                    status: UserStatus.Inactive
                })
            ]);

            expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.columns.organization`);
            expect(rowWith('ada@example.test').textContent).toContain('Globex');
            expect(rowWith('root@example.test').textContent).toContain(`${PREFIX}.table.system`);
            expect(rowWith('initech@example.test').textContent).toContain('Initech');
        });

        it('filters the users by the organization chosen, with equals', async () => {
            await click(queryAll<HTMLButtonElement>(fixture, 'bey-search [aria-expanded]')[0]);
            await click(buttonByName(fixture, 'angular-components.search.add'));
            await choose(filterSelects()[0], 'organizationId');
            await choose(filterSelects()[2], 'o1');
            await click(buttonByName(fixture, 'angular-components.search.apply'));
            const search = JSON.parse(atob(answerList().request.params.get('search') ?? '')) as PageSearch;

            expect(search.filters).toEqual([{ field: 'organizationId', operator: 'equals', value: 'o1' }]);
        });

        it('invites into the organization chosen, which it never chooses for the superadmin', async () => {
            const request = await invite({ email: 'grace@example.test', organizationId: 'o1', roles: ['editor'] });
            request.flush(buildUser({ email: 'grace@example.test', id: 'u2' }));
            await settle(fixture);
            answerList();

            expect(organizationField()).toMatchObject({
                isRequired: true,
                options: [
                    { label: 'Acme', value: 'o1' },
                    { label: 'Globex', value: 'o2' }
                ]
            });
            expect(lastForm()?.initialValue).toBeUndefined();
            expect(request.request.body).toEqual({
                email: 'grace@example.test',
                organizationId: 'o1',
                parentId: null,
                roles: ['editor']
            });
        });
    });

    describe('folders per organization for a superadmin', () => {
        let rootRequest: TestRequest;

        beforeEach(async () => {
            await configure(['superadmin']);
            rootRequest = await render(ORGANIZATIONS, [ACME, GLOBEX, buildSuperadmin()]);
        });

        it('lists one folder per organization at the root, next to the superadmins, with no organization column', () => {
            expect(rootRequest.request.params.get('parentId')).toBe('null');
            expect(buttonByName(fixture, 'Acme')).toBeTruthy();
            expect(buttonByName(fixture, 'Globex')).toBeTruthy();
            expect(rowWith('root@example.test').textContent).not.toContain(`${PREFIX}.table.system`);
            expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.organization`);
            expect(breadcrumb()).toContain(`${PREFIX}.categories.root`);
        });

        it('opens the folder of an organization from its name, with its users under its breadcrumb', async () => {
            const request = await openAcme();

            expect(request.request.params.get('parentId')).toBe('o1');
            expect(rowWith('ada@example.test').textContent).not.toContain('Acme');
            expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.organization`);
            expect(breadcrumb()).toContain('Acme');
        });

        it('keeps the organization column out of a search inside a folder', async () => {
            await openAcme();
            const request = await searchFor('ada', [buildUser({ organizationId: 'o1', organizationName: 'Acme' })]);

            expect(request.request.params.get('parentId')).toBe('o1');
            expect(rowWith('ada@example.test').textContent).not.toContain('Acme');
            expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.organization`);
        });

        it('offers nothing to do on a folder', async () => {
            await click(rowWith('Acme'));

            expect(queryAll<HTMLInputElement>(rowWith('Acme'), 'input[type="checkbox"]')[0].checked).toBe(true);
            expect(queryButton(fixture, `${PREFIX}.actions.edit.label`)).toBeNull();
            expect(queryButton(fixture, 'angular-components.header.menu')).toBeNull();
        });

        it('invites into the organization of the open folder, chosen already and still open to change', async () => {
            await openAcme();
            const request = await invite({ email: 'grace@example.test', organizationId: 'o1', roles: ['editor'] });
            request.flush(buildUser({ email: 'grace@example.test', id: 'u2' }));
            await settle(fixture);
            answerList();

            expect(lastForm()?.initialValue).toEqual({ main: { organizationId: 'o1', roles: [] } });
            expect(organizationField()).toMatchObject({ isDisabled: false, isRequired: true });
            expect(request.request.body).toEqual({
                email: 'grace@example.test',
                organizationId: 'o1',
                parentId: 'o1',
                roles: ['editor']
            });
        });

        it('searches every organization from the root, each user answered with its organization', async () => {
            await click(queryAll<HTMLButtonElement>(fixture, 'bey-search [aria-expanded]')[0]);
            await click(buttonByName(fixture, 'angular-components.search.add'));
            await choose(filterSelects()[0], 'status');
            await choose(filterSelects()[2], 'active');
            await click(buttonByName(fixture, 'angular-components.search.apply'));
            const request = answerList([
                buildUser({ organizationId: 'o1', organizationName: 'Acme' }),
                buildUser({ email: 'grace@example.test', id: 'u2' })
            ]);
            await settle(fixture);
            const search = JSON.parse(atob(request.request.params.get('search') ?? '')) as PageSearch;

            expect(request.request.params.get('parentId')).toBe('null');
            expect(search.filters).toEqual([{ field: 'status', operator: 'equals', value: 'active' }]);
            expect(rowWith('ada@example.test').textContent).toContain('Acme');
            expect(rowWith('grace@example.test').textContent).toContain('Globex');
        });
    });

    it('lists the users of a manager flat, with no folder and no parent', async () => {
        await configure(['adminuser'], 'o2');
        const request = await render(null, [buildUser({ organizationId: undefined, organizationName: undefined })]);

        expect(request.request.params.has('parentId')).toBe(false);
        expect(breadcrumb()).toBe('');
    });

    it('lets a superadmin change only the status of another superadmin, every other field disabled', async () => {
        await configure(['superadmin']);
        await render(ORGANIZATIONS, [
            buildSuperadmin({
                actions: ['edit'],
                editableFields: [UserEditableField.Status],
                id: 'root-2',
                name: 'Second'
            })
        ]);

        await click(buttonByName(fixture, 'Second'));
        const form = lastForm();
        form?.onSubmit?.(
            { main: { name: 'Renamed', roles: ['superadmin'], status: 'inactive', surname: '' } },
            buildHandle()
        );
        const request = httpTesting.expectOne(`${USERS_URL}/root-2`);
        request.flush(buildSuperadmin({ id: 'root-2', status: UserStatus.Inactive }));
        await settle(fixture);
        answerList();

        expect(fieldsOf(form).map(({ isDisabled, key }) => [key, isDisabled])).toEqual([
            ['email', false],
            ['name', true],
            ['surname', true],
            ['status', false],
            ['roles', true]
        ]);
        expect(request.request.body).toEqual({ status: 'inactive' });
        expect(queryButton(fixture, `${PREFIX}.actions.change-status.label`)).toBeNull();
    });

    describe('for a superadmin of a single organization', () => {
        beforeEach(async () => {
            await configure(['superadmin']);
            await render([{ id: 'o2', name: 'Globex' }], [GLOBEX, buildSuperadmin()]);
        });

        it('shows the organization column in a search at the root, since the superadmins count as one more', async () => {
            await searchFor('example', [buildUser(), buildSuperadmin()]);

            expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.columns.organization`);
            expect(rowWith('root@example.test').textContent).toContain(`${PREFIX}.table.system`);
        });

        it('still asks for the organization when inviting, chosen already, and sends it', async () => {
            const request = await invite({ email: 'grace@example.test', organizationId: 'o2', roles: ['editor'] });
            request.flush(buildUser({ id: 'u2' }));
            await settle(fixture);
            answerList();

            expect(organizationField()).toMatchObject({
                isRequired: true,
                options: [{ label: 'Globex', value: 'o2' }]
            });
            expect(lastForm()?.initialValue).toEqual({ main: { organizationId: 'o2', roles: [] } });
            expect(request.request.body).toEqual({
                email: 'grace@example.test',
                organizationId: 'o2',
                parentId: null,
                roles: ['editor']
            });
        });
    });

    it('shows a superadmin with no active organization only the superadmins, with no invitation', async () => {
        await configure(['superadmin']);
        await render([], [buildSuperadmin()], []);

        expect(rowWith('root@example.test')).toBeTruthy();
        expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.organization`);
        expect(queryButton(fixture, `${PREFIX}.actions.create.label`)).toBeNull();
    });

    it.each([
        ['a manager', ['adminuser']],
        ['a normal user', ['editor']]
    ])('asks nothing about organizations for %s, and invites into their own', async (_, roles) => {
        await configure(roles, 'o2');
        await render(null, [buildUser({ organizationId: undefined, organizationName: undefined })]);

        const request = await invite({ email: 'grace@example.test', roles: ['editor'] });
        request.flush(buildUser({ id: 'u2' }));
        await settle(fixture);
        answerList();

        httpTesting.expectNone(ORGANIZATIONS_URL);
        expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.organization`);
        expect(organizationField()).toBeUndefined();
        expect(request.request.body).toEqual({ email: 'grace@example.test', roles: ['editor'] });
    });
});
