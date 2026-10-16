import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { buttonByName, queryAll, queryButton, rowWith, settle } from '@testing/dom';
import { decodePageSearch } from '@testing/page-search';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { TableColumn } from '../table/models/table.model';
import { TextTableCell } from '../table/models/table-cell.model';
import { pageStandardAction } from './functions/page-standard-actions';
import { PageConfig } from './models/page.model';
import { PageStandardAction } from './models/page-action.model';
import { PageCategoriesConfig, PageItemType } from './models/page-categories.model';
import { PageHeaderConfig } from './models/page-header.model';
import { PageItem } from './models/page-item.model';
import { PageTableConfig, PageTableSearchConfig } from './models/page-table.model';
import { PageView } from './models/page-view.model';
import { PageComponent } from './page.component';

interface Template extends PageItem {
    name: string;
    parentId: string | null;
    type: PageItemType;
}

const API = 'https://api.test/api/templates';
const QUEUE_API = `${API}/review-queue`;
const QUEUE_TAB = 'demo.tabs.queue.label';
const CLIENTS: Template = {
    actions: [PageStandardAction.DeleteCategory, PageStandardAction.Move],
    id: 'clients',
    name: 'Clients',
    parentId: null,
    type: PageItemType.Category
};
const OFFER: Template = {
    actions: [PageStandardAction.Delete, PageStandardAction.Move],
    id: 'offer',
    name: 'Offer',
    parentId: 'clients',
    type: PageItemType.Item
};

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent],
    selector: 'bey-test-templates',
    standalone: true,
    template: '<bey-page [config]="config"></bey-page>'
})
class TemplatesComponent {
    readonly config = new PageConfig<unknown, Template>({
        baseUrl: '/templates',
        headerConfig: new PageHeaderConfig({
            actions: [
                pageStandardAction(PageStandardAction.CreateCategory),
                pageStandardAction(PageStandardAction.Move),
                pageStandardAction(PageStandardAction.Delete),
                pageStandardAction(PageStandardAction.DeleteCategory)
            ]
        }),
        prefix: 'demo',
        tableConfig: new PageTableConfig<Template>({
            categoriesConfig: new PageCategoriesConfig<Template>({}),
            columns: [new TableColumn({ key: 'name' })],
            loadRow: template => [new TextTableCell({ content: template.name })],
            search: new PageTableSearchConfig({ fields: [] })
        }),
        views: [new PageView({ baseUrl: '/templates/review-queue', filters: [], key: 'queue' })]
    });
}

describe('PageComponent — a view with a list URL of its own', () => {
    let harness: RouterTestingHarness;
    let httpTesting: HttpTestingController;

    function element(): HTMLElement {
        return harness.routeNativeElement as HTMLElement;
    }

    function breadcrumb(): string {
        return element().querySelector('[aria-label="angular-components.breadcrumb.label"]')?.textContent ?? '';
    }

    function selectedTab(): string {
        return element().querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() ?? '';
    }

    async function answerList(url: string, results: Template[], globalActions: string[] = []): Promise<TestRequest> {
        const request = httpTesting.expectOne(current => current.url === url && current.method === 'GET');

        request.flush({ globalActions, results, search: { filters: [], page: 1, size: 25, total: results.length } });
        await settle(harness.fixture);

        return request;
    }

    async function click(name: string): Promise<void> {
        buttonByName(element(), name).click();
        await settle(harness.fixture);
    }

    async function openClients(): Promise<void> {
        await harness.navigateByUrl('/templates');
        await settle(harness.fixture);
        await answerList(API, [CLIENTS]);
        await click('Clients');
        httpTesting.expectOne(`${API}/categories/clients/path`).flush([CLIENTS]);
        await settle(harness.fixture);
        await answerList(API, [OFFER]);
    }

    async function select(name: string): Promise<void> {
        queryAll<HTMLInputElement>(
            rowWith(element(), name),
            '[aria-label="angular-components.table.select-row"]'
        )[0].click();
        await settle(harness.fixture);
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting(),
                provideLocationMocks(),
                provideRouter([{ path: 'templates', component: TemplatesComponent }])
            ]
        });

        httpTesting = TestBed.inject(HttpTestingController);
        harness = await RouterTestingHarness.create('/');
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('asks the list at the URL of the view, with the search and without the folder the user is in', async () => {
        await openClients();

        await click(QUEUE_TAB);
        const list = await answerList(QUEUE_API, [OFFER]);

        expect(list.request.params.has('parentId')).toBe(false);
        expect(decodePageSearch(String(list.request.params.get('search')))).toEqual(
            expect.objectContaining({ filters: [], page: 1 })
        );
        expect(rowWith(element(), 'Offer')).toBeTruthy();
    });

    it('shows the view flat, its breadcrumb naming only the view, with no folder action nor drag', async () => {
        await openClients();

        await click(QUEUE_TAB);
        await answerList(QUEUE_API, [OFFER], [PageStandardAction.CreateCategory]);
        await select('Offer');
        buttonByName(element(), 'angular-components.header.menu').click();
        await settle(harness.fixture);

        expect(breadcrumb()).toContain(QUEUE_TAB);
        expect(breadcrumb()).not.toContain('Clients');
        expect(breadcrumb()).not.toContain('demo.categories.root');
        expect(queryButton(element(), 'demo.actions.create-category.label')).toBeNull();
        expect(queryButton(element(), 'demo.actions.move.label')).toBeNull();
        expect(queryButton(element(), 'demo.actions.delete.label')).not.toBeNull();
        expect(rowWith(element(), 'Offer').getAttribute('draggable')).toBeNull();
    });

    it('runs the actions of the rows against the URL of the page, then lists the view again', async () => {
        TestBed.inject(FakeModalService).setConfirmationAnswer(true);
        await openClients();
        await click(QUEUE_TAB);
        await answerList(QUEUE_API, [OFFER]);
        await select('Offer');
        buttonByName(element(), 'angular-components.header.menu').click();
        await settle(harness.fixture);

        await click('demo.actions.delete.label');
        const deletion = httpTesting.expectOne(current => current.url === API && current.method === 'DELETE');
        deletion.flush(null);
        await settle(harness.fixture);

        expect(deletion.request.body).toEqual({ ids: ['offer'] });
        expect((await answerList(QUEUE_API, [])).request.params.has('parentId')).toBe(false);
    });

    it('opens the view a link names at its own URL, ignoring the folder the link names', async () => {
        await harness.navigateByUrl('/templates?view=queue&folder=clients');
        await settle(harness.fixture);
        await answerList(QUEUE_API, [OFFER]);

        expect(selectedTab()).toBe(QUEUE_TAB);
        expect(httpTesting.match(`${API}/categories/clients/path`)).toEqual([]);
    });

    it('gives back the URL of the page and the folder the user was in on leaving the view', async () => {
        await openClients();
        await click(QUEUE_TAB);
        await answerList(QUEUE_API, [OFFER]);

        await click('demo.tabs.table.label');
        const list = await answerList(API, [OFFER]);

        expect(list.request.params.get('parentId')).toBe('clients');
        expect(breadcrumb()).toContain('Clients');
        expect(rowWith(element(), 'Offer').getAttribute('draggable')).toBe('true');
    });
});
