import { Location } from '@angular/common';
import { provideLocationMocks, SpyLocation } from '@angular/common/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { mock, MockProxy } from 'jest-mock-extended';
import { Observable, Subject, Subscription, throwError } from 'rxjs';

import { PageConfig } from '../models/page.model';
import { PageCategoriesConfig, PageItemType, PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PAGE_INITIAL_SEARCH, SearchSortDirection } from '../models/page-search.model';
import { PageState } from '../models/page-state.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageView } from '../models/page-view.model';
import { PageHttpService } from './page-http.service';
import { PageLinkService } from './page-link.service';

interface Person extends PageItem {
    title: string;
    type: PageItemType;
}

const ORDER = { direction: SearchSortDirection.Asc, field: 'title' };
const SPECS: Person = { id: 'specs', title: 'Specs', type: PageItemType.Category };
const STAFF: Person = { id: 'staff', title: 'Staff', type: PageItemType.Category };

function buildConfig(): PageConfig {
    return new PageConfig({
        baseUrl: '/people',
        prefix: 'demo',
        tableConfig: new PageTableConfig({
            categoriesConfig: new PageCategoriesConfig({ nameField: 'title' }),
            columns: [],
            isSharedEnabled: true,
            isTrashEnabled: true,
            loadRow: () => [],
            order: ORDER
        }),
        views: [new PageView({ filters: [], key: 'staff' })]
    });
}

function buildState(overrides: Partial<PageState> = {}): PageState {
    return {
        categoryPath: [],
        currentCategoryId: null,
        search: { ...PAGE_INITIAL_SEARCH, sort: ORDER },
        selected: [],
        sort: null,
        view: null,
        viewMode: PageViewMode.Table,
        ...overrides
    };
}

describe('PageLinkService', () => {
    let location: SpyLocation;
    let pageHttpService: MockProxy<PageHttpService>;
    let path: Subject<PageItem[]>;
    let router: Router;
    let service: PageLinkService;
    let states: PageState[];
    let subscription: Subscription;

    async function open(url: string): Promise<void> {
        await router.navigateByUrl(url);
        await settle();
    }

    async function settle(): Promise<void> {
        await TestBed.inject(ApplicationRef).whenStable();
    }

    function watch(config: PageConfig | null = buildConfig()): void {
        subscription = service.watch(() => config).subscribe(state => states.push(state));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                PageLinkService,
                provideLocationMocks(),
                provideRouter([{ path: '**', children: [] }]),
                { provide: PageHttpService, useValue: mock<PageHttpService>() }
            ]
        });

        location = TestBed.inject(Location) as SpyLocation;
        pageHttpService = TestBed.inject(PageHttpService) as MockProxy<PageHttpService>;
        path = new Subject<PageItem[]>();
        pageHttpService.loadCategoryPathQuietly.mockReturnValue(path);
        router = TestBed.inject(Router);
        states = [];

        await router.navigateByUrl('/people');
        service = TestBed.inject(PageLinkService);
    });

    afterEach(() => {
        subscription.unsubscribe();
    });

    it('does nothing while the URL carries no view nor folder', async () => {
        watch();
        await open('/people?tab=x');

        service.follow(buildConfig());

        expect(states).toEqual([]);
        expect(location.path()).toBe('/people?tab=x');
    });

    it('opens the view a link names, sorted as the table is, and drops the link from the URL in place', async () => {
        watch(null);
        await open('/people?view=trash&tab=x');

        service.follow(buildConfig());
        await settle();

        expect(states).toEqual([buildState({ viewMode: PageViewMode.Trash })]);
        expect(location.urlChanges.slice(-2)).toEqual(['/people?view=trash&tab=x', 'replace: /people?tab=x']);
    });

    it('follows a link on every navigation to the page while it watches', async () => {
        watch();

        await open('/people?view=staff');

        expect(states).toEqual([buildState({ view: 'staff' })]);
    });

    it('stays pending until the path of a linked folder answers, then opens that folder', async () => {
        watch();
        await open('/people?view=shared&folder=staff');

        expect(service.isPending()).toBe(true);
        expect(pageHttpService.loadCategoryPathQuietly).toHaveBeenCalledWith('/people', 'staff');

        path.next([SPECS, STAFF]);

        expect(service.isPending()).toBe(false);
        expect(states.at(-1)).toEqual(
            buildState({
                categoryPath: [
                    { id: 'specs', label: 'Specs' },
                    { id: 'staff', label: 'Staff' }
                ],
                currentCategoryId: 'staff',
                viewMode: PageViewMode.Shared
            })
        );
    });

    it('opens the root of the view when the path does not lead to the linked folder', async () => {
        watch();
        await open('/people?folder=staff');

        path.next([SPECS]);

        expect(service.isPending()).toBe(false);
        expect(states.at(-1)).toEqual(buildState());
    });

    it('opens the root of the view when the path of the linked folder fails', async () => {
        pageHttpService.loadCategoryPathQuietly.mockReturnValue(
            throwError(() => new Error('not found')) as Observable<PageItem[]>
        );
        watch();
        await open('/people?folder=gone');

        expect(service.isPending()).toBe(false);
        expect(states.at(-1)).toEqual(buildState());
    });

    it('ignores a link once the user is on another page', async () => {
        watch(null);
        await open('/other?view=trash');

        service.follow(buildConfig());

        expect(states).toEqual([]);
        expect(location.path()).toBe('/other?view=trash');
    });
});
