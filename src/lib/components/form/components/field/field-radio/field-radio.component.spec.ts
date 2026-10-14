import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, renderComponent, settle } from '@testing/dom';

import { FormRadioField } from '../../../models/fields/form-radio-field.model';
import { FormRadioFieldComponent } from './field-radio.component';

describe('FormRadioFieldComponent', () => {
    let fixture: ComponentFixture<FormRadioFieldComponent>;
    let control: FormControl<string | null>;

    function radios(): HTMLInputElement[] {
        return queryAll<HTMLInputElement>(fixture, 'input[type="radio"]');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormRadioFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        control = new FormControl<string | null>('m');
        fixture = await renderComponent(FormRadioFieldComponent, {
            control,
            field: new FormRadioField({ key: 'size' }),
            options: [
                { label: 'Small', value: 's' },
                { label: 'Medium', value: 'm' },
                { isDisabled: true, label: 'Large', value: 'l' }
            ]
        });
    });

    it('offers one radio per option, checks the current value and writes the chosen one', () => {
        expect(fixture.nativeElement.textContent).toContain('Small');
        expect(radios().map(radio => radio.checked)).toEqual([false, true, false]);

        radios()[0].click();

        expect(control.value).toBe('s');
        expect(control.dirty).toBe(true);
    });

    it('marks the control as touched when a radio loses the focus', () => {
        radios()[0].dispatchEvent(new Event('blur'));

        expect(control.touched).toBe(true);
    });

    it('disables the options the config disables, and every option while the control is disabled', async () => {
        expect(radios().map(radio => radio.disabled)).toEqual([false, false, true]);

        control.disable();
        await settle(fixture);

        expect(radios().map(radio => radio.disabled)).toEqual([true, true, true]);

        control.enable();
        await settle(fixture);

        expect(radios().map(radio => radio.disabled)).toEqual([false, false, true]);
    });

    it('checks the option of a value set from outside', async () => {
        control.setValue('s');
        await settle(fixture);

        expect(radios().map(radio => radio.checked)).toEqual([true, false, false]);
    });
});
