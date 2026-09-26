import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';

import { FormTextField } from '../../../models/fields/form-text-field.model';
import { FormTextFieldComponent } from './field-text.component';

describe('FormTextFieldComponent', () => {
    let fixture: ComponentFixture<FormTextFieldComponent>;
    let control: FormControl<string | null>;

    async function render(field: FormTextField = new FormTextField({ key: 'name' })): Promise<void> {
        control = new FormControl<string | null>('', Validators.required);
        fixture = await renderComponent(FormTextFieldComponent, { control, field, prefix: 'demo.contact.name' });
    }

    function input(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormTextFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('binds the control and resolves the placeholder from the prefix', async () => {
        await render();

        expect(input().id).toBe('name');
        expect(input().placeholder).toBe('demo.contact.name.placeholder');

        input().value = 'Ada';
        input().dispatchEvent(new Event('input'));

        expect(control.value).toBe('Ada');
    });

    it('keeps an explicit placeholder and flags an invalid touched control', async () => {
        await render(new FormTextField({ key: 'name', isRequired: true, placeholder: 'Type a name' }));

        expect(input().placeholder).toBe('Type a name');
        expect(input().getAttribute('aria-invalid')).toBeNull();

        control.markAsTouched();
        fixture.detectChanges();

        expect(input().getAttribute('aria-invalid')).toBe('true');
        expect(input().getAttribute('aria-required')).toBe('true');
    });
});
