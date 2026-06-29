import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LinkTableCell } from '../../models/table-cell.model';
import { TableCellComponent } from './cell.component';

describe('TableCellComponent', () => {
    let component: TableCellComponent;
    let fixture: ComponentFixture<TableCellComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TableCellComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(TableCellComponent);
        component = fixture.componentInstance;
        component.cell = new LinkTableCell({
            action: jest.fn(),
            content: 'View details'
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should execute link action', () => {
        const actionSpy = jest.spyOn(component.linkCell, 'action');

        component.onLinkClick(new MouseEvent('click'));

        expect(actionSpy).toHaveBeenCalled();
    });
});