import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buttonByName, queryAll, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { TableColumn } from '../table/models/table.model';
import { TextTableCell } from '../table/models/table-cell.model';
import { pageOrganizationCell, pageOrganizationColumn } from './functions/page-organization-column';
import { PageConfig } from './models/page.model';
import { PageOrganization, PageOrganizationItem } from './models/page-organization.model';
import { PageSearch } from './models/page-search.model';
import { PageTableConfig, PageTableSearchConfig } from './models/page-table.model';
import { PageComponent } from './page.component';

interface Contract extends PageOrganizationItem {
    name: string;
}

const CONTRACTS: Contract[] = [
    { id: 1, name: 'Offer', organizationId: 'o1', organizationName: 'Acme' },
    { id: 2, name: 'Invoice', organizationId: 'o2', organizationName: 'Globex' },
    { id: 3, name: 'Terms', organizationId: null, organizationName: null }
];
const LIST_URL = 'https://api.test/api/contracts';
const ORGANIZATIONS: PageOrganization[] = [
    { id: 'o1', name: 'Acme' },
    { id: 'o2', name: 'Globex' }
];
const ORGANIZATIONS_URL = `${LIST_URL}/organizations`;

describe('PageComponent — organizations', () => {
    let fixture: ComponentFixture<PageComponent>;
    let httpTesting: HttpTestingController;

    function buildConfig(hasColumn = true): PageConfig<unknown, Contract> {
        return new PageConfig<unknown, Contract>({
            baseUrl: '/contracts',
            prefix: 'demo',
            tableConfig: new PageTableConfig<Contract>({
                columns: [
                    new TableColumn({ key: 'name' }),
                    ...(hasColumn ? [pageOrganizationColumn()] : []),
                    new TableColumn({ key: 'status' })
                ],
                loadRow: contract => [
                    new TextTableCell({ content: contract.name }),
                    ...(hasColumn ? [pageOrganizationCell(contract)] : []),
                    new TextTableCell({ content: `status of ${contract.name}` })
                ],
                search: new PageTableSearchConfig({ fields: [], isOrganizationFilterEnabled: true })
            })
        });
    }

    function answerList(results: Contract[] = CONTRACTS): TestRequest {
        const request = httpTesting.expectOne(current => current.url === LIST_URL);

        request.flush({
            globalActions: [],
            results,
            search: { filters: [], page: 1, size: 25, total: results.length }
        });

        return request;
    }

    async function render(
        organizations: PageOrganization[] | null = ORGANIZATIONS,
        results: Contract[] = CONTRACTS
    ): Promise<void> {
        fixture = await renderComponent(PageComponent, { config: buildConfig() });
        const request = httpTesting.expectOne(ORGANIZATIONS_URL);

        if (organizations) {
            request.flush({ organizations });
        } else {
            request.flush(null, { status: 404, statusText: 'Not Found' });
        }

        answerList(results);
        await settle(fixture);
    }

    function searchOf(request: TestRequest): PageSearch {
        return JSON.parse(atob(request.request.params.get('search') ?? '')) as PageSearch;
    }

    function rowWith(text: string): HTMLElement {
        const row = queryAll(fixture, '[role="row"]').find(candidate => candidate.textContent?.includes(text));

        if (!row) {
            throw new Error(`No row with ${text}`);
        }

        return row;
    }

    function filtersToggle(): HTMLButtonElement {
        return queryAll<HTMLButtonElement>(fixture, 'bey-search [aria-expanded]')[0];
    }

    async function click(button: HTMLElement): Promise<void> {
        button.click();
        await settle(fixture);
    }

    async function choose(select: HTMLSelectElement, value: string): Promise<void> {
        select.value = value;
        select.dispatchEvent(new Event('change'));
        await settle(fixture);
    }

    function filterSelects(): HTMLSelectElement[] {
        return queryAll<HTMLSelectElement>(queryAll(fixture, '[role="group"]')[0], 'select');
    }

    function optionTexts(select: HTMLSelectElement): string[] {
        return [...select.options].map(option => option.textContent?.trim() ?? '');
    }

    async function openFilter(): Promise<void> {
        await click(filtersToggle());
        await click(buttonByName(fixture, 'angular-components.search.add'));
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PageComponent],
            providers: [
                provideBeyTesting({
                    translations: {
                        en: {
                            'angular-components': {
                                page: {
                                    search: { fields: { 'organization-id': 'Organization' } },
                                    table: { columns: { 'organization-name': 'Organization' } }
                                }
                            }
                        }
                    }
                })
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('shows a superadmin the organization of each row under the Organization header, empty for a common row', async () => {
        await render();

        expect(fixture.nativeElement.textContent).toContain('Organization');
        expect(rowWith('Offer').textContent).toContain('Acme');
        expect(rowWith('Invoice').textContent).toContain('Globex');
        expect(rowWith('Terms').textContent).toContain('status of Terms');
    });

    it('asks for the organizations once, when the page opens, and not again when the filters panel opens', async () => {
        await render();

        await click(filtersToggle());
        await click(filtersToggle());

        expect(httpTesting.match(ORGANIZATIONS_URL)).toEqual([]);
    });

    it('filters a superadmin by the organization chosen in the panel, with equals only', async () => {
        await render();

        await openFilter();
        await choose(filterSelects()[0], 'organizationId');

        expect(optionTexts(filterSelects()[0])).toContain('Organization');
        expect([...filterSelects()[1].options].map(option => option.value)).toEqual(['equals']);
        expect(optionTexts(filterSelects()[2])).toEqual(expect.arrayContaining(['Acme', 'Globex']));

        await choose(filterSelects()[2], 'o2');
        await click(buttonByName(fixture, 'angular-components.search.apply'));

        expect(searchOf(answerList()).filters).toEqual([{ field: 'organizationId', operator: 'equals', value: 'o2' }]);
    });

    it('shows a manager or a normal user, whose rows span one organization, neither the column nor the filter', async () => {
        const ownRows = CONTRACTS.map(({ id, name }) => ({ id, name }));
        await render([ORGANIZATIONS[0]], ownRows);

        await openFilter();

        expect(fixture.nativeElement.textContent).not.toContain('Organization');
        expect(rowWith('Offer').textContent).toContain('status of Offer');
    });

    it('shows a superadmin of a single organization neither the column nor the filter', async () => {
        await render(
            [{ id: 'default', name: 'Default' }],
            CONTRACTS.map(contract => ({ ...contract, organizationId: 'default', organizationName: 'Default' }))
        );

        await openFilter();

        expect(fixture.nativeElement.textContent).not.toContain('Default');
        expect(fixture.nativeElement.textContent).not.toContain('Organization');
    });

    it('shows nothing about organizations, and no error, when they cannot be read', async () => {
        await render(null);

        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
        expect(fixture.nativeElement.textContent).not.toContain('Acme');
        expect(fixture.nativeElement.textContent).not.toContain('Organization');
    });

    it('asks for the organizations of a page with the filter alone only when the filters panel first opens', async () => {
        fixture = await renderComponent(PageComponent, { config: buildConfig(false) });
        answerList();
        await settle(fixture);
        expect(httpTesting.match(ORGANIZATIONS_URL)).toEqual([]);

        await click(filtersToggle());
        httpTesting.expectOne(ORGANIZATIONS_URL).flush({ organizations: ORGANIZATIONS });
        await settle(fixture);
        await click(buttonByName(fixture, 'angular-components.search.add'));

        expect(optionTexts(filterSelects()[0])).toContain('Organization');
    });
});
