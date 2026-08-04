import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyTextField } from '../../../models/fields/property-text-field.model';
import { PropertyVariable } from '../../../models/property-variable.model';
import { PropertyVariableService } from '../../../services/property-variable.service';
import { PropertyTextFieldComponent } from './property-text-field.component';

describe('PropertyTextFieldComponent', () => {
    let component: PropertyTextFieldComponent;
    let fixture: ComponentFixture<PropertyTextFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyTextFieldComponent, TranslateModule.forRoot()],
            providers: [PropertyVariableService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyTextFieldComponent);
        component = fixture.componentInstance;
    });

    it('should not show the variable trigger when acceptsVariable is false', () => {
        component.field = new PropertyTextField({ id: 'text', acceptsVariable: false });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-property-field-variable-trigger')).toBeFalsy();
    });

    it('should show the variable trigger when acceptsVariable is true', () => {
        component.field = new PropertyTextField({ id: 'text', acceptsVariable: true });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-property-field-variable-trigger')).toBeTruthy();
    });

    it('should emit valueChange on input', () => {
        component.field = new PropertyTextField({ id: 'text', value: '' });
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        const input: HTMLInputElement = fixture.nativeElement.querySelector('.bey-property-field-input');

        input.value = 'FACTURA';
        input.dispatchEvent(new Event('input'));

        expect(emitSpy).toHaveBeenCalledWith('FACTURA');
    });

    it('should append the expression at the end when no cursor position is known', () => {
        component.field = new PropertyTextField({ id: 'text', value: 'FACTURA', acceptsVariable: true });
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.variableInserted, 'emit');
        const variable = new PropertyVariable({ id: 'customer-name', path: 'customer.name' });

        component.onVariableSelected(variable);

        expect(emitSpy).toHaveBeenCalledWith({ value: 'FACTURA{{ customer.name }}', variable });
        expect(component.pickerOpen).toBe(false);
    });
});
