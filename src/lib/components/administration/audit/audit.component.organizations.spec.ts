import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, queryAll, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { SessionUser } from '../../../services/session/models/session.model';
import { PageOrganization } from '../../page/models/page-organization.model';
import { PageSearch } from '../../page/models/page-search.model';
import { AuditComponent } from './audit.component';
import { AuditConfig, AuditEventRow } from './models/audit.model';

const AUDIT_URL = 'https://api.test/api/audit';
const ORGANIZATIONS: PageOrganization[] = [
    { id: 'o1', name: 'Acme' },
    { id: 'o2', name: 'Globex' }
];
const ORGANIZATIONS_URL = 'https://api.test/api/users/organizations';
const ORGANIZATION_COLUMN = 'angular-components.audit.table.columns.organization';
const SUPERADMIN: SessionUser = {
    allowedPaths: ['/audit'],
    email: 'root@example.test',
    redirectPath: '/audit',
    roles: ['superadmin']
};

describe('AuditComponent — organizations', () => {
    let fixture: ComponentFixture<AuditComponent>;
    let httpTesting: HttpTestingController;

    function buildEvent(overrides: Partial<AuditEventRow> = {}): AuditEventRow {
        return {
            action: 'edit',
            actions: ['view'],
            entity: 'groups',
            entityId: 'g1',
            entityName: 'Sales',
            id: 'e1',
            ip: '10.0.0.1',
            occurredAt: 0,
            organizationId: 'o2',
            organizationName: 'Globex',
            requestId: 'req-1',
            userEmail: 'ada@example.test',
            userId: 'u1',
            userName: 'Ada Lovelace',
            ...overrides
        };
    }

    async function render(organizations: PageOrganization[], events: AuditEventRow[]): Promise<void> {
        fixture = await renderComponent(AuditComponent, { config: new AuditConfig() });
        httpTesting.expectOne(ORGANIZATIONS_URL).flush({ organizations });
        await settle(fixture);
        answerList(events);
        await settle(fixture);
    }

    function answerList(events: AuditEventRow[] = [buildEvent()]): TestRequest {
        const request = httpTesting.expectOne(current => current.url === AUDIT_URL && current.method === 'GET');

        request.flush({ globalActions: [], results: events, search: { total: events.length } });

        return request;
    }

    function rowWith(text: string): HTMLElement {
        const row = queryAll(fixture, '[role="row"]').find(candidate => candidate.textContent?.includes(text));

        if (!row) {
            throw new Error(`No row with ${text}`);
        }

        return row;
    }

    function filterSelects(): HTMLSelectElement[] {
        return queryAll<HTMLSelectElement>(queryAll(fixture, '[role="group"]')[0], 'select');
    }

    async function click(element: HTMLElement): Promise<void> {
        element.click();
        await settle(fixture);
    }

    async function choose(select: HTMLSelectElement, value: string): Promise<void> {
        select.value = value;
        select.dispatchEvent(new Event('change'));
        await settle(fixture);
    }

    async function openFilters(): Promise<void> {
        await click(queryAll<HTMLButtonElement>(fixture, 'bey-search [aria-expanded]')[0]);
        await click(buttonByName(fixture, 'angular-components.search.add'));
    }

    async function configure(user: SessionUser): Promise<void> {
        await TestBed.configureTestingModule({
            imports: [AuditComponent],
            providers: [provideRouter([]), provideBeyTesting({ user })]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    }

    afterEach(() => {
        httpTesting.verify();
    });

    describe('for a superadmin', () => {
        beforeEach(async () => {
            await configure(SUPERADMIN);
        });

        it('shows the organization of every event while the events span several organizations', async () => {
            await render(ORGANIZATIONS, [
                buildEvent(),
                buildEvent({ entityName: 'Support', id: 'e2', organizationId: 'o1', organizationName: 'Acme' })
            ]);

            expect(fixture.nativeElement.textContent).toContain(ORGANIZATION_COLUMN);
            expect(rowWith('Sales').textContent).toContain('Globex');
            expect(rowWith('Support').textContent).toContain('Acme');
        });

        it('counts the events without an organization as one more organization', async () => {
            await render(ORGANIZATIONS, [
                buildEvent(),
                buildEvent({ entityName: 'Support', id: 'e2', organizationId: null, organizationName: null })
            ]);

            expect(fixture.nativeElement.textContent).toContain(ORGANIZATION_COLUMN);
        });

        it('hides the organization while the events belong to one, and shows it once a search spans more', async () => {
            await render(ORGANIZATIONS, [buildEvent(), buildEvent({ entityName: 'Support', id: 'e2' })]);

            expect(fixture.nativeElement.textContent).not.toContain(ORGANIZATION_COLUMN);
            expect(rowWith('Sales').textContent).not.toContain('Globex');

            await openFilters();
            await choose(filterSelects()[0], 'organizationId');
            await choose(filterSelects()[2], 'o1');
            await click(buttonByName(fixture, 'angular-components.search.apply'));
            answerList([
                buildEvent({ organizationId: 'o1', organizationName: 'Acme' }),
                buildEvent({ entityName: 'Support', id: 'e2' })
            ]);
            await settle(fixture);

            expect(fixture.nativeElement.textContent).toContain(ORGANIZATION_COLUMN);
        });

        it('filters the events by the organization chosen, with equals', async () => {
            await render(ORGANIZATIONS, [buildEvent()]);

            await openFilters();
            await choose(filterSelects()[0], 'organizationId');
            await choose(filterSelects()[2], 'o1');
            await click(buttonByName(fixture, 'angular-components.search.apply'));
            const search = JSON.parse(atob(answerList().request.params.get('search') ?? '')) as PageSearch;

            expect(search.filters).toEqual([{ field: 'organizationId', operator: 'equals', value: 'o1' }]);
        });

        it('offers no organization filter with a single organization to choose', async () => {
            await render([ORGANIZATIONS[1]], [buildEvent()]);

            await openFilters();

            expect(queryAll<HTMLOptionElement>(filterSelects()[0], 'option').map(({ value }) => value)).not.toContain(
                'organizationId'
            );
        });
    });

    it('lists the events of a manager without asking for the organizations nor showing them', async () => {
        await configure({ ...SUPERADMIN, organizationId: 'o2', roles: ['adminuser'] });

        fixture = await renderComponent(AuditComponent, { config: new AuditConfig() });
        answerList([
            buildEvent(),
            buildEvent({ entityName: 'Support', id: 'e2', organizationId: 'o1', organizationName: 'Acme' })
        ]);
        await settle(fixture);

        httpTesting.expectNone(ORGANIZATIONS_URL);
        expect(fixture.nativeElement.textContent).not.toContain(ORGANIZATION_COLUMN);
        expect(rowWith('Support').textContent).not.toContain('Acme');
    });
});
