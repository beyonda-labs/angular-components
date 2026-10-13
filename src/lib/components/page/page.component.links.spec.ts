import { Location } from '@angular/common';
import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { provideLocationMocks, SpyLocation } from '@angular/common/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { buttonByName, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { SearchFilterOperator, StringFilter } from '../search/models/search-filter.model';
import { TableColumn } from '../table/models/table.model';
import { TextTableCell } from '../table/models/table-cell.model';
import { PageConfig } from './models/page.model';
import { PageCategoriesConfig, PageItemType } from './models/page-categories.model';
import { PageItem } from './models/page-item.model';
import { PageTableConfig } from './models/page-table.model';
import { PageView } from './models/page-view.model';
import { PageComponent } from './page.component';

interface Person extends PageItem {
    name: string;
    type: PageItemType;
}

const API = 'https://api.test/api/people';
const SPECS: Person = { id: 'specs', name: 'Specs', type: PageItemType.Category };
const DEEP: Person = { id: 'deep', name: 'Deep', type: PageItemType.Category };
const STAFF: Person = { id: 'staff', name: 'Staff', type: PageItemType.Category };
const SHARED_LABEL = 'angular-components.page.shared.label';
const STAFF_FILTER = new StringFilter({ field: 'role', operator: SearchFilterOperator.Equals, value: 'staff' });

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent],
    selector: 'bey-test-people',
    standalone: true,
    template: '<bey-page [config]="config"></bey-page>'
})
class PeopleComponent {
    readonly config = new PageConfig<unknown, Person>({
        baseUrl: '/people',
        prefix: 'demo',
        tableConfig: new PageTableConfig<Person>({
            categoriesConfig: new PageCategoriesConfig<Person>({}),
            columns: [new TableColumn({ key: 'name' })],
            isSharedEnabled: true,
            isTrashEnabled: true,
            loadRow: person => [new TextTableCell({ content: person.name })]
        }),
        views: [new PageView({ filters: [STAFF_FILTER], key: 'staff' })]
    });
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bey-test-elsewhere',
    standalone: true,
    template: '<p>Elsewhere</p>'
})
class ElsewhereComponent {}

