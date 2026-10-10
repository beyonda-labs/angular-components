import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buttonByName, queryAll, queryButton, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { TableColumn } from '../table/models/table.model';
import { TextTableCell } from '../table/models/table-cell.model';
import { pageStandardAction } from './functions/page-standard-actions';
import { PageConfig } from './models/page.model';
import { PageStandardAction } from './models/page-action.model';
import { PageCategoriesConfig, PageItemType } from './models/page-categories.model';
import { PageHeaderConfig } from './models/page-header.model';
import { PageOwnedItem } from './models/page-owner.model';
import { PageTableConfig } from './models/page-table.model';
import { PageComponent } from './page.component';

interface Contract extends PageOwnedItem {
    name: string;
    parentId: string | null;
    type: PageItemType;
}

const ADA = { ownerId: 'u1', ownerName: 'Ada Lovelace', parentId: null };
const GRACE = { ownerId: 'u2', ownerName: 'Grace Hopper', parentId: null };
const FOLDER_ACTIONS = [PageStandardAction.Move, PageStandardAction.DeleteCategory];
const ITEM_ACTIONS = [PageStandardAction.Move, PageStandardAction.Delete];
const CONTRACTS: Contract[] = [
    { ...ADA, actions: FOLDER_ACTIONS, id: 'ada-folder', name: 'Ada folder', type: PageItemType.Category },
    { ...GRACE, actions: FOLDER_ACTIONS, id: 'grace-folder', name: 'Grace folder', type: PageItemType.Category },
    { ...ADA, actions: ITEM_ACTIONS, id: 'offer', name: 'Offer', type: PageItemType.Item },
    { ...GRACE, actions: ITEM_ACTIONS, id: 'invoice', name: 'Invoice', type: PageItemType.Item }
];
const LIST_URL = 'https://api.test/api/contracts';
const MOVE_URL = `${LIST_URL}/move`;
const TREE_URL = `${LIST_URL}/categories/tree`;

describe('PageComponent — moves between the folders of an owner', () => {
    let fixture: ComponentFixture<PageComponent>;
    let httpTesting: HttpTestingController;

    function buildConfig(): PageConfig<unknown, Contract> {
        return new PageConfig<unknown, Contract>({
            baseUrl: '/contracts',
            headerConfig: new PageHeaderConfig({
                actions: [pageStandardAction(PageStandardAction.Move), pageStandardAction(PageStandardAction.Delete)]
            }),
            prefix: 'demo',
            tableConfig: new PageTableConfig<Contract>({
                categoriesConfig: new PageCategoriesConfig({}),
                columns: [new TableColumn({ key: 'name' })],
                loadRow: contract => [new TextTableCell({ content: contract.name })]
            })
        });
    }

    function rowOf(name: string): HTMLElement | undefined {
        return queryAll(fixture, '[role="row"]').find(row => row.textContent?.includes(name));
    }

    function dispatchOnRow(name: string, type: string): void {
        rowOf(name)?.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
    }

    async function select(...names: string[]): Promise<void> {
        for (const name of names) {
            queryAll<HTMLInputElement>(
                rowOf(name) as HTMLElement,
                '[aria-label="angular-components.table.select-row"]'
            )[0].click();
        }

        await settle(fixture);
    }

    async function openMenu(): Promise<void> {
        buttonByName(fixture, 'angular-components.header.menu').click();
        await settle(fixture);
    }

    function drag(name: string, folder: string): void {
        dispatchOnRow(name, 'dragstart');
        fixture.detectChanges();
        dispatchOnRow(folder, 'dragover');
        dispatchOnRow(folder, 'drop');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PageComponent],
            providers: [provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = await renderComponent(PageComponent, { config: buildConfig() });
        httpTesting
            .expectOne(current => current.url === LIST_URL)
            .flush({ globalActions: [], results: CONTRACTS, search: { filters: [], page: 1, size: 25, total: 4 } });
        await settle(fixture);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('offers to move rows of one owner among the folders of that owner', async () => {
        await select('Offer');
        await openMenu();

        buttonByName(fixture, 'demo.actions.move.label').click();

        expect(httpTesting.expectOne(current => current.url === TREE_URL).request.params.get('ownerId')).toBe('u1');
    });

    it('does not offer to move a selection of several owners', async () => {
        await select('Offer', 'Invoice');
        await openMenu();

        expect(queryButton(fixture, 'demo.actions.delete.label')).not.toBeNull();
        expect(queryButton(fixture, 'demo.actions.move.label')).toBeNull();
    });

    it('drops a row only onto a folder of its own owner', () => {
        drag('Offer', 'Grace folder');

        expect(httpTesting.match(MOVE_URL)).toEqual([]);

        drag('Offer', 'Ada folder');

        expect(httpTesting.expectOne(MOVE_URL).request.body).toEqual({
            items: [{ id: 'offer', type: PageItemType.Item }],
            targetId: 'ada-folder'
        });
    });
});
