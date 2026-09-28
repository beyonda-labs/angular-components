import { TestBed } from '@angular/core/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';

import { TableColumn } from '../../table/models/table.model';
import { PageBackendResponse, PageConfig, PageConfigParameters, PageHandle } from '../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageViewMode } from '../models/page-categories.model';
import { PageHeaderConfig } from '../models/page-header.model';
import { PageItem } from '../models/page-item.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageService } from './page.service';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';

const ITEMS: PageItem[] = [
    { id: 1, actions: ['edit'] },
    { id: 2, actions: ['edit'] }
];

function buildResponse(results: PageItem[] = ITEMS, total = results.length): PageBackendResponse {
    return { globalActions: ['create'], results, search: { filters: [], page: 1, size: 25, total } };
}

describe('PageService', () => {
    let service: PageService;
    let pageActionsService: MockProxy<PageActionsService>;
    let pageHttpService: MockProxy<PageHttpService>;

    function buildConfig(overrides: Partial<PageConfigParameters> = {}): PageConfig {
        return new PageConfig({
            baseUrl: '/items',
            prefix: 'demo',
            tableConfig: new PageTableConfig({ columns: [], loadRow: () => [] }),
            ...overrides
        });
    }

    function buildCategorisedConfig(useTrash = false): PageConfig {
        return buildConfig({
            tableConfig: new PageTableConfig({
                categoriesConfig: new PageCategoriesConfig({ useTrash }),
                columns: [],
                loadRow: () => []
            })
        });
    }

    function lastQuery(): Record<string, string | number> {
        return pageHttpService.load.mock.calls[pageHttpService.load.mock.calls.length - 1][1];
    }

    function breadcrumbLabels(): string[] {
        return service.categoryBreadcrumbConfig()?.items.map(item => item.label) ?? [];
    }

    function flush(): void {
        TestBed.flushEffects();
    }

    beforeEach(() => {
        pageActionsService = mock<PageActionsService>();
        pageActionsService.filterVisibleActions.mockImplementation(actions => actions);
        pageActionsService.buildHeaderActions.mockReturnValue([]);
        pageHttpService = mock<PageHttpService>();
        pageHttpService.load.mockReturnValue(of(buildResponse()));
        pageHttpService.loadTrash.mockReturnValue(of(buildResponse([{ id: 9 }])));

        TestBed.configureTestingModule({
            providers: [
                PageService,
                { provide: PageActionsService, useValue: pageActionsService },
                { provide: PageHttpService, useValue: pageHttpService }
            ]
        });

        service = TestBed.inject(PageService);
    });

    it('loads the page from the backend once it has a config, honouring the configured order', () => {
        const onDataLoaded = jest.fn();
        service.setConfig(
            buildConfig({
                onDataLoaded,
                tableConfig: new PageTableConfig({
                    columns: [],
                    loadRow: () => [],
                    order: { direction: 'asc' as never, field: 'name' }
                })
            })
        );
        flush();

        expect(service.items()).toEqual(ITEMS);
        expect(service.totalItems()).toBe(2);
        expect(service.pageSearch().sort).toEqual({ direction: 'asc', field: 'name' });
        expect(onDataLoaded).toHaveBeenCalledWith(buildResponse());
        expect(service.loading()).toBe(false);
    });

    it('hands the consumer a handle that reloads and reports the selection', () => {
        const onReady = jest.fn();
        service.setConfig(buildConfig({ onReady }));
        flush();
        const handle = onReady.mock.calls[0][0] as PageHandle;

        service.setSelected([ITEMS[0]]);
        expect(handle.selected()).toEqual([ITEMS[0]]);
        expect(handle.viewMode()).toBe(PageViewMode.Table);

        handle.refresh();
        flush();

        expect(pageHttpService.load).toHaveBeenCalledTimes(2);
    });

    it('builds the table from the items and keeps the selection across a reload when the rows survive', () => {
        const onSelectionChange = jest.fn();
        service.setConfig(
            buildConfig({ tableConfig: new PageTableConfig({ columns: [], loadRow: () => [], onSelectionChange }) })
        );
        flush();

        service.tableConfig()?.selectedItemsChange?.([ITEMS[1]], [1]);
        expect(onSelectionChange).toHaveBeenCalledWith([ITEMS[1]]);

        pageHttpService.load.mockReturnValue(of(buildResponse([ITEMS[1]])));
        service.refresh();
        flush();
        expect(service.selected()).toEqual([ITEMS[1]]);

        pageHttpService.load.mockReturnValue(of(buildResponse([ITEMS[0]])));
        service.refresh();
        flush();
        expect(service.selected()).toEqual([]);
    });

    it('keeps the column keys and reads their tooltips from kebab-case segments', () => {
        service.setConfig(
            buildConfig({
                tableConfig: new PageTableConfig({
                    columns: [new TableColumn({ key: 'createdAt' })],
                    loadRow: () => []
                })
            })
        );
        flush();

        expect(service.tableConfig()?.columns.map(({ key, tooltip }) => ({ key, tooltip }))).toEqual([
            { key: 'createdAt', tooltip: 'demo.table.tooltips.created-at' }
        ]);
    });

    it('paginates and searches through the query, going back to the first page on a new filter', () => {
        service.setConfig(
            buildConfig({
                tableConfig: new PageTableConfig({
                    columns: [],
                    loadRow: () => [],
                    search: { fields: [], mainField: 'name' }
                })
            })
        );
        pageHttpService.load.mockReturnValue(of(buildResponse(ITEMS, 80)));
        flush();

        service.paginationConfig()?.onPageChange?.(3);
        flush();
        expect(service.pageSearch().page).toBe(3);
        expect(lastQuery()['search']).toEqual(expect.any(String));

        service.searchConfig()?.onFiltersChange?.([]);
        flush();
        expect(service.pageSearch().page).toBe(1);
    });

    it('offers the header actions the backend, the selection and the categories allow', () => {
        const categoriesConfig = new PageCategoriesConfig({});
        service.setConfig(
            buildConfig({
                headerConfig: new PageHeaderConfig({
                    actions: [
                        new PageAction({
                            key: PageStandardAction.Create,
                            scope: PageActionScope.Global,
                            zone: PageActionZone.Right
                        })
                    ]
                }),
                tableConfig: new PageTableConfig({ categoriesConfig, columns: [], loadRow: () => [] })
            })
        );
        flush();

        expect(service.headerConfig()).not.toBeNull();
        expect(pageActionsService.filterVisibleActions).toHaveBeenLastCalledWith(
            expect.arrayContaining([expect.objectContaining({ key: 'create' })]),
            ['create'],
            [],
            categoriesConfig
        );
    });

    describe('categories', () => {
        it('scopes the list to the current category and walks the breadcrumb back up', () => {
            pageHttpService.loadCategoryPath.mockReturnValue(of([{ id: 'a', name: 'Books' } as never]));
            service.setConfig(buildCategorisedConfig());
            flush();
            expect(lastQuery()['parentId']).toBe('null');
            expect(breadcrumbLabels()).toEqual(['demo.categories.root']);

            service.openCategory({ id: 'a' });
            flush();
            expect(lastQuery()['parentId']).toBe('a');
            expect(breadcrumbLabels()).toEqual(['demo.categories.root', 'Books']);

            service.categoryBreadcrumbConfig()?.onItemClick?.(0);
            flush();
            expect(lastQuery()['parentId']).toBe('null');
            expect(service.currentCategoryId()).toBeNull();
        });

        it('switches to the trash, which is flat and has its own breadcrumb, and back', () => {
            service.setConfig(buildCategorisedConfig(true));
            flush();
            expect(service.viewToggleConfig()?.tabs.map(tab => tab.key)).toEqual(['table', 'trash']);

            service.viewToggleConfig()?.onTabChange?.(PageViewMode.Trash);
            flush();
            expect(pageHttpService.loadTrash).toHaveBeenCalled();
            expect(service.items()).toEqual([{ id: 9 }]);
            expect(breadcrumbLabels()).toEqual(['demo.tabs.trash.label']);

            service.setViewMode(PageViewMode.Table);
            flush();
            expect(breadcrumbLabels()).toEqual(['demo.categories.root']);
        });
    });

    it('gives the actions a context that clears the selection and reloads after a change', () => {
        service.setConfig(
            buildConfig({
                headerConfig: new PageHeaderConfig({
                    actions: [
                        new PageAction({
                            key: PageStandardAction.Delete,
                            scope: PageActionScope.Item,
                            zone: PageActionZone.Menu
                        })
                    ]
                })
            })
        );
        pageActionsService.buildHeaderActions.mockImplementation((actions, _zone, execute) =>
            actions.map(action => ({ action: () => execute(action) }) as never)
        );
        flush();
        service.setSelected([ITEMS[0]]);

        service.headerConfig()?.menuActions[0].action?.();
        const context = pageActionsService.executeAction.mock.calls[0][1] as PageActionsContext;

        expect(context.selectedItems()).toEqual([ITEMS[0]]);

        context.onDeleted();
        flush();
        expect(service.selected()).toEqual([]);
        expect(pageHttpService.load).toHaveBeenCalledTimes(2);
    });
});
