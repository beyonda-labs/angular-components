import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { BadgeTableCell, LinkTableCell } from '../../models/table-cell.model';
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

    it('should expose the cell as a BadgeTableCell through badgeCell', () => {
        component.cell = new BadgeTableCell({
            badges: [{ badgeClass: 'bg-success text-white', content: 'Active' }]
        });
        fixture.detectChanges();

        expect(component.badgeCell.badges).toEqual([{ badgeClass: 'bg-success text-white', content: 'Active' }]);
    });

    it('should render a single badge with its classes', () => {
        component.cell = new BadgeTableCell({
            badges: [{ badgeClass: 'bg-danger', content: 'Inactive' }]
        });
        fixture.detectChanges();

        const badges = fixture.nativeElement.querySelectorAll('.badge');

        expect(badges.length).toBe(1);
        expect(badges[0].classList.contains('bg-danger')).toBe(true);
        expect(badges[0].textContent.trim()).toBe('Inactive');
    });

    it('should render multiple badges in the same cell', () => {
        component.cell = new BadgeTableCell({
            badges: [
                { badgeClass: 'bg-primary', content: 'Frontend' },
                { badgeClass: 'bg-info text-dark', content: 'Backend' },
                { badgeClass: 'bg-secondary', content: 'DevOps' }
            ]
        });
        fixture.detectChanges();

        const badges = fixture.nativeElement.querySelectorAll('.badge');

        expect(badges.length).toBe(3);
        expect(badges[0].textContent.trim()).toBe('Frontend');
        expect(badges[1].textContent.trim()).toBe('Backend');
        expect(badges[1].classList.contains('bg-info')).toBe(true);
        expect(badges[2].textContent.trim()).toBe('DevOps');
    });
});