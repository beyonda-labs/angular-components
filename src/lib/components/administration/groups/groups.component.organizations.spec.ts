import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, queryAll, queryButton, renderComponent, rowWith, settle } from '@testing/dom';
import { fieldsOf } from '@testing/form-fields';
import { FakeFormHandle } from '@testing/handles/fake-form-handle';
import { searchOf } from '@testing/page-search';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { SessionUser } from '../../../services/session/models/session.model';
import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormField } from '../../form/models/form-field.model';
import { PageItemType } from '../../page/models/page-categories.model';
import { PageOrganization } from '../../page/models/page-organization.model';
import { OrganizationFolder } from '../models/organization-folders.model';
import { GroupsComponent } from './groups.component';
import { GroupRow, GroupsConfig } from './models/groups.model';

const ACME: OrganizationFolder = {
    actions: [],
    entryType: PageItemType.Category,
    id: 'o1',
    name: 'Acme',
    itemCount: 1
};
const GLOBEX: OrganizationFolder = { actions: [], entryType: PageItemType.Category, id: 'o2', name: 'Globex' };
const GROUPS_URL = 'https://api.test/api/groups';
const ORGANIZATIONS: PageOrganization[] = [
    { id: 'o1', name: 'Acme' },
    { id: 'o2', name: 'Globex' }
];
const ORGANIZATIONS_URL = 'https://api.test/api/users/organizations';
const PREFIX = 'angular-components.groups';
const SEARCH_DEBOUNCE_MS = 350;

