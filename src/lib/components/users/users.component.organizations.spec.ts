import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, queryAll, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { SessionUser } from '../../services/session/models/session.model';
import { ModalFormConfig } from '../form/components/modal/models/modal-form.model';
import { FormSelectField } from '../form/models/fields/form-select-field.model';
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

    async function configure(roles: string[]): Promise<void> {
        const user: SessionUser = {
            allowedPaths: ['/users'],
            email: 'root@example.test',
            organizationId: 'o2',
            redirectPath: '/users',
            roles
        };

        await TestBed.configureTestingModule({
            imports: [UsersComponent],
            providers: [provideRouter([]), provideBeyTesting({ user })]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    }

    async function render(organizations: PageOrganization[] | null, users: UserRow[] = [buildUser()]): Promise<void> {
        fixture = await renderComponent(UsersComponent, { config: new UsersConfig() });

        if (organizations) {
            httpTesting.expectOne(ORGANIZATIONS_URL).flush({ organizations });
        }

        httpTesting.expectOne(`${USERS_URL}/roles`).flush({ roles: ['adminuser', 'editor'] });
        await settle(fixture);
        answerList(users);
        await settle(fixture);
    }

    function answerList(users: UserRow[] = [buildUser()]): TestRequest {
        const request = httpTesting.expectOne(current => current.url === USERS_URL && current.method === 'GET');

        request.flush({ globalActions: ['create'], results: users, search: { total: users.length } });

        return request;
    }

    function fieldsOf(form: ModalFormConfig | undefined): FormField[] {
        return form?.sections.flatMap(section => section.rows.flatMap(row => row.fields)) ?? [];
    }

    function filterSelects(): HTMLSelectElement[] {
        return queryAll<HTMLSelectElement>(queryAll(fixture, '[role="group"]')[0], 'select');
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

    afterEach(() => {
        httpTesting.verify();
    });

    describe('for a superadmin of several organizations', () => {
        beforeEach(async () => {
            await configure(['superadmin']);
            await render(ORGANIZATIONS);
        });

        it('shows the organization of every user', () => {
            expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.columns.organization`);
            expect(fixture.nativeElement.textContent).toContain('Globex');
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

        it('invites into the organization chosen, starting with the own', async () => {
            const request = await invite({ email: 'grace@example.test', organizationId: 'o1', roles: ['editor'] });
            request.flush(buildUser({ email: 'grace@example.test', id: 'u2' }));
            await settle(fixture);
            answerList();

            expect(
                (fieldsOf(lastForm()).find(field => field.key === 'organizationId') as FormSelectField).options
            ).toEqual([
                { label: 'Acme', value: 'o1' },
                { label: 'Globex', value: 'o2' }
            ]);
            expect(lastForm()?.initialValue).toEqual({ main: { organizationId: 'o2', roles: [] } });
            expect(request.request.body).toEqual({
                email: 'grace@example.test',
                organizationId: 'o1',
                roles: ['editor']
            });
        });
    });

    it('shows a superadmin of a single organization nothing about organizations, inviting into the own', async () => {
        await configure(['superadmin']);
        await render([{ id: 'o2', name: 'Globex' }]);

        const request = await invite({ email: 'grace@example.test', roles: ['editor'] });
        request.flush(buildUser({ id: 'u2' }));
        await settle(fixture);
        answerList();

        expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.organization`);
        expect(fieldsOf(lastForm()).map(field => field.key)).not.toContain('organizationId');
        expect(request.request.body).toEqual({ email: 'grace@example.test', roles: ['editor'] });
    });

    it.each([
        ['a manager', ['adminuser']],
        ['a normal user', ['editor']]
    ])('asks nothing about organizations for %s, and invites into their own', async (_, roles) => {
        await configure(roles);
        await render(null, [buildUser({ organizationId: undefined, organizationName: undefined })]);

        const request = await invite({ email: 'grace@example.test', roles: ['editor'] });
        request.flush(buildUser({ id: 'u2' }));
        await settle(fixture);
        answerList();

        httpTesting.expectNone(ORGANIZATIONS_URL);
        expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.organization`);
        expect(fieldsOf(lastForm()).map(field => field.key)).not.toContain('organizationId');
        expect(request.request.body).toEqual({ email: 'grace@example.test', roles: ['editor'] });
    });
});
