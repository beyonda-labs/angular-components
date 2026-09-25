import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyNumberArrayField } from '../../../models/fields/property-number-array-field.model';
import { PropertyNumberArrayFieldComponent } from './property-number-array-field.component';

const ADD_TEXT = 'angular-components.properties-menu.number-array-field.add';
const REMOVE_LABEL = 'angular-components.properties-menu.remove';

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

    function entryInputs(): HTMLInputElement[] {
        return [...fixture.nativeElement.querySelectorAll('input[type="number"]')];
    }

    function addButton(): HTMLButtonElement | undefined {
        const buttons: HTMLButtonElement[] = [...fixture.nativeElement.querySelectorAll('button')];

        return buttons.find(element => element.textContent?.includes(ADD_TEXT));
    }

    it('renders one input per entry', () => {
        fixture.componentRef.setInput('field', new PropertyNumberArrayField({ id: 'widths', value: [1, 1, 1, 1] }));
        fixture.detectChanges();

        expect(entryInputs()).toHaveLength(4);
    });

    it('emits the array with the new entry appended when "add" is clicked', () => {
        fixture.componentRef.setInput(
            'field',
            new PropertyNumberArrayField({ id: 'widths', value: [1, 1], entryDefaultValue: 1 })
        );
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        component.onAdd();

        expect(emitSpy).toHaveBeenCalledWith([1, 1, 1]);
    });

    it('emits the array without that entry when "remove" is clicked', () => {
        fixture.componentRef.setInput('field', new PropertyNumberArrayField({ id: 'widths', value: [1, 2, 3] }));
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        component.onRemove(1);

        expect(emitSpy).toHaveBeenCalledWith([1, 3]);
    });

    it('does not allow removing below minLength', () => {
        fixture.componentRef.setInput(
            'field',
            new PropertyNumberArrayField({ id: 'widths', value: [1], minLength: 1 })
        );
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        component.onRemove(0);

        expect(emitSpy).not.toHaveBeenCalled();
        expect(fixture.nativeElement.querySelector(`[aria-label="${REMOVE_LABEL}"]`)).toBeNull();
    });

    it('hides the add button once maxLength is reached', () => {
        fixture.componentRef.setInput(
            'field',
            new PropertyNumberArrayField({ id: 'widths', value: [1, 1], maxLength: 2 })
        );
        fixture.detectChanges();

        expect(addButton()).toBeUndefined();
    });

    it('emits the updated entry value on input', () => {
        fixture.componentRef.setInput('field', new PropertyNumberArrayField({ id: 'widths', value: [1, 2] }));
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        const input = entryInputs()[1];

        input.value = '5';
        input.dispatchEvent(new Event('input'));

        expect(emitSpy).toHaveBeenCalledWith([1, 5]);
    });
});
