import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buttonByName, queryAll, queryButton, renderComponent, rowWith, settle, textsOf } from '@testing/dom';
import { fieldsOf } from '@testing/form-fields';
import { FakeFormHandle } from '@testing/handles/fake-form-handle';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';
import { FakeToastService } from '@testing/services/fake-toast.service';
import { pickInTreeDialog, treeDialogItems } from '@testing/tree-dialog';

import { FormListField } from '../form/models/fields/form-list-field.model';
import { TableColumn } from '../table/models/table.model';
import { LinkTableCell, TextTableCell } from '../table/models/table-cell.model';
import { pageOwnerCell, pageOwnerColumn } from './functions/page-owner-column';
import { pageStandardAction } from './functions/page-standard-actions';
import { PageConfig, PageHandle } from './models/page.model';
import { PageStandardAction } from './models/page-action.model';
import { PageCategoriesConfig, PageItemType } from './models/page-categories.model';
import { PageHeaderConfig } from './models/page-header.model';
import { PageOwnedItem } from './models/page-owner.model';
import { PageShareFormValue } from './models/page-sharing.model';
import { PageTableConfig } from './models/page-table.model';
import { PageComponent } from './page.component';

interface Contract extends PageOwnedItem {
    name: string;
    parentId: string | null;
    type: PageItemType;
}

const ADA = { ownerId: 'u1', ownerName: 'Ada Lovelace' };
const GRACE = { ownerId: 'u2', ownerName: 'Grace Hopper' };
const DRAFTS: Contract = {
    ...ADA,
    actions: [PageStandardAction.Share],
    id: 'drafts',
    name: 'Drafts',
    parentId: null,
    type: PageItemType.Category
};
const HOME: Contract = { ...GRACE, id: 'home', name: 'Home', parentId: null, type: PageItemType.Category };
const CLIENTS: Contract = { ...GRACE, id: 'clients', name: 'Clients', parentId: 'home', type: PageItemType.Category };
const ACME: Contract = { ...GRACE, id: 'acme', name: 'Acme', parentId: 'clients', type: PageItemType.Category };
const OFFER: Contract = { ...GRACE, id: 'offer', name: 'Offer', parentId: 'clients', type: PageItemType.Item };
const LIST_URL = 'https://api.test/api/contracts';
const SHARED_LABEL = 'angular-components.page.shared.label';
const SHARES_URL = `${LIST_URL}/categories/drafts/shares`;

