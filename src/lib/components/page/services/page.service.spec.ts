import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';
import { of, Subject, throwError } from 'rxjs';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { StringFilter } from '../../search/models/search-filter.model';
import { TableColumn, TableSortDirection } from '../../table/models/table.model';
import { pageStandardAction } from '../functions/page-standard-actions';
import { PageBackendResponse, PageConfig, PageConfigParameters, PageHandle } from '../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageItemType, PageViewMode } from '../models/page-categories.model';
import { PageFormConfig } from '../models/page-form.model';
import { PageHeaderConfig } from '../models/page-header.model';
import { PageItem } from '../models/page-item.model';
import { PageSearch, SearchSortDirection } from '../models/page-search.model';
import { PageTableConfig, PageTableSearchConfig } from '../models/page-table.model';
import { PageService } from './page.service';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';
import { PageOrganizationsService } from './page-organizations.service';
import { PageOwnersService } from './page-owners.service';

interface Team extends PageItem {
    title: string;
}

interface TeamFormValue {
    team: { title: string };
}

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

    function buildCategorisedConfig(isTrashEnabled = false): PageConfig {
        return buildConfig({
            tableConfig: new PageTableConfig({
                categoriesConfig: new PageCategoriesConfig({}),
                columns: [],
                isTrashEnabled,
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
                PageOrganizationsService,
                PageOwnersService,
                PageService,
                provideTranslateService(),
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

    it('cancels a load still out when a newer one starts, and keeps loading until the newer one answers', () => {
        const older = new Subject<PageBackendResponse>();
        const newer = new Subject<PageBackendResponse>();
        pageHttpService.load.mockReturnValueOnce(older).mockReturnValueOnce(newer);
        service.setConfig(buildConfig());
        flush();

        service.refresh();
        flush();

        expect(older.observed).toBe(false);
        expect(service.loading()).toBe(true);

        newer.next(buildResponse([ITEMS[1]]));
        newer.complete();

        expect(service.items()).toEqual([ITEMS[1]]);
        expect(service.loading()).toBe(false);
    });

    it('stops loading after a failed load and still loads again afterwards', () => {
        pageHttpService.load.mockReturnValueOnce(throwError(() => new Error('failed')));
        service.setConfig(buildConfig());
        flush();

        expect(service.loading()).toBe(false);
        expect(service.items()).toEqual([]);

        service.refresh();
        flush();

        expect(service.items()).toEqual(ITEMS);
    });

    it('opens a form with its own request from the handle and reloads once it is saved', () => {
        const onReady = jest.fn();
        service.setConfig(buildConfig({ onReady }));
        flush();
        const handle = onReady.mock.calls[0][0] as PageHandle;
        const form = new ModalFormConfig({ prefix: 'demo.status', sections: [] });
        const submit = jest.fn(() => of(null));

        handle.openForm(form, submit);
        const [openedForm, openedSubmit, onSaved] = pageActionsService.openRequestForm.mock.calls[0];
        onSaved();
        flush();

        expect([openedForm, openedSubmit]).toEqual([form, submit]);
        expect(pageHttpService.load).toHaveBeenCalledTimes(2);
    });

    it('opens the edit form of a row from the handle, with the context of the page', () => {
        const onReady = jest.fn();
        service.setConfig(buildConfig({ onReady }));
        flush();
        const handle = onReady.mock.calls[0][0] as PageHandle;

        handle.openEdit(ITEMS[0]);

        const [context, row] = pageActionsService.openEditForm.mock.calls[0];

        expect(row).toBe(ITEMS[0]);
        expect((context as PageActionsContext).config.prefix).toBe(buildConfig().prefix);
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
                    search: new PageTableSearchConfig({ fields: [], mainField: 'name' })
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

    it('sends the filter of the text field as the text of the search, and keeps it as a filter for the search box', () => {
        const text = new StringFilter({ field: 'text', value: 'ada' });
        service.setConfig(
            buildConfig({
                tableConfig: new PageTableConfig({
                    columns: [],
                    loadRow: () => [],
                    search: new PageTableSearchConfig({ fields: [], mainField: 'text', textField: 'text' })
                })
            })
        );
        flush();

        service.searchConfig()?.onFiltersChange?.([text]);
        flush();

        expect(JSON.parse(atob(String(lastQuery()['search'])))).toEqual(
            expect.objectContaining({ filters: [], text: 'ada' })
        );
        expect(service.pageSearch().filters).toEqual([text]);
    });

    it('asks for the owners the first time the filters panel opens, and then offers the owner filter', () => {
        pageHttpService.findOwners.mockReturnValue(
            of([
                { id: 'u1', name: 'Ada' },
                { id: 'u2', name: 'Grace' }
            ])
        );
        service.setConfig(
            buildConfig({
                tableConfig: new PageTableConfig({
                    columns: [],
                    loadRow: () => [],
                    search: new PageTableSearchConfig({ fields: [], isOwnerFilterEnabled: true })
                })
            })
        );
        flush();
        expect(service.searchConfig()?.fields).toEqual([]);
        expect(pageHttpService.findOwners).not.toHaveBeenCalled();

        service.searchConfig()?.onPanelOpen?.();
        service.searchConfig()?.onPanelOpen?.();

        expect(pageHttpService.findOwners).toHaveBeenCalledTimes(1);
        expect(pageHttpService.findOwners).toHaveBeenCalledWith('/items');
        expect(service.searchConfig()?.fields.map(field => field.key)).toEqual(['ownerId']);
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

        it('offers the trash on a page without categories too', () => {
            service.setConfig(
                buildConfig({
                    tableConfig: new PageTableConfig({ columns: [], isTrashEnabled: true, loadRow: () => [] })
                })
            );
            flush();

            service.viewToggleConfig()?.onTabChange?.(PageViewMode.Trash);
            flush();

            expect(pageHttpService.loadTrash).toHaveBeenCalled();
        });

        it('takes a category form typed by its value and hands it to the category actions', () => {
            const formConfig = new PageFormConfig<TeamFormValue, Team>({
                buildSections: () => [],
                prefix: 'demo.team-form',
                toFormValue: team => (team ? { team: { title: team.title } } : undefined),
                toItem: value => ({ title: value.team.title })
            });
            service.setConfig(
                new PageConfig<unknown, PageItem, Team, TeamFormValue>({
                    baseUrl: '/items',
                    headerConfig: new PageHeaderConfig({
                        actions: [
                            new PageAction({
                                key: PageStandardAction.CreateCategory,
                                scope: PageActionScope.Global,
                                zone: PageActionZone.Right
                            })
                        ]
                    }),
                    prefix: 'demo',
                    tableConfig: new PageTableConfig({
                        categoriesConfig: new PageCategoriesConfig<Team, TeamFormValue>({ formConfig }),
                        columns: [],
                        loadRow: () => []
                    })
                })
            );
            pageActionsService.buildHeaderActions.mockImplementation((actions, _zone, execute) =>
                actions.map(action => ({ action: () => execute(action) }) as never)
            );
            flush();

            service.headerConfig()?.rightActions[0].action?.();
            const [action, context] = pageActionsService.executeAction.mock.calls[0];

            expect(action.key).toBe(PageStandardAction.CreateCategory);
            expect(context.config.tableConfig?.categoriesConfig?.formConfig).toBe(formConfig);
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

    describe('sort', () => {
        const ORDER = { direction: SearchSortDirection.Asc, field: 'name' };

        function decodedSearch(): PageSearch {
            return JSON.parse(atob(String(lastQuery()['search']))) as PageSearch;
        }

        beforeEach(() => {
            service.setConfig(
                buildConfig({
                    tableConfig: new PageTableConfig({
                        columns: [new TableColumn({ isSortable: true, key: 'updatedAt' })],
                        loadRow: () => [],
                        order: ORDER
                    })
                })
            );
            pageHttpService.load.mockReturnValue(of(buildResponse(ITEMS, 80)));
            flush();
        });

        it('sends the sort a sortable column reports from the first page, even without a search config', () => {
            service.paginationConfig()?.onPageChange?.(3);
            flush();

            service.tableConfig()?.onSortChange?.({ direction: TableSortDirection.Desc, field: 'updatedAt' });
            flush();

            expect(decodedSearch()).toMatchObject({
                page: 1,
                sort: { direction: SearchSortDirection.Desc, field: 'updatedAt' }
            });
            expect(service.tableConfig()?.sort).toEqual({ direction: TableSortDirection.Desc, field: 'updatedAt' });
        });

        it('goes back to the configured order when the sort is cleared', () => {
            service.tableConfig()?.onSortChange?.({ direction: TableSortDirection.Asc, field: 'updatedAt' });
            flush();

            service.tableConfig()?.onSortChange?.(null);
            flush();

            expect(decodedSearch().sort).toEqual(ORDER);
            expect(service.tableConfig()?.sort).toBeUndefined();
        });
    });

    it('hands the table its columns as declared, with the tooltips of the page, and its storage key', () => {
        service.setConfig(
            buildConfig({
                tableConfig: new PageTableConfig({
                    columns: [new TableColumn({ isHideable: false, isSortable: true, key: 'name', width: '12rem' })],
                    loadRow: () => [],
                    storageKey: 'items'
                })
            })
        );
        flush();

        expect(service.tableConfig()?.storageKey).toBe('items');
        expect(service.tableConfig()?.columns[0]).toMatchObject({
            isHideable: false,
            isSortable: true,
            key: 'name',
            sortField: 'name',
            tooltip: 'demo.table.tooltips.name',
            width: '12rem'
        });
    });

    describe('drag to move', () => {
        const FOLDER = { actions: ['move'], id: 'folder', parentId: null, type: PageItemType.Category };
        const FILE = { actions: ['move'], id: 'file', parentId: null, type: PageItemType.Item };

        function buildMoveConfig(actions: PageAction[], isTrashEnabled = false): PageConfig {
            return buildConfig({
                headerConfig: new PageHeaderConfig({ actions }),
                tableConfig: new PageTableConfig({
                    categoriesConfig: new PageCategoriesConfig({}),
                    columns: [],
                    isTrashEnabled,
                    loadRow: () => []
                })
            });
        }

        it('lets the rows that may move be dropped onto a folder, through the move of the actions', () => {
            pageHttpService.load.mockReturnValue(of(buildResponse([FOLDER, FILE])));
            service.setConfig(buildMoveConfig([pageStandardAction(PageStandardAction.Move)]));
            flush();
            service.setSelected([FILE]);
            const table = service.tableConfig();

            expect(table?.isRowDraggable?.(FILE)).toBe(true);
            expect(table?.isDropAllowed?.(FOLDER, [FILE])).toBe(true);
            expect(table?.isDropAllowed?.(FILE, [FOLDER])).toBe(false);

            table?.onRowDrop?.(FOLDER, [FILE]);
            const [context, items, targetId] = pageActionsService.moveItems.mock.calls[0];

            expect(items).toEqual([FILE]);
            expect(targetId).toBe('folder');

            context.onMoved();
            flush();
            expect(service.selected()).toEqual([]);
            expect(pageHttpService.load).toHaveBeenCalledTimes(2);
        });

        it('takes a drop only on a folder of the owner of every dragged row', () => {
            const adaFolder = { ...FOLDER, id: 'ada-folder', ownerId: 'ada', ownerName: 'Ada' };
            const graceFolder = { ...FOLDER, id: 'grace-folder', ownerId: 'grace', ownerName: 'Grace' };
            const adaFile = { ...FILE, id: 'ada-file', ownerId: 'ada', ownerName: 'Ada' };
            const graceFile = { ...FILE, id: 'grace-file', ownerId: 'grace', ownerName: 'Grace' };
            pageHttpService.load.mockReturnValue(of(buildResponse([adaFolder, graceFolder, adaFile, graceFile])));
            service.setConfig(buildMoveConfig([pageStandardAction(PageStandardAction.Move)]));
            flush();
            const table = service.tableConfig();

            expect(table?.isDropAllowed?.(adaFolder, [adaFile])).toBe(true);
            expect(table?.isDropAllowed?.(graceFolder, [adaFile])).toBe(false);
            expect(table?.isDropAllowed?.(graceFolder, [adaFile, graceFile])).toBe(false);
        });

        it('offers no drag without the standard move action, nor in the trash', () => {
            service.setConfig(buildMoveConfig([pageStandardAction(PageStandardAction.Delete)]));
            flush();
            expect(service.tableConfig()?.onRowDrop).toBeUndefined();

            service.setConfig(buildMoveConfig([pageStandardAction(PageStandardAction.Move)], true));
            service.setViewMode(PageViewMode.Trash);
            flush();
            expect(service.tableConfig()?.isRowDraggable).toBeUndefined();
        });
    });
});