describe('PageComponent — links', () => {
    let harness: RouterTestingHarness;
    let httpTesting: HttpTestingController;

    function element(): HTMLElement {
        return harness.routeNativeElement as HTMLElement;
    }

    function selectedTab(): string {
        return element().querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() ?? '';
    }

    function breadcrumb(): string {
        return element().querySelector('[aria-label="angular-components.breadcrumb.label"]')?.textContent ?? '';
    }

    function pendingLists(): TestRequest[] {
        return httpTesting.match(request => !request.url.includes('/categories/'));
    }

    function answerLists(results: Person[] = []): TestRequest[] {
        const requests = pendingLists();

        for (const request of requests) {
            request.flush({ globalActions: [], results, search: { filters: [], page: 1, size: 25, total: 0 } });
        }

        return requests;
    }

    function answerPath(folderId: string, path: Person[] | null): void {
        const request = httpTesting.expectOne(`${API}/categories/${folderId}/path`);

        if (path) {
            request.flush(path);
        } else {
            request.flush({ errorCode: 'not-found' }, { status: 404, statusText: 'Not Found' });
        }
    }

    async function open(url: string): Promise<void> {
        await harness.navigateByUrl(url);
        await settle(harness.fixture);
    }

    async function openWithFolder(url: string, folderId: string, path: Person[] | null): Promise<TestRequest[]> {
        await open(url);
        answerPath(folderId, path);
        await settle(harness.fixture);

        const lists = answerLists();
        await settle(harness.fixture);

        return lists;
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting(),
                provideLocationMocks(),
                provideRouter([
                    { path: 'people', component: PeopleComponent },
                    { path: 'people/:id', component: ElsewhereComponent },
                    { path: 'other', component: ElsewhereComponent }
                ])
            ]
        });

        httpTesting = TestBed.inject(HttpTestingController);
        harness = await RouterTestingHarness.create('/other');
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it.each([
        ['table', 'demo.tabs.table.label', API],
        ['staff', 'demo.tabs.staff.label', API],
        ['shared', SHARED_LABEL, `${API}/shared`],
        ['trash', 'demo.tabs.trash.label', `${API}/trash`]
    ])('opens the %s view a link names', async (view, tab, listUrl) => {
        await open(`/people?view=${view}`);

        expect(answerLists().map(request => request.request.url)).toEqual([listUrl]);
        await settle(harness.fixture);
        expect(selectedTab()).toBe(tab);
    });

    it('opens the folder a link names in the main view, with its breadcrumb, once its path is known', async () => {
        await open('/people?folder=staff');

        expect(pendingLists()).toEqual([]);

        answerPath('staff', [STAFF]);
        await settle(harness.fixture);
        const [list] = answerLists();
        await settle(harness.fixture);

        expect(list.request.url).toBe(API);
        expect(list.request.params.get('parentId')).toBe('staff');
        expect(selectedTab()).toBe('demo.tabs.table.label');
        expect(breadcrumb()).toContain('Staff');
    });

    it('opens a folder in the shared view, its breadcrumb starting at the shared folder the user reaches', async () => {
        const [list] = await openWithFolder('/people?view=shared&folder=deep', 'deep', [SPECS, DEEP]);

        expect(list.request.url).toBe(API);
        expect(list.request.params.get('parentId')).toBe('deep');
        expect(selectedTab()).toBe(SHARED_LABEL);
        expect(breadcrumb()).toContain('Specs');
        expect(breadcrumb()).toContain('Deep');
    });

    it('removes the link from the URL, replacing the entry in the history and keeping the other parameters', async () => {
        const location = TestBed.inject(Location) as SpyLocation;

        await open('/people?view=trash&tab=x');
        answerLists();

        expect(TestBed.inject(Router).url).toBe('/people?tab=x');
        expect(location.urlChanges.slice(-2)).toEqual(['/people?view=trash&tab=x', 'replace: /people?tab=x']);
    });

    it('falls back to the main view for a view the page does not have', async () => {
        await open('/people?view=nope');

        expect(answerLists().map(request => request.request.url)).toEqual([API]);
        await settle(harness.fixture);
        expect(selectedTab()).toBe('demo.tabs.table.label');
    });

    it('falls back quietly to the root of the view for a folder the user cannot reach', async () => {
        const [list] = await openWithFolder('/people?view=shared&folder=gone', 'gone', null);

        expect(list.request.url).toBe(`${API}/shared`);
        expect(selectedTab()).toBe(SHARED_LABEL);
        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
    });

    it('falls back to the root when the path the backend answers does not end at the folder', async () => {
        const [list] = await openWithFolder('/people?folder=deep', 'deep', [SPECS]);

        expect(list.request.params.get('parentId')).toBe('null');
        expect(breadcrumb()).not.toContain('Specs');
    });

    it('comes back with the state it was left in when the URL has no link', async () => {
        await open('/people');
        answerLists([STAFF]);
        await settle(harness.fixture);
        buttonByName(element(), 'Staff').click();
        answerPath('staff', [STAFF]);
        await settle(harness.fixture);
        answerLists();

        await harness.navigateByUrl('/people/1');
        await open('/people');

        expect(answerLists()[0].request.params.get('parentId')).toBe('staff');
        await settle(harness.fixture);
        expect(breadcrumb()).toContain('Staff');
    });

    it('opens what a link names instead of the state the page was left in', async () => {
        await open('/people');
        answerLists();
        await harness.navigateByUrl('/people/1');
        await open('/people?view=trash');

        expect(answerLists().map(request => request.request.url)).toEqual([`${API}/trash`]);
        await settle(harness.fixture);
        expect(selectedTab()).toBe('demo.tabs.trash.label');
    });

    it('follows a link to the page it is already showing', async () => {
        await open('/people');
        answerLists();

        const [list] = await openWithFolder('/people?view=shared&folder=staff', 'staff', [STAFF]);

        expect(list.request.params.get('parentId')).toBe('staff');
        expect(selectedTab()).toBe(SHARED_LABEL);
        expect(breadcrumb()).toContain('Staff');
        expect(TestBed.inject(Router).url).toBe('/people');
    });
});