describe('PageComponent — sharing', () => {
    let fixture: ComponentFixture<PageComponent>;
    let httpTesting: HttpTestingController;
    let page: PageHandle<Contract> | undefined;

    function buildConfig(): PageConfig<unknown, Contract> {
        return new PageConfig<unknown, Contract>({
            baseUrl: '/contracts',
            headerConfig: new PageHeaderConfig({
                actions: [pageStandardAction(PageStandardAction.Share), pageStandardAction(PageStandardAction.Move)]
            }),
            onReady: handle => (page = handle),
            prefix: 'demo',
            tableConfig: new PageTableConfig<Contract>({
                categoriesConfig: new PageCategoriesConfig<Contract>({
                    loadRow: folder => [
                        new LinkTableCell({ action: () => page?.openCategory(folder), content: folder.name }),
                        pageOwnerCell(folder)
                    ]
                }),
                columns: [new TableColumn({ key: 'name' }), pageOwnerColumn()],
                isSharedEnabled: true,
                isTrashEnabled: true,
                loadRow: contract => [new TextTableCell({ content: contract.name }), pageOwnerCell(contract)]
            })
        });
    }

    async function answer(url: string, results: Contract[]): Promise<TestRequest> {
        await settle(fixture);
        const request = httpTesting.expectOne(current => current.url === url);

        request.flush({
            globalActions: [],
            results,
            search: { filters: [], page: 1, size: 25, total: results.length }
        });
        await settle(fixture);

        return request;
    }

    function breadcrumb(): string {
        return queryAll(fixture, '[aria-label="angular-components.breadcrumb.label"]')[0]?.textContent ?? '';
    }

    async function click(element: HTMLElement): Promise<void> {
        element.click();
        await settle(fixture);
    }

    async function openFolder(name: string, path: Contract[], results: Contract[]): Promise<TestRequest> {
        await click(buttonByName(fixture, name));
        httpTesting.expectOne(`${LIST_URL}/categories/${path[path.length - 1].id}/path`).flush(path);

        return answer(LIST_URL, results);
    }

    async function openShared(): Promise<TestRequest> {
        await click(buttonByName(fixture, SHARED_LABEL));

        return answer(`${LIST_URL}/shared`, [CLIENTS]);
    }

    async function select(name: string): Promise<void> {
        await click(queryAll(rowWith(fixture, name), '[aria-label="angular-components.table.select-row"]')[0]);
    }

    async function pickFolder(name: string): Promise<void> {
        pickInTreeDialog(name);
        await settle(fixture);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PageComponent],
            providers: [provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = await renderComponent(PageComponent, { config: buildConfig() });
        await answer(LIST_URL, [DRAFTS]);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('lists the folders shared with the user, with their owner, from a shared tab before the trash', async () => {
        const tabs = queryAll(fixture, '[role="tab"]').map(tab => tab.textContent?.trim());
        const request = await openShared();

        expect(tabs).toEqual(['demo.tabs.table.label', SHARED_LABEL, 'demo.tabs.trash.label']);
        expect(request.request.params.has('parentId')).toBe(false);
        expect(fixture.nativeElement.textContent).toContain('Grace Hopper');
        expect(breadcrumb()).toContain(SHARED_LABEL);
    });

    it('opens a shared folder as usual, the breadcrumb starting at the shared folder', async () => {
        await openShared();

        const request = await openFolder('Clients', [HOME, CLIENTS], [ACME, OFFER]);

        expect(request.request.params.get('parentId')).toBe('clients');
        expect(breadcrumb()).toContain('Clients');
        expect(breadcrumb()).not.toContain('Home');

        await openFolder('Acme', [HOME, CLIENTS, ACME], []);

        expect(breadcrumb()).toContain('Acme');
        expect(breadcrumb()).toContain('Clients');
        expect(breadcrumb()).not.toContain('Home');
    });

    it('goes back to the folders of the user at their root when leaving the shared view', async () => {
        await openShared();
        await openFolder('Clients', [HOME, CLIENTS], [OFFER]);

        await click(buttonByName(fixture, 'demo.tabs.table.label'));
        const request = await answer(LIST_URL, [DRAFTS]);

        expect(request.request.params.get('parentId')).toBe('null');
        expect(breadcrumb()).not.toContain('Clients');
    });

    it('shares a folder that offers it with the grantees its lists hold, found by a search, and confirms it', async () => {
        await select('Drafts');
        await click(buttonByName(fixture, 'angular-components.header.menu'));
        await click(buttonByName(fixture, 'demo.actions.share.label'));
        httpTesting.expectOne(SHARES_URL).flush({ inherited: [], shares: [] });

        const [form] = TestBed.inject(FakeModalFormService).forms();
        const editList = fieldsOf(form).find(field => field.key === 'write') as FormListField;
        let suggestions: string[] = [];
        editList.picker?.search?.('gra', []).subscribe(result => {
            suggestions = (Array.isArray(result) ? result : result.options).map(({ value }) => value);
        });
        const search = httpTesting.expectOne(current => current.url === `${LIST_URL}/categories/drafts/share-targets`);
        search.flush({ groups: [], hasMore: false, users: [{ id: 'u2', name: 'Grace Hopper' }] });

        expect(search.request.params.toString()).toBe('search=gra&limit=20');
        expect(suggestions).toEqual(['user:u2']);

        form.onSubmit?.({ grantees: { read: [], write: ['user:u2'] } } as PageShareFormValue, new FakeFormHandle());
        const save = httpTesting.expectOne(SHARES_URL);
        save.flush({ inherited: [], shares: [] });
        await answer(LIST_URL, [DRAFTS]);

        expect(save.request.method).toBe('PUT');
        expect(save.request.body).toEqual({ shares: [{ access: 'write', granteeId: 'u2', granteeType: 'user' }] });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'demo.toast.share-success' }]);
    });

    it('offers nothing to do on a folder that does not list the share', async () => {
        await openShared();

        await select('Clients');

        expect(queryButton(fixture, 'angular-components.header.menu')).toBeNull();
    });

    it('offers no move for a folder at the root of the shared tab, and moves inside it only among its folders', async () => {
        const movable = { actions: [PageStandardAction.Move] };
        await click(buttonByName(fixture, SHARED_LABEL));
        await answer(`${LIST_URL}/shared`, [{ ...CLIENTS, ...movable }]);
        await select('Clients');
        const menuAtRoot = queryButton(fixture, 'angular-components.header.menu');

        await openFolder(
            'Clients',
            [HOME, CLIENTS],
            [
                { ...ACME, ...movable },
                { ...OFFER, ...movable }
            ]
        );
        await select('Offer');
        await click(buttonByName(fixture, 'angular-components.header.menu'));
        await click(buttonByName(fixture, 'demo.actions.move.label'));
        const tree = httpTesting.expectOne(current => current.url === `${LIST_URL}/categories/tree`);
        tree.flush([HOME, CLIENTS, ACME]);
        const offered = textsOf(treeDialogItems());
        await pickFolder('Acme');
        const move = httpTesting.expectOne(`${LIST_URL}/move`);
        move.flush(null);
        await answer(LIST_URL, [ACME, OFFER]);

        expect(menuAtRoot).toBeNull();
        expect(tree.request.params.get('ownerId')).toBe('u2');
        expect(offered).toEqual(['Clients', 'Acme']);
        expect(move.request.body).toEqual({ items: [{ id: 'offer', type: PageItemType.Item }], targetId: 'acme' });
    });
});
