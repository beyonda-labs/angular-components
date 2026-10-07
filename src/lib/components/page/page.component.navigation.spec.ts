import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName } from '@testing/dom';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';

import { SearchField, SearchFieldType } from '../search/models/search.model';
import { TableColumn } from '../table/models/table.model';
import { TextTableCell } from '../table/models/table-cell.model';
import { PageBackendResponse, PageConfig } from './models/page.model';
import { PageCategoriesConfig, PageItemType } from './models/page-categories.model';
import { PageItem } from './models/page-item.model';
import { PageSearch } from './models/page-search.model';
import { PageTableConfig, PageTableSearchConfig } from './models/page-table.model';
import { PageComponent } from './page.component';
import { PageActionsService } from './services/page-actions.service';
import { PageHttpService } from './services/page-http.service';

interface Person extends PageItem {
    name: string;

    type?: PageItemType;
}

const SEARCH_DEBOUNCE_MS = 350;
const STAFF: Person = { id: 'staff', name: 'Staff', type: PageItemType.Category };

function buildResponse(results: Person[]): PageBackendResponse<Person> {
    return { globalActions: [], results, search: { filters: [], page: 1, size: 25, total: results.length } };
}

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
            categoriesConfig: new PageCategoriesConfig({}),
            columns: [new TableColumn({ key: 'name' })],
            loadRow: person => [new TextTableCell({ content: person.name })],
            search: new PageTableSearchConfig({
                fields: [new SearchField({ key: 'name', type: SearchFieldType.Text })],
                mainField: 'name'
            })
        })
    });
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bey-test-elsewhere',
    standalone: true,
    template: '<p>Elsewhere</p>'
})
class ElsewhereComponent {}

describe('PageComponent — coming back from another route', () => {
    let harness: RouterTestingHarness;
    let pageHttpService: MockProxy<PageHttpService>;

    function element(): HTMLElement {
        return harness.routeNativeElement as HTMLElement;
    }

    function searchBox(): HTMLInputElement {
        return element().querySelector('[role="searchbox"]') as HTMLInputElement;
    }

    function breadcrumb(): string {
        return element().querySelector('nav')?.textContent ?? '';
    }

    function lastQuery(): Record<string, string | number> {
        return pageHttpService.load.mock.calls.at(-1)?.[1] ?? {};
    }

    function lastSearch(): PageSearch {
        return JSON.parse(atob(String(lastQuery()['search']))) as PageSearch;
    }

    async function openStaffAndSearch(term: string): Promise<void> {
        buttonByName(element(), 'Staff').click();
        harness.detectChanges();
        searchBox().value = term;
        searchBox().dispatchEvent(new Event('input'));
        await new Promise(resolve => {
            setTimeout(resolve, SEARCH_DEBOUNCE_MS);
        });
        harness.detectChanges();
    }

    beforeEach(async () => {
        const pageActionsService = mock<PageActionsService>();
        pageActionsService.filterVisibleActions.mockReturnValue([]);
        pageActionsService.buildHeaderActions.mockReturnValue([]);
        pageHttpService = mock<PageHttpService>();
        pageHttpService.load.mockReturnValue(of(buildResponse([STAFF, { id: 1, name: 'Ada' }])));
        pageHttpService.loadCategoryPath.mockReturnValue(of([STAFF]));

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            providers: [
                provideRouter([
                    { path: 'people', component: PeopleComponent },
                    { path: 'people/:id', component: ElsewhereComponent },
                    { path: 'other', component: ElsewhereComponent }
                ]),
                { provide: PageActionsService, useValue: pageActionsService },
                { provide: PageHttpService, useValue: pageHttpService }
            ]
        });

        harness = await RouterTestingHarness.create('/people');
    });

    it('comes back from a route under the page in the folder and with the search it was left with', async () => {
        await openStaffAndSearch('ada');

        await harness.navigateByUrl('/people/1');
        await harness.navigateByUrl('/people');

        expect(breadcrumb()).toContain('Staff');
        expect(searchBox().value).toBe('ada');
        expect(lastQuery()['parentId']).toBe('staff');
        expect(lastSearch().filters).toEqual([expect.objectContaining({ field: 'name', value: 'ada' })]);
    });

    it('starts afresh after the user went to a route outside the page', async () => {
        await openStaffAndSearch('ada');

        await harness.navigateByUrl('/people/1');
        await harness.navigateByUrl('/other');
        await harness.navigateByUrl('/people');

        expect(breadcrumb()).not.toContain('Staff');
        expect(searchBox().value).toBe('');
        expect(lastQuery()['parentId']).toBe('null');
        expect(lastSearch().filters).toEqual([]);
    });
});
