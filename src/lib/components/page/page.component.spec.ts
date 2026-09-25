import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';

import { TableColumn } from '../table/models/table.model';
import { TextTableCell } from '../table/models/table-cell.model';
import { PageBackendResponse, PageConfig, PageConfigParameters } from './models/page.model';
import { PageItem } from './models/page-item.model';
import { PageTableConfig, PageTableSearchConfig } from './models/page-table.model';
import { PageComponent } from './page.component';
import { PageActionsService } from './services/page-actions.service';
import { PageHttpService } from './services/page-http.service';

interface Person extends PageItem {
    name: string;
}

const PEOPLE: Person[] = [
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Grace' }
];

function buildResponse(results: Person[] = PEOPLE, total = results.length): PageBackendResponse {
    return { globalActions: [], results, search: { filters: [], page: 1, size: 25, total } };
}

describe('PageComponent', () => {
    let fixture: ComponentFixture<PageComponent>;
    let pageHttpService: MockProxy<PageHttpService>;

    function buildConfig(overrides: Partial<PageConfigParameters> = {}): PageConfig {
        return new PageConfig({
            baseUrl: '/people',
            prefix: 'demo',
            tableConfig: new PageTableConfig({
                columns: [new TableColumn({ key: 'name' })],
                loadRow: item => [new TextTableCell({ content: (item as Person).name })]
            }),
            ...overrides
        });
    }

    async function render(config: PageConfig = buildConfig()): Promise<void> {
        fixture = TestBed.createComponent(PageComponent);
        fixture.componentRef.setInput('config', config);
        await settle();
    }

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
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
        await settle();

        expect(text()).toContain('Linus');
        expect(text()).not.toContain('Ada');
    });
});
