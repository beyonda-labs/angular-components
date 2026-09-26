import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';

import { FormCheckboxField } from '../../../models/fields/form-checkbox-field.model';
import { FormCheckboxFieldComponent } from './field-checkbox.component';

describe('FormCheckboxFieldComponent', () => {
    let fixture: ComponentFixture<FormCheckboxFieldComponent>;
    let control: FormControl<boolean | null>;

    async function render(field: FormCheckboxField): Promise<void> {
        control = new FormControl<boolean | null>(false);
        fixture = await renderComponent(FormCheckboxFieldComponent, {
            control,
            field,
            prefix: 'demo.person.subscribed'
        });
    }

    function input(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormCheckboxFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('renders a labelled checkbox bound to the control', async () => {
        await render(new FormCheckboxField({ key: 'subscribed' }));

        expect(fixture.nativeElement.querySelector('label').textContent.trim()).toBe('demo.person.subscribed.label');
        expect(input().getAttribute('role')).toBeNull();

        input().click();

        expect(control.value).toBe(true);
    });

    it('renders a switch when asked', async () => {
        await render(new FormCheckboxField({ key: 'subscribed', isSwitch: true }));

        expect(input().getAttribute('role')).toBe('switch');
    });
});
