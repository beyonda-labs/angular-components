import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';
import { of, Subject } from 'rxjs';

import { SearchField, SearchFieldType } from '../../search/models/search.model';
import { SearchFilterOperator, StringFilter } from '../../search/models/search-filter.model';
import { TextTableCell } from '../../table/models/table-cell.model';
import { PageBackendResponse, PageConfig, PageConfigParameters } from '../models/page.model';
import { PageCategoriesConfig, PageItemType, PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageSearch } from '../models/page-search.model';
import { PageTableConfig, PageTableSearchConfig } from '../models/page-table.model';
import { PageView } from '../models/page-view.model';
import { PageService } from './page.service';
import { PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';
import { PageOrganizationsService } from './page-organizations.service';
import { PageOwnersService } from './page-owners.service';

interface Template extends PageItem {
    name: string;

    parentPath?: string[];
    type?: PageItemType;
}

const BLOCK_FILTER = new StringFilter({
    field: 'blockType',
    operator: SearchFilterOperator.NotEquals,
    value: 'template'
});
const BLOCKS = new PageView({ filters: [BLOCK_FILTER], key: 'blocks' });
const NAME_FILTER = new StringFilter({ field: 'name', operator: SearchFilterOperator.Contains, value: 'off' });
const OFFER: Template = { id: 1, name: 'Offer' };

function buildResponse(results: Template[] = [OFFER], total = results.length): PageBackendResponse {
    return { globalActions: [], results, search: { filters: [], page: 1, size: 25, total } };
}

function decodeSearch(query: Record<string, string | number>): PageSearch {
    return JSON.parse(atob(String(query['search']))) as PageSearch;
}

describe('PageService — views, counts and origins', () => {
    let service: PageService;
    let pageHttpService: MockProxy<PageHttpService>;

    function buildConfig(
        overrides: Partial<PageConfigParameters<unknown, Template>> = {}
    ): PageConfig<unknown, Template> {
        return new PageConfig<unknown, Template>({
            baseUrl: '/templates',
            prefix: 'demo',
            tableConfig: new PageTableConfig<Template>({
                categoriesConfig: new PageCategoriesConfig({}),
                columns: [],
                isTrashEnabled: true,
                loadRow: template => [new TextTableCell({ content: template.name, tooltip: template.name })],
                search: new PageTableSearchConfig({
                    fields: [new SearchField({ key: 'name', type: SearchFieldType.Text })],
                    mainField: 'name'
                })
            }),
            views: [BLOCKS],
            ...overrides
        });
    }

    function lastListSearch(): PageSearch {
        return decodeSearch(pageHttpService.load.mock.calls.at(-1)?.[1] ?? {});
    }

    function lastBreadcrumbItem(): { detail?: string; detailParameters?: Record<string, unknown>; label: string } {
        const items = service.categoryBreadcrumbConfig()?.items ?? [];

        return items[items.length - 1];
    }

    function flush(): void {
        TestBed.flushEffects();
    }

    beforeEach(() => {
        const pageActionsService = mock<PageActionsService>();
        pageActionsService.filterVisibleActions.mockReturnValue([]);
        pageActionsService.buildHeaderActions.mockReturnValue([]);
        pageHttpService = mock<PageHttpService>();
        pageHttpService.load.mockReturnValue(of(buildResponse()));
        pageHttpService.loadTrash.mockReturnValue(of(buildResponse()));

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

    describe('views', () => {
        it('offers each view as a tab between the main one and the trash, labelled from its key', () => {
            service.setConfig(buildConfig());
            flush();

            expect(service.viewToggleConfig()?.tabs.map(({ key, label }) => ({ key, label }))).toEqual([
                { key: 'table', label: 'table.label' },
                { key: 'blocks', label: 'blocks.label' },
                { key: 'trash', label: 'trash.label' }
            ]);
            expect(service.viewToggleConfig()?.activeTab).toBe('table');
        });

        it('offers the views without a trash, and no tabs without either', () => {
            const tableConfig = new PageTableConfig<Template>({ columns: [], loadRow: () => [] });
            service.setConfig(buildConfig({ tableConfig }));
            flush();

            expect(service.viewToggleConfig()?.tabs.map(tab => tab.key)).toEqual(['table', 'blocks']);

            service.setConfig(buildConfig({ tableConfig, views: [] }));

            expect(service.viewToggleConfig()).toBeNull();
        });

        it('lists a view with its filters before those of the user, and drops them in the trash and the main tab', () => {
            service.setConfig(buildConfig());
            flush();

            service.viewToggleConfig()?.onTabChange?.('blocks');
            flush();
            expect(lastListSearch().filters).toEqual([BLOCK_FILTER]);
            expect(service.viewToggleConfig()?.activeTab).toBe('blocks');
            expect(service.handle.viewMode()).toBe(PageViewMode.Table);

            service.searchConfig()?.onFiltersChange?.([NAME_FILTER]);
            flush();
            expect(lastListSearch().filters).toEqual([BLOCK_FILTER, NAME_FILTER]);

            service.viewToggleConfig()?.onTabChange?.(PageViewMode.Trash);
            flush();
            expect(decodeSearch(pageHttpService.loadTrash.mock.calls.at(-1)?.[1] ?? {}).filters).toEqual([NAME_FILTER]);

            service.viewToggleConfig()?.onTabChange?.(PageViewMode.Table);
            flush();
            expect(lastListSearch().filters).toEqual([NAME_FILTER]);
        });

        it('sends the filters of a view on a page without a search of its own', () => {
            service.setConfig(
                buildConfig({ tableConfig: new PageTableConfig<Template>({ columns: [], loadRow: () => [] }) })
            );
            flush();
            expect(pageHttpService.load.mock.calls.at(-1)?.[1]).toEqual({});

            service.selectTab('blocks');
            flush();

            expect(lastListSearch().filters).toEqual([BLOCK_FILTER]);
        });
    });

    describe('folder count', () => {
        it('counts the rows of the folder on the last node of the breadcrumb, once the folder has answered', () => {
            const folder = new Subject<PageBackendResponse>();
            pageHttpService.load.mockReturnValueOnce(of(buildResponse([OFFER], 12))).mockReturnValueOnce(folder);
            pageHttpService.loadCategoryPath.mockReturnValue(of([{ id: 'clients', name: 'Clients' } as never]));
            service.setConfig(buildConfig());
            flush();

            expect(lastBreadcrumbItem()).toEqual(
                expect.objectContaining({
                    detail: 'angular-components.page.count.many',
                    detailParameters: { count: 12 },
                    label: 'demo.categories.root'
                })
            );

            service.openCategory({ id: 'clients' });
            flush();
            expect(lastBreadcrumbItem().label).toBe('Clients');
            expect(lastBreadcrumbItem().detail).toBeUndefined();

            folder.next(buildResponse([OFFER], 1));
            folder.complete();

            expect(lastBreadcrumbItem()).toEqual(
                expect.objectContaining({ detail: 'angular-components.page.count.one', detailParameters: { count: 1 } })
            );
        });

        it('counts the rows of the trash on its node', () => {
            pageHttpService.loadTrash.mockReturnValue(of(buildResponse([OFFER], 3)));
            service.setConfig(buildConfig());
            flush();

            service.selectTab(PageViewMode.Trash);
            flush();

            expect(lastBreadcrumbItem()).toEqual(
                expect.objectContaining({ detailParameters: { count: 3 }, label: 'demo.tabs.trash.label' })
            );
        });
    });

    describe('trash origin', () => {
        beforeEach(() => {
            const translateService = TestBed.inject(TranslateService);

            translateService.setTranslation('en', { demo: { categories: { root: 'All templates' } } });
            translateService.use('en');
        });

        it('names on the first cell of a trashed row the folder a restore puts it back in', () => {
            const trashed: Template = { id: 2, name: 'Offer', parentPath: ['Clients', '2026'] };
            const folder: Template = { id: 'f', name: 'Old', parentPath: [], type: PageItemType.Category };
            pageHttpService.loadTrash.mockReturnValue(of(buildResponse([trashed, folder])));
            service.setConfig(buildConfig());
            flush();

            service.selectTab(PageViewMode.Trash);
            flush();
            const tableConfig = service.tableConfig();

            expect(tableConfig?.loadRow(trashed)[0].tooltip).toBe('All templates / Clients / 2026');
            expect(tableConfig?.loadRow(folder)[0].tooltip).toBe('All templates');
        });

        it('leaves the cells of the list and of a row without a path as the page draws them', () => {
            const trashed: Template = { id: 2, name: 'Offer', parentPath: ['Clients'] };
            service.setConfig(buildConfig());
            flush();

            expect(service.tableConfig()?.loadRow(trashed)[0].tooltip).toBe('Offer');

            service.selectTab(PageViewMode.Trash);
            flush();

            expect(service.tableConfig()?.loadRow(OFFER)[0].tooltip).toBe('Offer');
        });
    });
});
