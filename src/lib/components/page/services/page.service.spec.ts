import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Tab, TabsConfig, TabsVariant } from '../../tabs/models/tabs.model';
import { PageBackendResponse, PageConfig } from '../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageViewMode } from '../models/page-categories.model';
import { PageHeaderConfig } from '../models/page-header.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageService } from './page.service';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';

describe('PageService', () => {
    let service: PageService;

    const load = jest.fn();
    const loadTrash = jest.fn();
    const loadCategoryPath = jest.fn();
    const executeAction = jest.fn();
    const filterVisibleActions = jest.fn(() => []);
    const buildHeaderActions = jest.fn(() => []);

    beforeEach(() => {
        load.mockReset().mockReturnValue(of(buildResponse()));
        loadTrash.mockReset().mockReturnValue(of(buildResponse()));
        loadCategoryPath.mockReset();
        executeAction.mockReset();
        filterVisibleActions.mockReset().mockReturnValue([]);
        buildHeaderActions.mockReset().mockReturnValue([]);

        TestBed.configureTestingModule({
            providers: [
                PageService,
                { provide: PageActionsService, useValue: { buildHeaderActions, executeAction, filterVisibleActions } },
                { provide: PageHttpService, useValue: { load, loadCategoryPath, loadTrash } }
            ]
        });

        service = TestBed.inject(PageService);
    });

    describe('loadFromBackend', () => {
        it('should call load (not loadTrash) for a plain page', () => {
            service.init(new PageConfig({ baseUrl: '/items', page: 'testPage' }));
            service.load();

            expect(load).toHaveBeenCalledWith('/items', {});
            expect(loadTrash).not.toHaveBeenCalled();
        });

        it('should send the parentField as the string "null" at the root of a categorized page', () => {
            service.init(buildCategoryConfig());
            service.load();

            expect(load).toHaveBeenCalledWith('/items', { parentId: 'null' });
        });

        it('should send the current category id as parentField once inside a category', () => {
            loadCategoryPath.mockReturnValue(of([{ id: 'cat-1', name: 'Electronics' }]));
            service.init(buildCategoryConfig());
            service.openCategory({ id: 'cat-1' });
            service.load();

            expect(load).toHaveBeenCalledWith('/items', { parentId: 'cat-1' });
        });

        it('should call loadTrash instead of load while in trash view mode, without a parentField', () => {
            service.init(buildCategoryConfig());
            service.setViewMode(PageViewMode.Trash);
            service.load();

            expect(loadTrash).toHaveBeenCalledWith('/items', {});
            expect(load).not.toHaveBeenCalled();
        });
    });

    describe('categoryBreadcrumbConfig', () => {
        it('should be null without a categories config', () => {
            service.init(new PageConfig({ baseUrl: '/items', page: 'testPage' }));

            expect(service.categoryBreadcrumbConfig()).toBeNull();
        });

        it('should show only the root label before navigating into a category', () => {
            service.init(buildCategoryConfig());

            const breadcrumb = service.categoryBreadcrumbConfig();

            expect(breadcrumb?.items.map(item => item.label)).toEqual(['testPage.categories.root']);
            expect(breadcrumb?.items[0].isTranslationKey).toBe(true);
        });

        it('should keep the root label as a translation key (resolved reactively by the breadcrumb component) and list the visited categories', () => {
            loadCategoryPath.mockReturnValue(of([{ id: 'cat-1', name: 'Electronics' }]));
            service.init(buildCategoryConfig());
            service.openCategory({ id: 'cat-1' });

            const breadcrumb = service.categoryBreadcrumbConfig();

            expect(breadcrumb?.items.map(item => item.label)).toEqual(['testPage.categories.root', 'Electronics']);
            expect(breadcrumb?.items[0].isTranslationKey).toBe(true);
        });

        it('should reset to root when navigating to breadcrumb id 0', () => {
            loadCategoryPath.mockReturnValue(of([{ id: 'cat-1', name: 'Electronics' }]));
            service.init(buildCategoryConfig());
            service.openCategory({ id: 'cat-1' });
            service.navigateBreadcrumb(0);

            expect(service.categoryBreadcrumbConfig()?.items.map(item => item.label)).toEqual(['testPage.categories.root']);
            expect(service.currentCategoryId()).toBeNull();
        });

        it('should replace the path with whatever the backend returns, not stack it, on every openCategory call', () => {
            loadCategoryPath.mockReturnValueOnce(of([{ id: 'cat-1', name: 'Electronics' }]));
            service.init(buildCategoryConfig());
            service.openCategory({ id: 'cat-1' });

            loadCategoryPath.mockReturnValueOnce(
                of([
                    { id: 'cat-1', name: 'Electronics' },
                    { id: 'cat-2', name: 'Phones' }
                ])
            );
            service.openCategory({ id: 'cat-2' });

            expect(loadCategoryPath).toHaveBeenLastCalledWith('/items', 'cat-2');
            expect(service.currentCategoryId()).toBe('cat-2');
            expect(service.categoryBreadcrumbConfig()?.items.map(item => item.label)).toEqual([
                'testPage.categories.root',
                'Electronics',
                'Phones'
            ]);
        });

        it('should truncate the local path (no request) when navigating back to an intermediate breadcrumb entry', () => {
            loadCategoryPath.mockReturnValue(
                of([
                    { id: 'cat-1', name: 'Electronics' },
                    { id: 'cat-2', name: 'Phones' }
                ])
            );
            service.init(buildCategoryConfig());
            service.openCategory({ id: 'cat-2' });
            loadCategoryPath.mockClear();

            service.navigateBreadcrumb(1);

            expect(loadCategoryPath).not.toHaveBeenCalled();
            expect(service.currentCategoryId()).toBe('cat-1');
            expect(service.categoryBreadcrumbConfig()?.items.map(item => item.label)).toEqual([
                'testPage.categories.root',
                'Electronics'
            ]);
        });

        it('should show only the translated trash label, not the catalog path, while the trash view is active', () => {
            loadCategoryPath.mockReturnValue(of([{ id: 'cat-1', name: 'Electronics' }]));
            service.init(buildCategoryConfig({ useTrash: true }));
            service.openCategory({ id: 'cat-1' });

            service.setViewMode(PageViewMode.Trash);

            const breadcrumb = service.categoryBreadcrumbConfig();

            expect(breadcrumb?.items.map(item => item.label)).toEqual(['testPage.tabs.trash.label']);
            expect(breadcrumb?.items[0].isTranslationKey).toBe(true);
        });

        it('should restore the previous catalog path when switching back from trash to the table view', () => {
            loadCategoryPath.mockReturnValue(of([{ id: 'cat-1', name: 'Electronics' }]));
            service.init(buildCategoryConfig({ useTrash: true }));
            service.openCategory({ id: 'cat-1' });

            service.setViewMode(PageViewMode.Trash);
            service.setViewMode(PageViewMode.Table);

            expect(service.categoryBreadcrumbConfig()?.items.map(item => item.label)).toEqual([
                'testPage.categories.root',
                'Electronics'
            ]);
            expect(service.currentCategoryId()).toBe('cat-1');
        });
    });

    describe('viewToggleConfig', () => {
        it('should be null without a categories config', () => {
            service.init(new PageConfig({ baseUrl: '/items', page: 'testPage' }));

            expect(service.viewToggleConfig()).toBeNull();
        });

        it('should be null when the categories config does not enable trash', () => {
            service.init(buildCategoryConfig({ useTrash: false }));

            expect(service.viewToggleConfig()).toBeNull();
        });

        it('should expose a segmented two-tab toggle when trash is enabled', () => {
            service.init(buildCategoryConfig({ useTrash: true }));

            const toggle = service.viewToggleConfig() as TabsConfig;

            expect(toggle.variant).toBe(TabsVariant.Segmented);
            expect(toggle.tabs.map((tab: Tab) => tab.key)).toEqual([PageViewMode.Table, PageViewMode.Trash]);
            expect(toggle.activeTab).toBe(PageViewMode.Table);
        });

        it('should switch the view mode when the toggle changes tabs', () => {
            service.init(buildCategoryConfig({ useTrash: true }));

            const toggle = service.viewToggleConfig() as TabsConfig;

            toggle.onTabChange?.(PageViewMode.Trash);

            expect(service.viewMode()).toBe(PageViewMode.Trash);
        });
    });

    describe('remote category navigation via categoriesConfig.openCategory', () => {
        it('should navigate into the category when categoriesConfig emits $openCategory, from any caller', () => {
            loadCategoryPath.mockReturnValue(of([{ id: 'cat-1', name: 'Electronics' }]));
            const config = buildCategoryConfig();

            service.init(config);

            config.tableConfig?.categoriesConfig?.openCategory({ id: 'cat-1' });

            expect(service.currentCategoryId()).toBe('cat-1');
            expect(service.categoryBreadcrumbConfig()?.items.map(item => item.label)).toEqual([
                'testPage.categories.root',
                'Electronics'
            ]);
        });

        it('should stop reacting to $openCategory after the service is destroyed', () => {
            loadCategoryPath.mockReturnValue(of([{ id: 'cat-1', name: 'Electronics' }]));
            const config = buildCategoryConfig();

            service.init(config);
            service.ngOnDestroy();

            config.tableConfig?.categoriesConfig?.openCategory({ id: 'cat-1' });

            expect(service.currentCategoryId()).toBeNull();
        });

        it('should do nothing when there is no baseUrl to resolve the path against', () => {
            const config = buildCategoryConfig();

            config.baseUrl = undefined;
            service.init(config);

            service.openCategory({ id: 'cat-1' });

            expect(loadCategoryPath).not.toHaveBeenCalled();
            expect(service.currentCategoryId()).toBeNull();
        });
    });

    describe('buildActionsContext (via header action execution)', () => {
        it('should provide a context with the current category id and all callbacks', () => {
            const config = buildCategoryConfig({ withHeader: true });
            const action = new PageAction({
                key: PageStandardAction.DeleteCategory,
                scope: PageActionScope.Item,
                zone: PageActionZone.Left
            });

            loadCategoryPath.mockReturnValue(of([{ id: 'cat-1', name: 'Electronics' }]));

            const context = captureContext(service, buildHeaderActions, executeAction, config, action);

            service.openCategory({ id: 'cat-1' });

            expect(context.getCurrentCategoryId()).toBe('cat-1');
        });

        it('should clear the selection and reset pagination when onCategoryDeleted runs', () => {
            const config = buildCategoryConfig({ withHeader: true });
            const action = new PageAction({
                key: PageStandardAction.DeleteCategory,
                scope: PageActionScope.Item,
                zone: PageActionZone.Left
            });

            service.setSelected([{ id: 1 }]);

            const context = captureContext(service, buildHeaderActions, executeAction, config, action);

            context.onCategoryDeleted();

            expect(service.selected()).toEqual([]);
            expect(service.pageSearch().page).toBe(1);
        });

        it('should clear the selection when onTrashItemDeleted runs', () => {
            const config = buildCategoryConfig({ withHeader: true });
            const action = new PageAction({
                key: PageStandardAction.DeleteTrashItem,
                scope: PageActionScope.Item,
                zone: PageActionZone.Left
            });

            service.setSelected([{ id: 1 }]);

            const context = captureContext(service, buildHeaderActions, executeAction, config, action);

            context.onTrashItemDeleted();

            expect(service.selected()).toEqual([]);
        });
    });
});

function captureContext(
    service: PageService,
    buildHeaderActionsMock: jest.Mock,
    executeActionMock: jest.Mock,
    config: PageConfig,
    action: PageAction
): PageActionsContext {
    service.init(config);
    service.headerConfig();

    const execute = buildHeaderActionsMock.mock.calls[0][2] as (action: PageAction) => void;

    execute(action);

    return executeActionMock.mock.calls[0][1] as PageActionsContext;
}

function buildResponse(overrides?: Partial<PageBackendResponse>): PageBackendResponse {
    return { globalActions: [], results: [], ...overrides };
}

function buildCategoryConfig(options?: { useTrash?: boolean; withHeader?: boolean }): PageConfig {
    return new PageConfig({
        baseUrl: '/items',
        headerConfig: options?.withHeader ? new PageHeaderConfig({ actions: [] }) : undefined,
        page: 'testPage',
        tableConfig: new PageTableConfig({
            categoriesConfig: new PageCategoriesConfig({ useTrash: options?.useTrash ?? false }),
            columns: [],
            loadRow: () => []
        })
    });
}
