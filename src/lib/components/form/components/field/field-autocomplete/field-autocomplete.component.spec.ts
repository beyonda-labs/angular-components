import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormAutocompleteField } from '../../../models/fields/form-autocomplete-field.model';
import { FormAutocompleteFieldComponent } from './field-autocomplete.component';

describe('FormAutocompleteFieldComponent', () => {
    let fixture: ComponentFixture<FormAutocompleteFieldComponent>;
    let control: FormControl<string | null>;

    function input(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }

    function panelOptions(): HTMLButtonElement[] {
        return [...document.body.querySelectorAll<HTMLButtonElement>('.bey-autocomplete-option')];
    }

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormAutocompleteFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        control = new FormControl<string | null>('');
        fixture = TestBed.createComponent(FormAutocompleteFieldComponent);
        fixture.componentRef.setInput('control', control);
        fixture.componentRef.setInput('field', new FormAutocompleteField({ key: 'city' }));
        fixture.componentRef.setInput('options', [
            { label: 'Madrid', value: 'mad' },
            { label: 'Malaga', value: 'agp' },
            { label: 'Bilbao', value: 'bio', isDisabled: true }
        ]);
        fixture.componentRef.setInput('prefix', 'demo.trip.city');
        await settle();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('filters the options by the typed text and writes the picked one', async () => {
        input().dispatchEvent(new Event('focus'));
        await settle();
        expect(panelOptions()).toHaveLength(3);

        input().value = 'ma';
        input().dispatchEvent(new Event('input'));
        await settle();
        expect(panelOptions().map(option => option.textContent?.trim())).toEqual(['Madrid', 'Malaga']);

        panelOptions()[1].dispatchEvent(new MouseEvent('mousedown'));
        await settle();

        expect(control.value).toBe('agp');
        expect(input().value).toBe('Malaga');
        expect(panelOptions()).toHaveLength(0);
    });

    it('walks the options with the keyboard and picks with Enter', async () => {
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await settle();

        expect(control.value).toBe('agp');
    });

    it('clears the value from the clear button', async () => {
        control.setValue('mad');
        await settle();

        (fixture.nativeElement.querySelector('.bey-autocomplete-action') as HTMLButtonElement).dispatchEvent(
            new MouseEvent('mousedown')
        );
        await settle();

        expect(control.value).toBe('');
    });

    it('moves the panel to the body while open and takes it away on close', async () => {
        input().dispatchEvent(new Event('focus'));
        await settle();
        expect(document.body.querySelector('.bey-autocomplete-panel')).not.toBeNull();

        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await settle();

        expect(document.body.querySelector('.bey-autocomplete-panel')).toBeNull();
    });
});
