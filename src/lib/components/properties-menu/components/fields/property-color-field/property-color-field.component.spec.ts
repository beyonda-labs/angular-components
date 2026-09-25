import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyColorField } from '../../../models/fields/property-color-field.model';
import { PropertyColorFieldComponent } from './property-color-field.component';

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

    it('shows the empty (checkerboard) state and no clear button when the value is unset', () => {
        fixture.componentRef.setInput('field', new PropertyColorField({ id: 'fill', value: '' }));
        fixture.detectChanges();

        const swatch = fixture.nativeElement.querySelector('.bey-property-color-field-swatch');
        const textInput: HTMLInputElement = fixture.nativeElement.querySelector('.bey-property-field-input');

        expect(swatch.classList.contains('is-empty')).toBe(true);
        expect(textInput.value).toBe('');
        expect(fixture.nativeElement.querySelector('.bey-property-field-action')).toBeFalsy();
    });

    it('shows the real color and a clear button once a value is set', () => {
        fixture.componentRef.setInput('field', new PropertyColorField({ id: 'fill', value: '#ff0000' }));
        fixture.detectChanges();

        const swatch = fixture.nativeElement.querySelector('.bey-property-color-field-swatch');
        const textInput: HTMLInputElement = fixture.nativeElement.querySelector('.bey-property-field-input');

        expect(swatch.classList.contains('is-empty')).toBe(false);
        expect(textInput.value).toBe('#ff0000');
        expect(fixture.nativeElement.querySelector('.bey-property-field-action')).toBeTruthy();
    });

    it('emits an empty string when the clear button is clicked', () => {
        fixture.componentRef.setInput('field', new PropertyColorField({ id: 'fill', value: '#ff0000' }));
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        const clearButton: HTMLButtonElement = fixture.nativeElement.querySelector('.bey-property-field-action');

        clearButton.click();

        expect(emitSpy).toHaveBeenCalledWith('');
    });
});
