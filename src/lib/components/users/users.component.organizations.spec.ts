import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, queryAll, queryButton, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { SessionUser } from '../../services/session/models/session.model';
import { ModalFormConfig } from '../form/components/modal/models/modal-form.model';
import { FormHandle } from '../form/models/form.model';
import { FormField } from '../form/models/form-field.model';
import { PageOrganization } from '../page/models/page-organization.model';
import { PageSearch } from '../page/models/page-search.model';
import { UserRow, UsersConfig, UserStatus } from './models/users.model';
import { UsersComponent } from './users.component';

const ORGANIZATIONS: PageOrganization[] = [
    { id: 'o1', name: 'Acme' },
    { id: 'o2', name: 'Globex' }
];
const ORGANIZATIONS_URL = 'https://api.test/api/users/organizations';
const PREFIX = 'angular-components.users';
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
        users: UserRow[] = [buildUser()],
        globalActions: string[] = ['create']
    ): Promise<void> {
        fixture = await renderComponent(UsersComponent, { config: new UsersConfig() });

        if (organizations) {
            httpTesting.expectOne(ORGANIZATIONS_URL).flush({ organizations });
        }

        httpTesting.expectOne(`${USERS_URL}/roles`).flush({ roles: ['adminuser', 'editor'] });
        await settle(fixture);
        answerList(users, globalActions);
        await settle(fixture);
    }

    function answerList(users: UserRow[] = [buildUser()], globalActions: string[] = ['create']): TestRequest {
        const request = httpTesting.expectOne(current => current.url === USERS_URL && current.method === 'GET');

        request.flush({ globalActions, results: users, search: { total: users.length } });

        return request;
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

    async function invite(main: Record<string, unknown>): Promise<TestRequest> {
        await click(buttonByName(fixture, `${PREFIX}.actions.create.label`));
        TestBed.inject(FakeModalFormService).forms().at(-1)?.onSubmit?.({ main }, buildHandle());

        return httpTesting.expectOne(current => current.url === USERS_URL && current.method === 'POST');
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
            await render(ORGANIZATIONS, [
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
        });

        it('shows the organization of every user, the superadmins as the system', () => {
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
                roles: ['editor']
            });
        });
    });

    it('offers a superadmin no edit of another superadmin, only the status change the row lists', async () => {
        await configure(['superadmin']);
        await render(ORGANIZATIONS, [buildSuperadmin({ actions: ['change-status'], id: 'root-2', name: 'Second' })]);

        await click(rowWith('Second'));
        await click(buttonByName(fixture, 'angular-components.header.menu'));

        expect(queryButton(fixture, 'Second')).toBeNull();
        expect(queryButton(fixture, `${PREFIX}.actions.edit.label`)).toBeNull();
        expect(queryButton(fixture, `${PREFIX}.actions.change-status.label`)).not.toBeNull();
    });

    describe('for a superadmin of a single organization', () => {
        beforeEach(async () => {
            await configure(['superadmin']);
            await render([{ id: 'o2', name: 'Globex' }], [buildUser(), buildSuperadmin()]);
        });

        it('shows the organization column, since the superadmins count as one more', () => {
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
