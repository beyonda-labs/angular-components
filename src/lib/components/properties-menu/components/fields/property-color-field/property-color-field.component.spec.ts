import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyColorField } from '../../../models/fields/property-color-field.model';
import { PropertyColorFieldComponent } from './property-color-field.component';

const CLEAR_LABEL = 'angular-components.properties-menu.color-field.clear';

describe('PropertyColorFieldComponent', () => {
    let component: PropertyColorFieldComponent;
    let fixture: ComponentFixture<PropertyColorFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyColorFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyColorFieldComponent);
        component = fixture.componentInstance;
    });

    function hexInput(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input[type="text"]');
    }

    function clearButton(): HTMLButtonElement | null {
        return fixture.nativeElement.querySelector(`[aria-label="${CLEAR_LABEL}"]`);
    }

    it('shows no clear button when the value is unset', () => {
        fixture.componentRef.setInput('field', new PropertyColorField({ id: 'fill', value: '' }));
        fixture.detectChanges();

        expect(hexInput().value).toBe('');
        expect(clearButton()).toBeNull();
    });

    it('shows the value and a clear button once a value is set', () => {
        fixture.componentRef.setInput('field', new PropertyColorField({ id: 'fill', value: '#ff0000' }));
        fixture.detectChanges();

        expect(hexInput().value).toBe('#ff0000');
        expect(clearButton()).not.toBeNull();
    });

    it('emits an empty string when the clear button is clicked', () => {
        fixture.componentRef.setInput('field', new PropertyColorField({ id: 'fill', value: '#ff0000' }));
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');

        clearButton()?.click();

        expect(emitSpy).toHaveBeenCalledWith('');
    });
});
