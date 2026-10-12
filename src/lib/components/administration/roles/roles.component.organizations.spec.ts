import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, queryAll, queryButton, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { SessionUser } from '../../../services/session/models/session.model';
import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormHandle } from '../../form/models/form.model';
import { FormField } from '../../form/models/form-field.model';
import { PageOrganization } from '../../page/models/page-organization.model';
import { PageSearch } from '../../page/models/page-search.model';
import { RoleFormValue, RoleRow, RolesConfig } from './models/roles.model';
import { RolesComponent } from './roles.component';

const ORGANIZATIONS: PageOrganization[] = [
    { id: 'o1', name: 'Acme' },
    { id: 'o2', name: 'Globex' }
];
const ORGANIZATIONS_URL = 'https://api.test/api/users/organizations';
const PERMISSIONS_URL = 'https://api.test/api/roles/permissions';
const PREFIX = 'angular-components.roles';
const ROLES_URL = 'https://api.test/api/roles';

describe('RolesComponent — organizations and callers', () => {
    let fixture: ComponentFixture<RolesComponent>;
    let httpTesting: HttpTestingController;

    function buildBase(): RoleRow {
        return {
            actions: ['duplicate'],
            id: 'normaluser',
            isBase: true,
            memberCount: 5,
            name: 'normaluser',
            organizationId: null,
            organizationName: null,
            permissions: ['documents.read']
        };
    }

    function buildRole(overrides: Partial<RoleRow> = {}): RoleRow {
        return {
            actions: ['edit', 'duplicate', 'delete'],
            id: 'r1',
            isBase: false,
            memberCount: 2,
            name: 'Reviewers',
            organizationId: 'o2',
            organizationName: 'Globex',
            permissions: ['templates.edit'],
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

    function buildUser(roles: string[], organizationId?: string): SessionUser {
        return {
            allowedPaths: ['/roles'],
            email: 'someone@example.test',
            organizationId,
            redirectPath: '/roles',
            roles
        };
    }

    async function configure(user?: SessionUser): Promise<void> {
        await TestBed.configureTestingModule({
            imports: [RolesComponent],
            providers: [provideRouter([]), provideBeyTesting({ user })]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    }

    async function render(
        organizations: PageOrganization[] | null,
        roles: RoleRow[] = [buildBase(), buildRole()],
        globalActions: string[] = ['create']
    ): Promise<void> {
        fixture = await renderComponent(RolesComponent, { config: new RolesConfig() });

        if (organizations) {
            httpTesting.expectOne(ORGANIZATIONS_URL).flush({ organizations });
        }

        httpTesting.expectOne(PERMISSIONS_URL).flush({ permissions: [{ group: 'templates', key: 'templates.edit' }] });
        await settle(fixture);
        answerList(roles, globalActions);
        await settle(fixture);
    }

    function answerList(
        roles: RoleRow[] = [buildBase(), buildRole()],
        globalActions: string[] = ['create']
    ): TestRequest {
        const request = httpTesting.expectOne(current => current.url === ROLES_URL && current.method === 'GET');

        request.flush({ globalActions, results: roles, search: { total: roles.length } });

        return request;
    }

    function fieldsOf(form: ModalFormConfig | undefined): FormField[] {
        return form?.sections.flatMap(section => section.rows.flatMap(row => row.fields)) ?? [];
    }

    function filterSelects(): HTMLSelectElement[] {
        return queryAll<HTMLSelectElement>(queryAll(fixture, '[role="group"]')[0], 'select');
    }

    function initialOrganizationId(): string | undefined {
        return (lastForm()?.initialValue as RoleFormValue | undefined)?.main.organizationId;
    }

    function lastForm(): ModalFormConfig | undefined {
        return TestBed.inject(FakeModalFormService).forms().at(-1);
    }

    function organizationField(): FormField | undefined {
        return fieldsOf(lastForm()).find(field => field.key === 'organizationId');
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
        lastForm()?.onSubmit?.({ main, permissions: { permissions: ['templates.edit'] } }, buildHandle());

        return httpTesting.expectOne(current => current.url === ROLES_URL && current.method === 'POST');
    }

    async function duplicate(name: string): Promise<void> {
        await click(rowWith(name));
        await click(buttonByName(fixture, 'angular-components.header.menu'));
        await click(buttonByName(fixture, `${PREFIX}.actions.duplicate.label`));
    }

    async function openFilter(): Promise<void> {
        await click(queryAll<HTMLButtonElement>(fixture, 'bey-search [aria-expanded]')[0]);
        await click(buttonByName(fixture, 'angular-components.search.add'));
    }

    afterEach(() => {
        httpTesting.verify();
    });

    describe('for a superadmin of several organizations', () => {
        beforeEach(async () => {
            await configure(buildUser(['superadmin']));
            await render(ORGANIZATIONS, [
                buildBase(),
                buildRole(),
                buildRole({ id: 'r2', name: 'Auditors', organizationId: 'o1', organizationName: 'Acme' })
            ]);
        });

        it('shows the organization of every extra role, and every organization for a base role', () => {
            expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.columns.organization`);
            expect(rowWith('Reviewers').textContent).toContain('Globex');
            expect(rowWith('Auditors').textContent).toContain('Acme');
            expect(rowWith('normaluser').textContent).toContain(`${PREFIX}.table.every-organization`);
        });

        it('filters the roles by the organization chosen, with equals', async () => {
            await openFilter();
            await choose(filterSelects()[0], 'organizationId');
            await choose(filterSelects()[2], 'o1');
            await click(buttonByName(fixture, 'angular-components.search.apply'));
            const search = JSON.parse(atob(answerList().request.params.get('search') ?? '')) as PageSearch;

            expect(search.filters).toEqual([{ field: 'organizationId', operator: 'equals', value: 'o1' }]);
        });

        it('creates a role in the organization chosen, which it never chooses for the superadmin', async () => {
            const request = await create({ name: 'Readers', organizationId: 'o1' });
            request.flush(buildRole({ id: 'r3' }));
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
                name: 'Readers',
                description: '',
                permissions: ['templates.edit'],
                organizationId: 'o1'
            });
        });

        it('edits a role showing its organization disabled, and never sends it', async () => {
            await click(buttonByName(fixture, 'Reviewers'));
            lastForm()?.onSubmit?.(
                { main: { name: 'Reviewers', organizationId: 'o2' }, permissions: { permissions: ['templates.edit'] } },
                buildHandle()
            );
            const request = httpTesting.expectOne(`${ROLES_URL}/r1`);
            request.flush(buildRole());
            await settle(fixture);
            answerList();

            expect(organizationField()).toMatchObject({
                isDisabled: true,
                options: [{ label: 'Globex', value: 'o2' }]
            });
            expect(initialOrganizationId()).toBe('o2');
            expect(request.request.body).toEqual({
                name: 'Reviewers',
                description: '',
                permissions: ['templates.edit']
            });
        });

        it('duplicates an extra role into its own organization, which the create form lets the superadmin change', async () => {
            await duplicate('Auditors');
            lastForm()?.onSubmit?.(
                { main: { name: 'Auditors (copy)', organizationId: 'o2' }, permissions: { permissions: [] } },
                buildHandle()
            );
            const request = httpTesting.expectOne(current => current.url === ROLES_URL && current.method === 'POST');
            request.flush(buildRole({ id: 'r3' }));
            await settle(fixture);
            answerList();

            expect(organizationField()).toMatchObject({ isDisabled: false, isRequired: true });
            expect(initialOrganizationId()).toBe('o1');
            expect(request.request.body).toEqual(expect.objectContaining({ organizationId: 'o2' }));
        });

        it('duplicates a base role choosing no organization among several, as a create does', async () => {
            await duplicate('normaluser');

            expect(organizationField()).toMatchObject({ isRequired: true });
            expect(initialOrganizationId()).toBeUndefined();
        });
    });

    describe('for a superadmin of a single organization', () => {
        beforeEach(async () => {
            await configure(buildUser(['superadmin']));
            await render([{ id: 'o2', name: 'Globex' }]);
        });

        it('shows the organization column all the same, but no organization filter with nothing to choose', async () => {
            await openFilter();

            expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.columns.organization`);
            expect(rowWith('Reviewers').textContent).toContain('Globex');
            expect(rowWith('normaluser').textContent).toContain(`${PREFIX}.table.every-organization`);
            expect(queryAll<HTMLOptionElement>(filterSelects()[0], 'option').map(({ value }) => value)).not.toContain(
                'organizationId'
            );
        });

        it('duplicates a base role into the only organization, chosen already', async () => {
            await duplicate('normaluser');

            expect(initialOrganizationId()).toBe('o2');
        });

        it('still asks for the organization when creating, chosen already, and sends it', async () => {
            const request = await create({ name: 'Readers', organizationId: 'o2' });
            request.flush(buildRole({ id: 'r3' }));
            await settle(fixture);
            answerList();

            expect(organizationField()).toMatchObject({
                isRequired: true,
                options: [{ label: 'Globex', value: 'o2' }]
            });
            expect(lastForm()?.initialValue).toEqual({
                main: { description: '', name: '', organizationId: 'o2' },
                permissions: { permissions: [] }
            });
            expect(request.request.body).toEqual(expect.objectContaining({ organizationId: 'o2' }));
        });
    });

    it('offers a superadmin with no active organization no create, as the server lists none', async () => {
        await configure(buildUser(['superadmin']));
        await render([], [buildBase()], []);

        expect(rowWith('normaluser')).toBeTruthy();
        expect(queryButton(fixture, `${PREFIX}.actions.create.label`)).toBeNull();
    });

    it.each([
        ['a manager of the organization', buildUser(['adminuser'], 'o2')],
        ['a manager of another organization', buildUser(['adminuser'], 'o1')]
    ])('asks %s nothing about organizations, and creates in their own', async (_, user) => {
        await configure(user);
        await render(null, [buildBase(), buildRole({ organizationId: undefined, organizationName: undefined })]);

        const request = await create({ name: 'Readers' });
        request.flush(buildRole({ id: 'r3' }));
        await settle(fixture);
        answerList();

        httpTesting.expectNone(ORGANIZATIONS_URL);
        expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.organization`);
        expect(organizationField()).toBeUndefined();
        expect(request.request.body).toEqual({ name: 'Readers', description: '', permissions: ['templates.edit'] });
    });

    it('shows a manager the reason the server gives for a role out of reach', async () => {
        await configure(buildUser(['adminuser'], 'o1'));
        await render(null, [buildRole({ organizationId: undefined, organizationName: undefined })]);

        await click(buttonByName(fixture, 'Reviewers'));
        lastForm()?.onSubmit?.({ main: { name: 'Reviewers' }, permissions: { permissions: [] } }, buildHandle());
        httpTesting
            .expectOne(`${ROLES_URL}/r1`)
            .flush({ errorCode: 'not-found', messageKey: 'roles.not-found' }, { status: 404, statusText: '' });
        await settle(fixture);

        expect(TestBed.inject(FakeModalService).errors()).toEqual([
            expect.objectContaining({ message: 'angular-components.http.error.roles.not-found' })
        ]);
    });

    it.each([
        ['a normal user', buildUser(['normaluser'], 'o2')],
        [
            'a normal user with an extra role',
            { ...buildUser(['normaluser'], 'o2'), extraPermissions: ['templates.edit'] }
        ],
        ['a caller without a session', undefined]
    ])('shows %s an empty page, as the server answers 404, and asks nothing about organizations', async (_, user) => {
        await configure(user);
        fixture = await renderComponent(RolesComponent, { config: new RolesConfig() });
        httpTesting
            .expectOne(PERMISSIONS_URL)
            .flush({ errorCode: 'not-found' }, { status: 404, statusText: 'Not Found' });
        await settle(fixture);
        httpTesting
            .expectOne(current => current.url === ROLES_URL)
            .flush({ errorCode: 'not-found' }, { status: 404, statusText: 'Not Found' });
        await settle(fixture);

        httpTesting.expectNone(ORGANIZATIONS_URL);
        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.empty`);
        expect(queryButton(fixture, `${PREFIX}.actions.create.label`)).toBeNull();
    });
});
