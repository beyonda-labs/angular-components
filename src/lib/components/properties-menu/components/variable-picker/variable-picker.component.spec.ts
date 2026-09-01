import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyVariable } from '../../models/property-variable.model';
import { VariablePickerComponent } from './variable-picker.component';

describe('VariablePickerComponent', () => {
    let component: VariablePickerComponent;
    let fixture: ComponentFixture<VariablePickerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VariablePickerComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(VariablePickerComponent);
        component = fixture.componentInstance;
        component.anchor = document.createElement('div');
        component.variables = [
            new PropertyVariable({
                id: 'customer',
                path: 'customer',
                children: [new PropertyVariable({ id: 'customer-name', path: 'customer.name', label: 'Nombre' })]
            }),
            new PropertyVariable({ id: 'invoice', path: 'invoice' })
        ];
        component.ngOnChanges();
        fixture.detectChanges();
    });

    it('should show every variable, including nested children, when there is no search term', () => {
        expect(component.visibleRows.map(row => row.variable.path)).toEqual(['customer', 'customer.name', 'invoice']);
    });

    it('should filter by path or label when a search term is typed', () => {
        component.searchTerm = 'name';

        expect(component.visibleRows.map(row => row.variable.path)).toEqual(['customer.name']);
    });

    it('should show an empty state when nothing matches', () => {
        component.searchTerm = 'unknown-variable';
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-variable-picker-empty')).toBeTruthy();
    });

    it('should emit selected when a row is clicked', () => {
        const selectedSpy = jest.spyOn(component.selected, 'emit');

        component.selectVariable(component.variables[1]);

        expect(selectedSpy).toHaveBeenCalledWith(component.variables[1]);
    });

    it('should emit closed on Escape', () => {
        const closedSpy = jest.spyOn(component.closed, 'emit');

        component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(closedSpy).toHaveBeenCalled();
    });

    it('should move the active index with ArrowDown/ArrowUp', () => {
        component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        expect(component.activeIndex).toBe(1);

        component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(component.activeIndex).toBe(0);
    });
});
