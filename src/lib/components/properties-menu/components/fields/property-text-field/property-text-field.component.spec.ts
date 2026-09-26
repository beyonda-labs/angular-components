import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryButton } from '@testing/dom';

import { PropertyTextField } from '../../../models/fields/property-text-field.model';
import { PropertyVariable } from '../../../models/property-variable.model';
import { PropertiesMenuService } from '../../../services/properties-menu.service';
import { PropertyTextFieldComponent } from './property-text-field.component';

const INSERT_VARIABLE_LABEL = 'angular-components.properties-menu.text-field.insert-variable';

describe('PropertyTextFieldComponent', () => {
    let component: PropertyTextFieldComponent;
    let fixture: ComponentFixture<PropertyTextFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyTextFieldComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyTextFieldComponent);
        component = fixture.componentInstance;
    });

    function variableTrigger(): HTMLButtonElement | null {
        return queryButton(fixture, INSERT_VARIABLE_LABEL);
    }

    it('should not show the variable trigger when acceptsVariable is false', () => {
        fixture.componentRef.setInput('field', new PropertyTextField({ id: 'text', acceptsVariable: false }));
        fixture.detectChanges();

        expect(variableTrigger()).toBeNull();
    });

    it('should show the variable trigger when acceptsVariable is true', () => {
        fixture.componentRef.setInput('field', new PropertyTextField({ id: 'text', acceptsVariable: true }));
        fixture.detectChanges();

        expect(variableTrigger()).not.toBeNull();
    });

    it('should emit valueChange on input', () => {
        fixture.componentRef.setInput('field', new PropertyTextField({ id: 'text', value: '' }));
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="text"]');

        input.value = 'FACTURA';
        input.dispatchEvent(new Event('input'));

        expect(emitSpy).toHaveBeenCalledWith('FACTURA');
    });

    it('should append the expression at the end when no cursor position is known', () => {
        fixture.componentRef.setInput(
            'field',
            new PropertyTextField({ id: 'text', value: 'FACTURA', acceptsVariable: true })
        );
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.variableInserted, 'emit');
        const variable = new PropertyVariable({ id: 'customer-name', path: 'customer.name' });

        TestBed.inject(PropertiesMenuService).setVariables([variable]);
        component.onVariableSelected({ label: variable.label, value: variable.path });

        expect(emitSpy).toHaveBeenCalledWith({ value: 'FACTURA{{ customer.name }}', variable });
        expect(component.pickerOpen()).toBe(false);
    });
});