describe('GroupsComponent — organizations and callers', () => {
    let fixture: ComponentFixture<GroupsComponent>;
    let httpTesting: HttpTestingController;

    function buildGroup(overrides: Partial<GroupRow> = {}): GroupRow {
        return {
            actions: ['edit', 'delete'],
            createdAt: 0,
            id: 'g1',
            memberCount: 2,
            name: 'Sales',
            organizationId: 'o2',
            organizationName: 'Globex',
            ...overrides
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
        groups: (GroupRow | OrganizationFolder)[] = [buildGroup()],
        globalActions: string[] = ['create']
    ): Promise<TestRequest> {
        fixture = await renderComponent(GroupsComponent, { config: new GroupsConfig() });

        if (organizations) {
            httpTesting.expectOne(ORGANIZATIONS_URL).flush({ organizations });
        }

        await settle(fixture);
        const request = answerList(groups, globalActions);
        await settle(fixture);

        return request;
    }

    function answerList(
        groups: (GroupRow | OrganizationFolder)[] = [buildGroup()],
        globalActions: string[] = ['create']
    ): TestRequest {
        const request = httpTesting.expectOne(current => current.url === GROUPS_URL && current.method === 'GET');

        request.flush({ globalActions, results: groups, search: { total: groups.length } });

        return request;
    }

    function breadcrumb(): string {
        return queryAll(fixture, 'nav[aria-label="angular-components.breadcrumb.label"]')[0]?.textContent ?? '';
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

    async function create(main: Record<string, unknown>): Promise<TestRequest> {
        await click(buttonByName(fixture, `${PREFIX}.actions.create.label`));
        lastForm()?.onSubmit?.({ main }, new FakeFormHandle());

        return httpTesting.expectOne(current => current.url === GROUPS_URL && current.method === 'POST');
    }

    async function openAcme(): Promise<TestRequest> {
        await click(buttonByName(fixture, 'Acme'));
        httpTesting.expectOne(`${GROUPS_URL}/categories/o1/path`).flush([{ id: 'o1', name: 'Acme' }]);
        await settle(fixture);
        const request = answerList([
            buildGroup({ id: 'g2', name: 'Support', organizationId: 'o1', organizationName: 'Acme' })
        ]);
        await settle(fixture);

        return request;
    }

    async function searchFor(text: string, groups: GroupRow[]): Promise<TestRequest> {
        const box = fixture.nativeElement.querySelector('[role="searchbox"]') as HTMLInputElement;

        box.value = text;
        box.dispatchEvent(new Event('input'));
        await new Promise(resolve => {
            setTimeout(resolve, SEARCH_DEBOUNCE_MS);
        });
        await settle(fixture);
        const request = answerList(groups);
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
            await configure(buildUser(['superadmin']));
            await render(ORGANIZATIONS, [
                buildGroup(),
                buildGroup({ id: 'g2', name: 'Support', organizationId: 'o1', organizationName: 'Acme' })
            ]);
        });

        it('shows the organization of every group a search at the root finds, and none before', async () => {
            const before = fixture.nativeElement.textContent as string;
            await searchFor('s', [
                buildGroup(),
                buildGroup({ id: 'g2', name: 'Support', organizationId: 'o1', organizationName: 'Acme' })
            ]);

            expect(before).not.toContain(`${PREFIX}.table.columns.organization`);
            expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.columns.organization`);
            expect(rowWith(fixture, 'Sales').textContent).toContain('Globex');
            expect(rowWith(fixture, 'Support').textContent).toContain('Acme');
        });

        it('filters the groups by the organization chosen, with equals', async () => {
            await click(queryAll<HTMLButtonElement>(fixture, 'bey-search [aria-expanded]')[0]);
            await click(buttonByName(fixture, 'angular-components.search.add'));
            await choose(filterSelects()[0], 'organizationId');
            await choose(filterSelects()[2], 'o1');
            await click(buttonByName(fixture, 'angular-components.search.apply'));
            const search = searchOf(answerList());

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
            expect(request.request.body).toEqual({ name: 'Support', organizationId: 'o1', parentId: null });
        });

        it('edits a group showing its organization disabled, and never sends it', async () => {
            await click(buttonByName(fixture, 'Sales'));
            httpTesting.expectOne(`${GROUPS_URL}/g1`).flush({ ...buildGroup(), extraRoles: [], members: [] });
            await settle(fixture);
            lastForm()?.onSubmit?.(
                { main: { extraRoleIds: [], name: 'Sales', organizationId: 'o2', userIds: [] } },
                new FakeFormHandle()
            );
            const request = httpTesting.expectOne(
                current => current.url === `${GROUPS_URL}/g1` && current.method === 'PUT'
            );
            request.flush(buildGroup());
            await settle(fixture);
            answerList();

            expect(fieldsOf(lastForm()).map(field => field.key)).toEqual([
                'name',
                'organizationId',
                'userIds',
                'extraRoleIds'
            ]);
            expect(organizationField()).toMatchObject({
                isDisabled: true,
                options: [{ label: 'Globex', value: 'o2' }]
            });
            expect(request.request.body).toEqual({ extraRoleIds: [], name: 'Sales', userIds: [] });
        });
    });

    describe('folders per organization for a superadmin', () => {
        let rootRequest: TestRequest;

        beforeEach(async () => {
            await configure(buildUser(['superadmin']));
            rootRequest = await render(ORGANIZATIONS, [ACME, GLOBEX]);
        });

        it('lists one folder per organization at the root', () => {
            expect(rootRequest.request.params.get('parentId')).toBe('null');
            expect(buttonByName(fixture, 'Acme')).toBeTruthy();
            expect(buttonByName(fixture, 'Globex')).toBeTruthy();
            expect(breadcrumb()).toContain(`${PREFIX}.categories.root`);
        });

        it('opens the folder of an organization from its name, with its groups under its breadcrumb', async () => {
            const request = await openAcme();

            expect(request.request.params.get('parentId')).toBe('o1');
            expect(rowWith(fixture, 'Support').textContent).not.toContain('Acme');
            expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.organization`);
            expect(breadcrumb()).toContain('Acme');
        });

        it('creates a group in the organization of the open folder, chosen already and still open to change', async () => {
            await openAcme();
            const request = await create({ name: 'Billing', organizationId: 'o1' });
            request.flush(buildGroup({ id: 'g3' }));
            await settle(fixture);
            answerList();

            expect(lastForm()?.initialValue).toEqual({ main: { name: '', organizationId: 'o1' } });
            expect(organizationField()).toMatchObject({ isDisabled: false, isRequired: true });
            expect(request.request.body).toEqual({ name: 'Billing', organizationId: 'o1', parentId: 'o1' });
        });
    });

    it('keeps managing the groups at a root of only folders, even with nothing to create', async () => {
        await configure(buildUser(['superadmin']));
        await render([], [ACME], []);

        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.columns.extra-role-count`);
    });

    it('lists the groups of a manager flat, with no folder and no parent', async () => {
        await configure(buildUser(['adminuser'], 'o2'));
        const request = await render(null, [buildGroup({ organizationId: undefined, organizationName: undefined })]);

        expect(request.request.params.has('parentId')).toBe(false);
        expect(breadcrumb()).toBe('');
    });

    describe('for a superadmin of a single organization', () => {
        beforeEach(async () => {
            await configure(buildUser(['superadmin']));
            await render([{ id: 'o2', name: 'Globex' }]);
        });

        it('shows the organization column in a search all the same, but no organization filter with nothing to choose', async () => {
            await searchFor('Sales', [buildGroup()]);
            await click(queryAll<HTMLButtonElement>(fixture, 'bey-search [aria-expanded]')[0]);
            await click(buttonByName(fixture, 'angular-components.search.add'));

            expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.columns.organization`);
            expect(rowWith(fixture, 'Sales').textContent).toContain('Globex');
            expect(queryAll<HTMLOptionElement>(filterSelects()[0], 'option').map(({ value }) => value)).not.toContain(
                'organizationId'
            );
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
            expect(request.request.body).toEqual({ name: 'Support', organizationId: 'o2', parentId: null });
        });
    });

    it('offers a superadmin with no active organization no create, as the server lists none', async () => {
        await configure(buildUser(['superadmin']));
        await render([], [buildGroup({ organizationId: 'o9', organizationName: 'Initech' })], []);

        expect(rowWith(fixture, 'Sales')).toBeTruthy();
        expect(queryButton(fixture, `${PREFIX}.actions.create.label`)).toBeNull();
    });

    it('shows a superadmin the page anyway when the organizations cannot be read', async () => {
        await configure(buildUser(['superadmin']));
        fixture = await renderComponent(GroupsComponent, { config: new GroupsConfig() });
        httpTesting.expectOne(ORGANIZATIONS_URL).flush(null, { status: 500, statusText: 'Server Error' });
        await settle(fixture);
        answerList();
        await settle(fixture);

        expect(rowWith(fixture, 'Sales')).toBeTruthy();
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

        await click(buttonByName(fixture, 'Sales'));
        httpTesting
            .expectOne(`${GROUPS_URL}/g1`)
            .flush({ errorCode: 'not-found', messageKey: 'groups.not-found' }, { status: 404, statusText: '' });
        await settle(fixture);

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
