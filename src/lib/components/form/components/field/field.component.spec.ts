import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';

import { FormFieldState } from '../../form.component';
import { FormCheckboxField } from '../../models/fields/form-checkbox-field.model';
import { FormTextField } from '../../models/fields/form-text-field.model';
import { FormField } from '../../models/form-field.model';
import { FormFieldComponent } from './field.component';

const VALID: FormFieldState = { isDisabled: false, isHidden: false, isValid: true, options: [] };

describe('FormFieldComponent', () => {
    let fixture: ComponentFixture<FormFieldComponent>;

    async function render(field: FormField, state: FormFieldState = VALID): Promise<void> {
        fixture = await renderComponent(FormFieldComponent, {
            control: new FormControl(''),
            field,
            prefix: 'demo.contact',
            state
        });
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('labels the input from the prefix and marks a required field until it is valid', async () => {
        await render(new FormTextField({ key: 'name', isRequired: true }), { ...VALID, isValid: false });
        const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;

        expect(label.textContent?.trim()).toBe('demo.contact.name.label');
        expect(label.htmlFor).toBe('name');
        expect(fixture.nativeElement.textContent).toContain('*');
    });

    it('leaves the label to the checkbox itself', async () => {
        await render(new FormCheckboxField({ key: 'subscribed' }));

        expect(fixture.nativeElement.querySelectorAll('label')).toHaveLength(1);
        expect(fixture.nativeElement.querySelector('input[type="checkbox"]')).not.toBeNull();
    });
});
