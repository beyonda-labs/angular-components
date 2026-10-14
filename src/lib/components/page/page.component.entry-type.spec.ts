import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buttonByName, queryAll, renderComponent, rowWith, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { TableColumn } from '../table/models/table.model';
import { TextTableCell } from '../table/models/table-cell.model';
import { pageStandardAction } from './functions/page-standard-actions';
import { PageConfig } from './models/page.model';
import { PageStandardAction } from './models/page-action.model';
import { PageCategoriesConfig, PageItemType } from './models/page-categories.model';
import { PageHeaderConfig } from './models/page-header.model';
import { PageItem } from './models/page-item.model';
import { PageTableConfig } from './models/page-table.model';
import { PageComponent } from './page.component';

interface Variable extends PageItem {
    entryType: PageItemType;
    name: string;
    parentId: string | null;

    type?: string;
}

const ACTIONS = [PageStandardAction.Move, PageStandardAction.RestoreTrashItem];
const FOLDER: Variable = {
    actions: ACTIONS,
    entryType: PageItemType.Category,
    id: 'f1',
    name: 'Shared',
    parentId: null
};
const VARIABLE: Variable = {
    actions: ACTIONS,
    entryType: PageItemType.Item,
    id: 'v1',
    name: 'Customer',
    parentId: null,
    type: 'string'
};
const LIST_URL = 'https://api.test/api/variables';

describe('PageComponent — an entry type field of its own', () => {
    let fixture: ComponentFixture<PageComponent>;
    let httpTesting: HttpTestingController;

    function buildConfig(): PageConfig<unknown, Variable> {
        return new PageConfig<unknown, Variable>({
            baseUrl: '/variables',
            headerConfig: new PageHeaderConfig({
                actions: [
                    pageStandardAction(PageStandardAction.Move),
                    pageStandardAction(PageStandardAction.RestoreTrashItem)
                ]
            }),
            prefix: 'demo',
            tableConfig: new PageTableConfig<Variable>({
                categoriesConfig: new PageCategoriesConfig({ typeField: 'entryType' }),
                columns: [new TableColumn({ key: 'name' }), new TableColumn({ key: 'type' })],
                isTrashEnabled: true,
                loadRow: variable => [
                    new TextTableCell({ content: variable.name }),
                    new TextTableCell({ content: variable.type ?? '' })
                ]
            })
        });
    }

    function answer(url: string, results: Variable[]): void {
        httpTesting
            .expectOne(current => current.url === url && current.method === 'GET')
            .flush({ globalActions: [], results, search: { filters: [], page: 1, size: 25, total: results.length } });
    }

    function dispatchOnRow(name: string, type: string): void {
        rowWith(fixture, name).dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
    }

    async function select(...names: string[]): Promise<void> {
        for (const name of names) {
            queryAll<HTMLInputElement>(
                rowWith(fixture, name),
                '[aria-label="angular-components.table.select-row"]'
            )[0].click();
        }

        await settle(fixture);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PageComponent],
            providers: [provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = await renderComponent(PageComponent, { config: buildConfig() });
        answer(LIST_URL, [FOLDER, VARIABLE]);
        await settle(fixture);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('tells the folders apart by the entry type field, and leaves the type field to the rows', () => {
        buttonByName(fixture, 'Shared').click();

        expect(rowWith(fixture, 'Customer').textContent).toContain('string');
        expect(httpTesting.expectOne(`${LIST_URL}/categories/f1/path`).request.method).toBe('GET');
    });

    it('moves a row with a type field of its own as an item', () => {
        dispatchOnRow('Customer', 'dragstart');
        fixture.detectChanges();
        dispatchOnRow('Shared', 'dragover');
        dispatchOnRow('Shared', 'drop');

        expect(httpTesting.expectOne(`${LIST_URL}/move`).request.body).toEqual({
            items: [{ id: 'v1', type: PageItemType.Item }],
            targetId: 'f1'
        });
    });

    it('restores the trashed rows as entries of the type their entry type field names', async () => {
        buttonByName(fixture, 'demo.tabs.trash.label').click();
        await settle(fixture);
        answer(`${LIST_URL}/trash`, [FOLDER, VARIABLE]);
        await settle(fixture);

        await select('Shared', 'Customer');
        buttonByName(fixture, 'demo.actions.restore-trash-item.label').click();
        const request = httpTesting.expectOne(
            current => current.url === `${LIST_URL}/trash` && current.method === 'PUT'
        );
        request.flush({ renamed: [] });
        await settle(fixture);
        answer(`${LIST_URL}/trash`, []);

        expect(request.request.body).toEqual({
            items: [
                { id: 'f1', type: PageItemType.Category },
                { id: 'v1', type: PageItemType.Item }
            ]
        });
    });
});
