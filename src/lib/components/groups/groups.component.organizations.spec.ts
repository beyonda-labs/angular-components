import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, queryAll, queryButton, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { SessionUser } from '../../services/session/models/session.model';
import { ModalFormConfig } from '../form/components/modal/models/modal-form.model';
import { FormHandle } from '../form/models/form.model';
import { FormField } from '../form/models/form-field.model';
import { PageOrganization } from '../page/models/page-organization.model';
import { PageSearch } from '../page/models/page-search.model';
import { GroupsComponent } from './groups.component';
import { GroupRow, GroupsConfig } from './models/groups.model';

const GROUPS_URL = 'https://api.test/api/groups';
const ORGANIZATIONS: PageOrganization[] = [
    { id: 'o1', name: 'Acme' },
    { id: 'o2', name: 'Globex' }
];
const ORGANIZATIONS_URL = 'https://api.test/api/users/organizations';
const PREFIX = 'angular-components.groups';

describe('GroupsComponent — organizations and callers', () => {
    let fixture: ComponentFixture<GroupsComponent>;
    let httpTesting: HttpTestingController;

    function buildGroup(overrides: Partial<GroupRow> = {}): GroupRow {
        return {
            actions: ['edit', 'members', 'delete'],
            createdAt: 0,
            id: 'g1',
            memberCount: 2,
            name: 'Sales',
            organizationId: 'o2',
            organizationName: 'Globex',
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

    async function configure(user?: SessionUser): Promise<void> {
        await TestBed.configureTestingModule({
            imports: [GroupsComponent],
            providers: [provideRouter([]), provideBeyTesting({ user })]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    }

    function buildUser(roles: string[], organizationId?: string): SessionUser {
        return {
            allowedPaths: ['/groups'],
            email: 'someone@example.test',
            organizationId,
            redirectPath: '/groups',
            roles
        };
    }

    async function render(
        organizations: PageOrganization[] | null,
        groups: GroupRow[] = [buildGroup()],
        globalActions: string[] = ['create']
    ): Promise<void> {
        fixture = await renderComponent(GroupsComponent, { config: new GroupsConfig() });

        if (organizations) {
            httpTesting.expectOne(ORGANIZATIONS_URL).flush({ organizations });
        }

        await settle(fixture);
        answerList(groups, globalActions);
        await settle(fixture);
    }

    function answerList(groups: GroupRow[] = [buildGroup()], globalActions: string[] = ['create']): TestRequest {
        const request = httpTesting.expectOne(current => current.url === GROUPS_URL && current.method === 'GET');

        request.flush({ globalActions, results: groups, search: { total: groups.length } });

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

    async function create(main: Record<string, unknown>): Promise<TestRequest> {
        await click(buttonByName(fixture, `${PREFIX}.actions.create.label`));
        lastForm()?.onSubmit?.({ main }, buildHandle());

        return httpTesting.expectOne(current => current.url === GROUPS_URL && current.method === 'POST');
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
            await configure(buildUser(['superadmin']));
            await render(ORGANIZATIONS, [
                buildGroup(),
                buildGroup({ id: 'g2', name: 'Support', organizationId: 'o1', organizationName: 'Acme' })
            ]);
        });

        it('shows the organization of every group', () => {
            expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.columns.organization`);
            expect(rowWith('Sales').textContent).toContain('Globex');
            expect(rowWith('Support').textContent).toContain('Acme');
        });

        it('filters the groups by the organization chosen, with equals', async () => {
            await click(queryAll<HTMLButtonElement>(fixture, 'bey-search [aria-expanded]')[0]);
            await click(buttonByName(fixture, 'angular-components.search.add'));
            await choose(filterSelects()[0], 'organizationId');
            await choose(filterSelects()[2], 'o1');
            await click(buttonByName(fixture, 'angular-components.search.apply'));
            const search = JSON.parse(atob(answerList().request.params.get('search') ?? '')) as PageSearch;

            expect(search.filters).toEqual([{ field: 'organizationId', operator: 'equals', value: 'o1' }]);
        });

        it('creates a group in the organization chosen, which it never chooses for the superadmin', async () => {
            const request = await create({ name: ' Support ', organizationId: 'o1' });
            request.flush(buildGroup({ id: 'g3' }));
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
            expect(request.request.body).toEqual({ name: 'Support', organizationId: 'o1' });
        });

        it('renames a group without offering to move it to another organization', async () => {
            await click(buttonByName(fixture, 'Sales'));

            expect(fieldsOf(lastForm()).map(field => field.key)).toEqual(['name']);
        });
    });

    describe('for a superadmin of a single organization', () => {
        beforeEach(async () => {
            await configure(buildUser(['superadmin']));
            await render([{ id: 'o2', name: 'Globex' }]);
        });

        it('shows no organization column, since there is nothing to tell apart', () => {
            expect(rowWith('Sales')).toBeTruthy();
            expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.organization`);
        });

        it('still asks for the organization when creating, chosen already, and sends it', async () => {
            const request = await create({ name: 'Support', organizationId: 'o2' });
            request.flush(buildGroup({ id: 'g3' }));
            await settle(fixture);
            answerList();

            expect(organizationField()).toMatchObject({
                isRequired: true,
                options: [{ label: 'Globex', value: 'o2' }]
            });
            expect(lastForm()?.initialValue).toEqual({ main: { name: '', organizationId: 'o2' } });
            expect(request.request.body).toEqual({ name: 'Support', organizationId: 'o2' });
        });
    });

    it('offers a superadmin with no active organization no create, as the server lists none', async () => {
        await configure(buildUser(['superadmin']));
        await render([], [buildGroup({ organizationId: 'o9', organizationName: 'Initech' })], []);

        expect(rowWith('Sales')).toBeTruthy();
        expect(queryButton(fixture, `${PREFIX}.actions.create.label`)).toBeNull();
    });

    it('shows a superadmin the page anyway when the organizations cannot be read', async () => {
        await configure(buildUser(['superadmin']));
        fixture = await renderComponent(GroupsComponent, { config: new GroupsConfig() });
        httpTesting.expectOne(ORGANIZATIONS_URL).flush(null, { status: 500, statusText: 'Server Error' });
        await settle(fixture);
        answerList();
        await settle(fixture);

        expect(rowWith('Sales')).toBeTruthy();
        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
    });

    it.each([
        ['a manager of the organization', buildUser(['adminuser'], 'o2')],
        ['a manager of another organization', buildUser(['adminuser'], 'o1')]
    ])('asks %s nothing about organizations, and creates in their own', async (_, user) => {
        await configure(user);
        await render(null, [buildGroup({ organizationId: undefined, organizationName: undefined })]);

        const request = await create({ name: 'Support' });
        request.flush(buildGroup({ id: 'g3' }));
        await settle(fixture);
        answerList();

        httpTesting.expectNone(ORGANIZATIONS_URL);
        expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.organization`);
        expect(organizationField()).toBeUndefined();
        expect(request.request.body).toEqual({ name: 'Support' });
    });

    it('shows a manager the reason the server gives for a group out of reach', async () => {
        await configure(buildUser(['adminuser'], 'o1'));
        await render(null, [buildGroup({ organizationId: undefined, organizationName: undefined })]);

        await click(rowWith('Sales'));
        await click(buttonByName(fixture, 'angular-components.header.menu'));
        await click(buttonByName(fixture, `${PREFIX}.actions.members.label`));
        httpTesting
            .expectOne(`${GROUPS_URL}/g1/member-options`)
            .flush({ errorCode: 'not-found', messageKey: 'groups.not-found' }, { status: 404, statusText: '' });
        await settle(fixture);

        expect(httpTesting.expectOne(`${GROUPS_URL}/g1/members`).cancelled).toBe(true);
        expect(TestBed.inject(FakeModalService).errors()).toEqual([
            expect.objectContaining({ message: 'angular-components.http.error.groups.not-found' })
        ]);
        expect(TestBed.inject(FakeModalFormService).forms()).toEqual([]);
    });

    it.each([
        ['a normal user', buildUser(['editor'], 'o2')],
        ['a caller without a session', undefined]
    ])('shows %s an empty page, as the server answers 404, and asks nothing about organizations', async (_, user) => {
        await configure(user);
        fixture = await renderComponent(GroupsComponent, { config: new GroupsConfig() });
        httpTesting
            .expectOne(current => current.url === GROUPS_URL)
            .flush({ errorCode: 'not-found' }, { status: 404, statusText: 'Not Found' });
        await settle(fixture);

        httpTesting.expectNone(ORGANIZATIONS_URL);
        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.empty`);
        expect(queryButton(fixture, `${PREFIX}.actions.create.label`)).toBeNull();
    });
});
