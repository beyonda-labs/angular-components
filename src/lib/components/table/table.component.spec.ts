import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { TableColumn, TableConfig } from './models/table.model';
import { TextTableCell } from './models/table-cell.model';
import { TableComponent } from './table.component';

describe('TableComponent', () => {
    let component: TableComponent;
    let fixture: ComponentFixture<TableComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TableComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(TableComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        expect(component).toBeTruthy();
    });

    it('should build rows from config items', () => {
        component.config = buildConfig();

        expect(component.rows).toHaveLength(2);
    });

    it('should refresh rows when config emits load event', () => {
        const config = buildConfig();

        component.config = config;
        config.items = [...config.items, { id: 3, name: 'Grace', role: 'Ops' }];
        config.refresh();

        expect(component.rows).toHaveLength(3);
    });

    it('should reset scroll position to top when the config changes (e.g. a new page)', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const scrollElement = fixture.nativeElement.querySelector('.bey-table-scroll') as HTMLDivElement;
        scrollElement.scrollTop = 120;

        component.config = buildConfig({ items: [{ id: 3, name: 'Grace', role: 'Ops' }] });
        fixture.detectChanges();

        expect(scrollElement.scrollTop).toBe(0);
    });

    it('should reset scroll position to top when config emits a load/refresh event', () => {
        const config = buildConfig();

        component.config = config;
        fixture.detectChanges();

        const scrollElement = fixture.nativeElement.querySelector('.bey-table-scroll') as HTMLDivElement;
        scrollElement.scrollTop = 80;

        config.refresh();

        expect(scrollElement.scrollTop).toBe(0);
    });

    it('should emit selected items on row selection', () => {
        const selectedItemsChange = jest.fn();

        component.config = buildConfig({ selectedItemsChange });
        component.onRowSelectionChange(0, true);

        expect(selectedItemsChange).toHaveBeenCalledWith([{ id: 1, name: 'Ada', role: 'Lead' }], [0]);
    });
});

function buildConfig(parameters?: Partial<TableConfig>): TableConfig {
    const config = new TableConfig({
        columns: [new TableColumn({ key: 'name', width: 2 }), new TableColumn({ key: 'role', width: 1 })],
        items: [
            { id: 1, name: 'Ada', role: 'Lead' },
            { id: 2, name: 'Linus', role: 'Research' }
        ],
        loadRow: item => [
            new TextTableCell({ content: String(item['name'] ?? '') }),
            new TextTableCell({ content: String(item['role'] ?? '') })
        ],
        prefix: 'test.table',
        selectedItemsChange: parameters?.selectedItemsChange,
        selectable: parameters?.selectable
    });

    if (parameters?.items) {
        config.items = parameters.items;
    }

    return config;
}
