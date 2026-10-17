import { TestBed } from '@angular/core/testing';
import { decodePageSearch } from '@testing/page-search';
import { mock, MockProxy } from 'jest-mock-extended';
import { firstValueFrom, of, Subject } from 'rxjs';

import { SearchFilterOperator, StringFilter } from '../../search/models/search-filter.model';
import { TableSortDirection } from '../../table/models/table.model';
import { PageBackendResponse, PageConfig } from '../models/page.model';
import { PageCategoriesConfig, PageViewMode } from '../models/page-categories.model';
import { PAGE_INITIAL_SEARCH, SearchSortDirection } from '../models/page-search.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageView } from '../models/page-view.model';
import { PageHttpService } from './page-http.service';
import { PageListService } from './page-list.service';
import { PageViewService } from './page-view.service';

const BLOCKS = new StringFilter({ field: 'kind', operator: SearchFilterOperator.Equals, value: 'block' });
const CONFIG = new PageConfig({
    baseUrl: '/items',
    prefix: 'demo',
    tableConfig: new PageTableConfig({
        categoriesConfig: new PageCategoriesConfig({}),
        columns: [],
        loadRow: () => []
    }),
    views: [new PageView({ filters: [BLOCKS], key: 'blocks' })]
});
const RESPONSE: PageBackendResponse = {
    globalActions: ['create'],
    results: [{ id: 1 }, { id: 2 }],
    search: { categoryTotal: 1, filters: [], page: 1, size: 25, total: 7 }
};

describe('PageListService', () => {
    let pageHttpService: MockProxy<PageHttpService>;
    let service: PageListService;
    let view: PageViewService;

    function load(config = CONFIG): Promise<PageBackendResponse> {
        return firstValueFrom(service.load(config, service.search()));
    }

    beforeEach(() => {
        pageHttpService = mock<PageHttpService>();
        pageHttpService.load.mockReturnValue(of(RESPONSE));
        pageHttpService.loadShared.mockReturnValue(of(RESPONSE));
        pageHttpService.loadTrash.mockReturnValue(of(RESPONSE));
        TestBed.configureTestingModule({
            providers: [PageListService, PageViewService, { provide: PageHttpService, useValue: pageHttpService }]
        });
        service = TestBed.inject(PageListService);
        view = TestBed.inject(PageViewService);
    });

    it('lists the open folder and keeps what the list answered, with the count of the folder it counted', async () => {
        view.enterCategory([{ id: 'clients', label: 'Clients' }], 'clients', null);

        await load();
        const counted = service.folderCount();
        view.goUpTo(0);

        expect(pageHttpService.load).toHaveBeenCalledWith('/items', { parentId: 'clients' });
        expect([service.items(), service.totalItems(), service.globalActions()]).toEqual([
            RESPONSE.results,
            7,
            ['create']
        ]);
        expect(counted).toEqual({ categoryTotal: 1, location: 'table:clients', total: 7 });
        expect(service.folderCount()).toBeNull();
    });

    it('asks the trash and the root of the shared tab without a folder, and the shared folders apart', async () => {
        view.setViewMode(PageViewMode.Trash);
        await load();
        view.setViewMode(PageViewMode.Shared);
        await load();

        expect(pageHttpService.loadTrash).toHaveBeenCalledWith('/items', {});
        expect(pageHttpService.loadShared).toHaveBeenCalledWith('/items', {});
    });

    it('sends the filters of the open view before those of the user, and remembers the search it sent', async () => {
        const name = new StringFilter({ field: 'name', value: 'ada' });
        view.selectView(CONFIG.views[0], PageViewMode.Table);
        service.setFilters([name]);

        await load();
        const [, query] = pageHttpService.load.mock.calls[0];

        expect(decodePageSearch(String(query['search'])).filters).toEqual([BLOCKS, name]);
        expect(service.sentSearch().filters).toEqual([BLOCKS, name]);
    });

    it('asks a view with a list URL of its own there, with its filters and without the folder', async () => {
        const queue = new PageView({ baseUrl: '/items/queue', filters: [BLOCKS], key: 'queue' });
        view.enterCategory([{ id: 'clients', label: 'Clients' }], 'clients', null);
        view.selectView(queue, PageViewMode.Table);

        await load(new PageConfig({ ...CONFIG, views: [queue] }));
        const [url, query] = pageHttpService.load.mock.calls[0];

        expect(url).toBe('/items/queue');
        expect(query['parentId']).toBeUndefined();
        expect(decodePageSearch(String(query['search'])).filters).toEqual([BLOCKS]);
    });

    it('loads until the list answers', () => {
        const answer = new Subject<PageBackendResponse>();
        pageHttpService.load.mockReturnValue(answer);

        service.load(CONFIG, service.search()).subscribe();
        const whileAsking = service.isLoading();
        answer.next(RESPONSE);
        answer.complete();

        expect([whileAsking, service.isLoading()]).toEqual([true, false]);
    });

    it('goes back to the first page on new filters, a new page size or a sort, and to the order without a sort', () => {
        const order = { direction: SearchSortDirection.Asc, field: 'name' };
        service.setPage(3);
        const onPage = service.search().page;
        service.setPageSize(50);
        const resized = service.search();
        service.setPage(2);
        service.setSort({ direction: TableSortDirection.Desc, field: 'updatedAt' }, order);
        const sorted = [service.search().page, service.search().sort, service.sort()];
        service.setSort(null, order);

        expect(onPage).toBe(3);
        expect(resized).toEqual({ ...PAGE_INITIAL_SEARCH, size: 50 });
        expect(sorted).toEqual([
            1,
            { direction: SearchSortDirection.Desc, field: 'updatedAt' },
            { direction: TableSortDirection.Desc, field: 'updatedAt' }
        ]);
        expect([service.search().sort, service.sort()]).toEqual([order, null]);
    });

    it('sends nothing without a base url', async () => {
        await expect(
            firstValueFrom(service.load(new PageConfig({ prefix: 'demo' }), service.search()), { defaultValue: null })
        ).resolves.toBeNull();

        expect(pageHttpService.load).not.toHaveBeenCalled();
    });
});
