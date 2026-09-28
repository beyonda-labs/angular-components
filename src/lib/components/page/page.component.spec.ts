import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, renderComponent, settle } from '@testing/dom';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';

import { TableColumn } from '../table/models/table.model';
import { TableCell, TextTableCell } from '../table/models/table-cell.model';
import { PageBackendResponse, PageConfig, PageConfigParameters } from './models/page.model';
import { PageCategoriesConfig, PageItemType, PageViewMode } from './models/page-categories.model';
import { PageItem } from './models/page-item.model';
import { PageTableConfig, PageTableSearchConfig } from './models/page-table.model';
import { PageComponent } from './page.component';
import { PageActionsService } from './services/page-actions.service';
import { PageHttpService } from './services/page-http.service';

interface Person extends PageItem {
    name: string;
}

interface Team extends PageItem {
    title: string;
    type: PageItemType;
}

const PEOPLE: Person[] = [
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Grace' }
];
const STAFF: Team = { id: 'staff', title: 'Staff', type: PageItemType.Category };

function buildResponse(
    results: (Person | Team)[] = PEOPLE,
    total = results.length
): PageBackendResponse<Person | Team> {
    return { globalActions: [], results, search: { filters: [], page: 1, size: 25, total } };
}

describe('PageComponent', () => {
    let fixture: ComponentFixture<PageComponent>;
    let pageHttpService: MockProxy<PageHttpService>;

    function buildConfig(overrides: Partial<PageConfigParameters<unknown, Person>> = {}): PageConfig<unknown, Person> {
        return new PageConfig<unknown, Person>({
            baseUrl: '/people',
            prefix: 'demo',
            tableConfig: new PageTableConfig({
                columns: [new TableColumn({ key: 'name' })],
                loadRow: person => [new TextTableCell({ content: person.name })]
            }),
            ...overrides
        });
    }

    function buildTeamsConfig(
        loadTeamRow?: (team: Team, viewMode: PageViewMode) => TableCell[]
    ): PageConfig<unknown, Person, Team> {
        return new PageConfig<unknown, Person, Team>({
            baseUrl: '/people',
            prefix: 'demo',
            tableConfig: new PageTableConfig({
                categoriesConfig: new PageCategoriesConfig({ loadRow: loadTeamRow, nameField: 'title' }),
                columns: [new TableColumn({ key: 'name' }), new TableColumn({ key: 'role' })],
                loadRow: person => [
                    new TextTableCell({ content: person.name }),
                    new TextTableCell({ content: 'Member' })
                ]
            })
        });
    }

    async function render(
        config: PageConfig<unknown, Person> | PageConfig<unknown, Person, Team> = buildConfig()
    ): Promise<void> {
        fixture = await renderComponent(PageComponent, { config });
    }

    function text(): string {
        return fixture.nativeElement.textContent;
    }

    beforeEach(async () => {
        const pageActionsService = mock<PageActionsService>();
        pageActionsService.filterVisibleActions.mockReturnValue([]);
        pageActionsService.buildHeaderActions.mockReturnValue([]);
        pageHttpService = mock<PageHttpService>();
        pageHttpService.load.mockReturnValue(of(buildResponse()));

        await TestBed.configureTestingModule({
            imports: [PageComponent, TranslateModule.forRoot()],
            providers: [
                { provide: PageActionsService, useValue: pageActionsService },
                { provide: PageHttpService, useValue: pageHttpService }
            ]
        }).compileComponents();
    });

    it('shows the rows the backend returns, with the headers from the prefix', async () => {
        await render();

        expect(text()).toContain('demo.table.columns.name');
        expect(text()).toContain('Ada');
        expect(text()).toContain('Grace');
        expect(fixture.nativeElement.querySelector('bey-pagination')).not.toBeNull();
    });

    it('shows the empty message and no paginator when the backend returns nothing', async () => {
        pageHttpService.load.mockReturnValue(of(buildResponse([])));
        await render();

        expect(text()).toContain('demo.table.empty');
        expect(fixture.nativeElement.querySelector('bey-pagination')).toBeNull();
    });

    it('offers the search when the table declares one', async () => {
        await render();
        expect(fixture.nativeElement.querySelector('bey-search')).toBeNull();

        await render(
            buildConfig({
                tableConfig: new PageTableConfig({
                    columns: [new TableColumn({ key: 'name' })],
                    loadRow: () => [],
                    search: new PageTableSearchConfig({ fields: [], mainField: 'name' })
                })
            })
        );
        expect(fixture.nativeElement.querySelector('bey-search')).not.toBeNull();
    });

    it('reloads from the handle the consumer receives', async () => {
        const onReady = jest.fn();
        await render(buildConfig({ onReady }));

        pageHttpService.load.mockReturnValue(of(buildResponse([{ id: 3, name: 'Linus' }])));
        onReady.mock.calls[0][0].refresh();
        await settle(fixture);

        expect(text()).toContain('Linus');
        expect(text()).not.toContain('Ada');
    });

    it('renders the category rows through the loadRow of the categories config', async () => {
        pageHttpService.load.mockReturnValue(of(buildResponse([STAFF, PEOPLE[0]])));
        await render(buildTeamsConfig(team => [new TextTableCell({ content: `Team ${team.title}` })]));

        expect(text()).toContain('Team Staff');
        expect(text()).toContain('Ada');
    });

    it('opens a category from the link its default row shows', async () => {
        pageHttpService.load.mockReturnValue(of(buildResponse([STAFF])));
        pageHttpService.loadCategoryPath.mockReturnValue(of([STAFF]));
        await render(buildTeamsConfig());

        buttonByName(fixture, 'Staff').click();
        await settle(fixture);

        expect(pageHttpService.load).toHaveBeenLastCalledWith('/people', { parentId: 'staff' });
    });
});
