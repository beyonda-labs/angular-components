import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyNumberArrayField } from '../../../models/fields/property-number-array-field.model';
import { PropertyNumberArrayFieldComponent } from './property-number-array-field.component';

describe('PropertyNumberArrayFieldComponent', () => {
    let component: PropertyNumberArrayFieldComponent;
    let fixture: ComponentFixture<PropertyNumberArrayFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyNumberArrayFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyNumberArrayFieldComponent);
        component = fixture.componentInstance;
    });

    it('renders one input per entry', () => {
        component.field = new PropertyNumberArrayField({ id: 'widths', value: [1, 1, 1, 1] });
        fixture.detectChanges();

        const inputs = fixture.nativeElement.querySelectorAll('.bey-property-number-array-field-entry input');

        expect(inputs).toHaveLength(4);
    });

    it('emits the array with the new entry appended when "add" is clicked', () => {
        component.field = new PropertyNumberArrayField({ id: 'widths', value: [1, 1], entryDefaultValue: 1 });
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        component.onAdd();

        expect(emitSpy).toHaveBeenCalledWith([1, 1, 1]);
    });

    it('emits the array without that entry when "remove" is clicked', () => {
        component.field = new PropertyNumberArrayField({ id: 'widths', value: [1, 2, 3] });
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        component.onRemove(1);

        expect(emitSpy).toHaveBeenCalledWith([1, 3]);
    });

    it('does not allow removing below minLength', () => {
        component.field = new PropertyNumberArrayField({ id: 'widths', value: [1], minLength: 1 });
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        component.onRemove(0);

        expect(emitSpy).not.toHaveBeenCalled();
        expect(fixture.nativeElement.querySelector('.bey-property-number-array-field-remove')).toBeFalsy();
    });

    it('hides the add button once maxLength is reached', () => {
        component.field = new PropertyNumberArrayField({ id: 'widths', value: [1, 1], maxLength: 2 });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-property-number-array-field-add')).toBeFalsy();
    });

    it('emits the updated entry value on input', () => {
        component.field = new PropertyNumberArrayField({ id: 'widths', value: [1, 2] });
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        const input: HTMLInputElement = fixture.nativeElement.querySelectorAll('.bey-property-number-array-field-entry input')[1];

        input.value = '5';
        input.dispatchEvent(new Event('input'));

        expect(emitSpy).toHaveBeenCalledWith([1, 5]);
    });
});
