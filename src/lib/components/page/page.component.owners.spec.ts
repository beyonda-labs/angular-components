import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buttonByName, queryAll, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { TableColumn } from '../table/models/table.model';
import { TextTableCell } from '../table/models/table-cell.model';
import { pageOwnerCell, pageOwnerColumn } from './functions/page-owner-column';
import { PageConfig } from './models/page.model';
import { PageOwnedItem } from './models/page-owner.model';
import { PageSearch } from './models/page-search.model';
import { PageTableConfig, PageTableSearchConfig } from './models/page-table.model';
import { PageComponent } from './page.component';

interface Contract extends PageOwnedItem {
    name: string;
}

const CONTRACTS: Contract[] = [
    { id: 1, name: 'Offer', ownerId: 'u1', ownerName: 'Ada Lovelace' },
    { id: 2, name: 'Invoice', ownerId: 'u2', ownerName: 'Grace Hopper' },
    { id: 3, name: 'Terms', ownerId: null, ownerName: null }
];
const LIST_URL = 'https://api.test/api/contracts';
const OWNERS = [
    { id: 'u1', name: 'Ada Lovelace' },
    { id: 'u2', name: 'Grace Hopper' }
];
const OWNERS_URL = `${LIST_URL}/owners`;
const TRASH_URL = `${LIST_URL}/trash`;

describe('PageComponent — owners', () => {
    let fixture: ComponentFixture<PageComponent>;
    let httpTesting: HttpTestingController;

    function buildConfig(): PageConfig<unknown, Contract> {
        return new PageConfig<unknown, Contract>({
            baseUrl: '/contracts',
            prefix: 'demo',
            tableConfig: new PageTableConfig<Contract>({
                columns: [new TableColumn({ key: 'name' }), pageOwnerColumn()],
                isTrashEnabled: true,
                loadRow: contract => [new TextTableCell({ content: contract.name }), pageOwnerCell(contract)],
                search: new PageTableSearchConfig({ fields: [], isOwnerFilterEnabled: true })
            })
        });
    }

    function answerList(url = LIST_URL): TestRequest {
        const request = httpTesting.expectOne(current => current.url === url);

        request.flush({ globalActions: [], results: CONTRACTS, search: { filters: [], page: 1, size: 25, total: 3 } });

        return request;
    }

    function searchOf(request: TestRequest): PageSearch {
        return JSON.parse(atob(request.request.params.get('search') ?? '')) as PageSearch;
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

    async function openPanelWithOwners(owners = OWNERS): Promise<void> {
        await click(filtersToggle());
        httpTesting.expectOne(OWNERS_URL).flush({ owners });
        await settle(fixture);
        await click(buttonByName(fixture, 'angular-components.search.add'));
    }

    async function filterByOwner(ownerId: string): Promise<void> {
        await openPanelWithOwners();
        await choose(filterSelects()[0], 'ownerId');
        await choose(filterSelects()[2], ownerId);
        await click(buttonByName(fixture, 'angular-components.search.apply'));
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
                                    search: { fields: { 'owner-id': 'Owner' } },
                                    table: { columns: { 'owner-name': 'Owner' } }
                                }
                            }
                        }
                    }
                })
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = await renderComponent(PageComponent, { config: buildConfig() });
        answerList();
        await settle(fixture);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('shows the owner of each row under the Owner header, and sorts by the owner id from it', async () => {
        expect(fixture.nativeElement.textContent).toContain('Ada Lovelace');
        expect(fixture.nativeElement.textContent).toContain('Grace Hopper');

        await click(buttonByName(fixture, 'Owner'));

        expect(searchOf(answerList()).sort).toEqual({ direction: 'asc', field: 'ownerId' });
    });

    it('asks for the owners only when the filters panel first opens', async () => {
        expect(httpTesting.match(OWNERS_URL)).toEqual([]);

        await openPanelWithOwners();
        await click(filtersToggle());
        await click(filtersToggle());

        expect(httpTesting.match(OWNERS_URL)).toEqual([]);
    });

    it('filters by the owner chosen in the panel, with equals only', async () => {
        await openPanelWithOwners();
        await choose(filterSelects()[0], 'ownerId');

        expect(optionTexts(filterSelects()[0])).toContain('Owner');
        expect([...filterSelects()[1].options].map(option => option.value)).toEqual(['equals']);
        expect(optionTexts(filterSelects()[2])).toEqual(expect.arrayContaining(['Ada Lovelace', 'Grace Hopper']));

        await choose(filterSelects()[2], 'u2');
        await click(buttonByName(fixture, 'angular-components.search.apply'));

        expect(searchOf(answerList()).filters).toEqual([{ field: 'ownerId', operator: 'equals', value: 'u2' }]);
    });

    it('offers no owner filter when the rows have a single owner', async () => {
        await openPanelWithOwners([OWNERS[0]]);

        expect(optionTexts(filterSelects()[0])).not.toContain('Owner');
    });

    it('keeps filtering by owner in the trash', async () => {
        await filterByOwner('u1');
        answerList();
        await settle(fixture);

        await click(buttonByName(fixture, 'demo.tabs.trash.label'));

        expect(searchOf(answerList(TRASH_URL)).filters).toEqual([
            { field: 'ownerId', operator: 'equals', value: 'u1' }
        ]);
    });
});
