import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, renderComponent } from '@testing/dom';

import { FormNumberField } from '../../../models/fields/form-number-field.model';
import { FormNumberFieldComponent } from './field-number.component';

describe('FormNumberFieldComponent', () => {
    let fixture: ComponentFixture<FormNumberFieldComponent>;
    let control: FormControl<number | null>;

    function buttons(): HTMLButtonElement[] {
        return queryAll<HTMLButtonElement>(fixture, 'button');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormNumberFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        control = new FormControl<number | null>(null);
        fixture = await renderComponent(FormNumberFieldComponent, {
            control,
            field: new FormNumberField({ key: 'age', min: 0, max: 2 }),
            prefix: 'demo.person.age'
        });
    });

    it('steps the value with the spinners, inside the limits of the field', () => {
        const [up, down] = buttons();

        up.click();
        up.click();
        expect(control.value).toBe(2);

        fixture.detectChanges();
        expect(up.disabled).toBe(true);

        down.click();
        down.click();
        down.click();
        expect(control.value).toBe(0);
    });
});
