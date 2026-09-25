import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

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
        fixture = TestBed.createComponent(FormTextVariableFieldComponent);
        fixture.componentRef.setInput('control', control);
        fixture.componentRef.setInput('field', new FormTextVariableField({ key: 'greeting' }));
        fixture.componentRef.setInput('options', [{ label: 'Name', value: 'name' }]);
        fixture.componentRef.setInput('prefix', 'demo.template.greeting');
        fixture.detectChanges();
        await fixture.whenStable();
    });

    afterEach(() => {
        document.body.querySelectorAll('bey-form-option-picker').forEach(picker => picker.remove());
    });

    it('opens the picker from its button and inserts the chosen variable at the end of the text', async () => {
        (fixture.nativeElement.querySelector('.bey-text-variable-toggle') as HTMLButtonElement).click();
        fixture.detectChanges();
        await fixture.whenStable();

        const option = document.body.querySelector('bey-form-option-picker button[type="button"]:not([aria-label])');
        expect(document.body.textContent).toContain('Name');

        (option as HTMLButtonElement).click();

        expect(control.value).toBe('Hello {{ name }}');
    });
});
