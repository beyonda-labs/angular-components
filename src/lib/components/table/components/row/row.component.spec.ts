import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { TableColumn, TableConfig, TableRow } from '../../models/table.model';
import { TextTableCell } from '../../models/table-cell.model';
import { TableRowComponent } from './row.component';

describe('TableRowComponent', () => {
    let component: TableRowComponent;
    let fixture: ComponentFixture<TableRowComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TableRowComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(TableRowComponent);
        component = fixture.componentInstance;
        component.config = new TableConfig({
            columns: [new TableColumn({ key: 'name' })],
            loadRow: item => [new TextTableCell({ content: String(item['name'] ?? '') })],
            prefix: 'test.table'
        });
        component.gridTemplateColumns = 'minmax(0, 1fr)';
        component.row = new TableRow({
            cells: [new TextTableCell({ content: 'Ada' })],
            content: { name: 'Ada' }
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit selected state on row click', () => {
        const selectionSpy = jest.spyOn(component.selectionChange, 'emit');

        component.onRowClick();

        expect(selectionSpy).toHaveBeenCalledWith(true);
    });
});
