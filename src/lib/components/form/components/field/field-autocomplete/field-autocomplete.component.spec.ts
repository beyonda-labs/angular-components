import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { FormAutocompleteField } from '../../../models/fields/form-autocomplete-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';
import { FormAutocompleteFieldComponent } from './field-autocomplete.component';

describe('FormAutocompleteFieldComponent', () => {
    let component: FormAutocompleteFieldComponent;
    let fixture: ComponentFixture<FormAutocompleteFieldComponent>;
    let formServiceMock: MockProxy<FormService>;

    beforeEach(async () => {
        formServiceMock = mock<FormService>();
        formServiceMock.getSectionGroup.mockReturnValue(new FormGroup({}));
        formServiceMock.getFieldControl.mockReturnValue(new FormControl<string>(''));
        formServiceMock.getFieldPrefix.mockReturnValue('prefix');

        await TestBed.configureTestingModule({
            imports: [FormAutocompleteFieldComponent, TranslateModule.forRoot()],
            providers: [{ provide: FormService, useValue: formServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(FormAutocompleteFieldComponent);
        component = fixture.componentInstance;

        component.formConfig = {} as FormConfig;
        component.section = { key: 'section1' } as FormSection;
        component.field = new FormAutocompleteField({
            key: 'attachment',
            options: [
                { label: 'Logo A4', value: 'a1' },
                { label: 'Imagen migrado 1', value: 'a2' },
                { label: 'PDF migrado 2', value: 'a3', isDisabled: true }
            ]
        });

        fixture.detectChanges();
    });

    it('getPlaceholder should fall back to the field prefix', () => {
        expect(component.getPlaceholder()).toBe('prefix.placeholder');
    });

    it('lists every option while the query is empty', () => {
        expect(component.filteredOptions.length).toBe(3);
    });

    it('filters the options by the typed query, ignoring case', () => {
        component.query = 'MIGRADO';

        expect(component.filteredOptions.map(option => option.value)).toEqual(['a2', 'a3']);
    });

    it('writes the picked option value into the control', () => {
        component.onFocus();
        component.onOptionPicked(component.field.options[1]);

        expect(component.control?.value).toBe('a2');
        expect(component.isOpen).toBe(false);
        expect(component.control?.dirty).toBe(true);
    });

    it('ignores a disabled option', () => {
        component.onOptionPicked(component.field.options[2]);

        expect(component.control?.value).toBe('');
    });

    it('shows the selected label when closed and the query when open', () => {
        component.control?.setValue('a1');

        expect(component.displayValue).toBe('Logo A4');

        component.onFocus();
        component.query = 'log';

        expect(component.displayValue).toBe('log');
    });

    it('clears the control from the clear button', () => {
        component.control?.setValue('a1');

        component.onClear(new MouseEvent('mousedown'));

        expect(component.control?.value).toBe('');
    });

    it('cycles the active option with the arrow keys and picks it with Enter', () => {
        component.onFocus();

        component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

        expect(component.control?.value).toBe('a2');
    });

    it('wraps the active option around the end of the list', () => {
        component.onFocus();

        component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));

        expect(component.activeIndex).toBe(2);
    });

    it('closes the panel on Escape without changing the value', () => {
        component.control?.setValue('a1');
        component.onFocus();

        component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(component.isOpen).toBe(false);
        expect(component.control?.value).toBe('a1');
    });

    it('marks the control as touched when it loses focus', () => {
        component.onBlur();

        expect(component.control?.touched).toBe(true);
    });
});

describe('FormAutocompleteFieldComponent · panel fuera del contenedor', () => {
    let component: FormAutocompleteFieldComponent;
    let fixture: ComponentFixture<FormAutocompleteFieldComponent>;

    beforeEach(async () => {
        const formServiceMock = mock<FormService>();
        formServiceMock.getSectionGroup.mockReturnValue(new FormGroup({}));
        formServiceMock.getFieldControl.mockReturnValue(new FormControl<string>(''));
        formServiceMock.getFieldPrefix.mockReturnValue('prefix');

        await TestBed.configureTestingModule({
            imports: [FormAutocompleteFieldComponent, TranslateModule.forRoot()],
            providers: [{ provide: FormService, useValue: formServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(FormAutocompleteFieldComponent);
        component = fixture.componentInstance;
        component.formConfig = {} as FormConfig;
        component.section = { key: 'section1' } as FormSection;
        component.field = new FormAutocompleteField({
            key: 'attachment',
            options: [{ label: 'Logo A4', value: 'a1' }]
        });
        fixture.detectChanges();
    });

    it('moves the open panel to the body, so a scrollable ancestor cannot clip it', () => {
        component.onFocus();
        fixture.detectChanges();

        const panel = document.querySelector('.bey-autocomplete-panel');

        expect(panel).toBeTruthy();
        expect(panel?.parentElement).toBe(document.body);
    });

    it('removes the panel from the body once it closes', () => {
        component.onFocus();
        fixture.detectChanges();

        component.onBlur();
        fixture.detectChanges();

        expect(document.querySelector('.bey-autocomplete-panel')).toBeFalsy();
    });

    it('leaves no panel behind when the component is destroyed while open', () => {
        component.onFocus();
        fixture.detectChanges();

        fixture.destroy();

        expect(document.querySelector('.bey-autocomplete-panel')).toBeFalsy();
    });
});
