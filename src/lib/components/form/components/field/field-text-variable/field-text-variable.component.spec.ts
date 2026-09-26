import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, renderComponent, settle } from '@testing/dom';

import { FormTextVariableField } from '../../../models/fields/form-text-variable-field.model';
import { FormTextVariableFieldComponent } from './field-text-variable.component';

describe('FormTextVariableFieldComponent', () => {
    let fixture: ComponentFixture<FormTextVariableFieldComponent>;
    let control: FormControl<string | null>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormTextVariableFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        control = new FormControl<string | null>('Hello ');
        fixture = await renderComponent(FormTextVariableFieldComponent, {
            control,
            field: new FormTextVariableField({ key: 'greeting' }),
            options: [{ label: 'Name', value: 'name' }],
            prefix: 'demo.template.greeting'
        });
    });

    afterEach(() => {
        document.body.querySelectorAll('bey-option-picker').forEach(picker => picker.remove());
    });

    it('opens the picker from its button and inserts the chosen variable at the end of the text', async () => {
        buttonByName(fixture, 'angular-components.form.text-variable-field.insert-variable').click();
        await settle(fixture);

        const option = document.body.querySelector('bey-option-picker button[type="button"]:not([aria-label])');
        expect(document.body.textContent).toContain('Name');

        (option as HTMLButtonElement).click();

        expect(control.value).toBe('Hello {{ name }}');
    });
});
