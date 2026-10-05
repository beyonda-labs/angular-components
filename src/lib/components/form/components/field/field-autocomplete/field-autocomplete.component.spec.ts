import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, queryAll, renderComponent, settle, textsOf } from '@testing/dom';

import { FormAutocompleteField } from '../../../models/fields/form-autocomplete-field.model';
import { FormAutocompleteFieldComponent } from './field-autocomplete.component';

describe('FormAutocompleteFieldComponent', () => {
    let fixture: ComponentFixture<FormAutocompleteFieldComponent>;
    let control: FormControl<string | null>;

    function input(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }

    function panelOptions(): HTMLButtonElement[] {
        return queryAll<HTMLButtonElement>(document.body, '[role="option"]');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormAutocompleteFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        control = new FormControl<string | null>('');
        fixture = await renderComponent(FormAutocompleteFieldComponent, {
            control,
            field: new FormAutocompleteField({ key: 'city' }),
            options: [
                { label: 'Madrid', value: 'mad' },
                { label: 'Malaga', value: 'agp' },
                { label: 'Bilbao', value: 'bio', isDisabled: true }
            ],
            prefix: 'demo.trip.city'
        });
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('filters the options by the typed text and writes the picked one', async () => {
        input().dispatchEvent(new Event('focus'));
        await settle(fixture);
        expect(panelOptions()).toHaveLength(3);

        input().value = 'ma';
        input().dispatchEvent(new Event('input'));
        await settle(fixture);
        expect(textsOf(panelOptions())).toEqual(['Madrid', 'Malaga']);

        panelOptions()[1].dispatchEvent(new MouseEvent('mousedown'));
        await settle(fixture);

        expect(control.value).toBe('agp');
        expect(input().value).toBe('Malaga');
        expect(panelOptions()).toHaveLength(0);
    });

    it('walks the options with the keyboard and picks with Enter', async () => {
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await settle(fixture);

        expect(control.value).toBe('agp');
    });

    it('clears the value from the clear button', async () => {
        control.setValue('mad');
        await settle(fixture);

        buttonByName(fixture, 'angular-components.form.autocomplete-field.clear').dispatchEvent(
            new MouseEvent('mousedown')
        );
        await settle(fixture);

        expect(control.value).toBe('');
    });

    describe('with free text', () => {
        beforeEach(async () => {
            fixture.destroy();
            control = new FormControl<string | null>('Sales');
            fixture = await renderComponent(FormAutocompleteFieldComponent, {
                control,
                field: new FormAutocompleteField({ key: 'section', isFreeTextAllowed: true }),
                options: [
                    { label: 'Sales', value: 'Sales' },
                    { label: 'Support', value: 'Support' },
                    { label: 'Billing', value: 'Billing' }
                ],
                prefix: 'demo.variable.section'
            });
        });

        it('keeps the current value to edit and suggests every option until something is typed', async () => {
            input().dispatchEvent(new Event('focus'));
            await settle(fixture);

            expect(input().value).toBe('Sales');
            expect(panelOptions()).toHaveLength(3);
        });

        it('takes the typed text as the value, suggesting the options that match it', async () => {
            input().dispatchEvent(new Event('focus'));
            input().value = 'Su';
            input().dispatchEvent(new Event('input'));
            await settle(fixture);

            expect(control.value).toBe('Su');
            expect(textsOf(panelOptions())).toEqual(['Support']);

            input().value = 'Suppliers';
            input().dispatchEvent(new Event('input'));
            input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            await settle(fixture);

            expect(control.value).toBe('Suppliers');
            expect(input().value).toBe('Suppliers');
            expect(panelOptions()).toHaveLength(0);
        });

        it('shows no panel while no option matches the typed text', async () => {
            input().dispatchEvent(new Event('focus'));
            input().value = 'Suppliers';
            input().dispatchEvent(new Event('input'));
            await settle(fixture);

            expect(document.body.querySelector('[role="listbox"]')).toBeNull();
        });
    });

    it('moves the panel to the body while open and takes it away on close', async () => {
        input().dispatchEvent(new Event('focus'));
        await settle(fixture);
        expect(document.body.querySelector('[role="listbox"]')).not.toBeNull();

        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await settle(fixture);

        expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    });
});
