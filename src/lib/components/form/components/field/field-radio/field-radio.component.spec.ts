import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, renderComponent } from '@testing/dom';

import { FormRadioField } from '../../../models/fields/form-radio-field.model';
import { FormRadioFieldComponent } from './field-radio.component';

describe('FormRadioFieldComponent', () => {
    let fixture: ComponentFixture<FormRadioFieldComponent>;
    let control: FormControl<string | null>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormRadioFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        control = new FormControl<string | null>('');
        fixture = await renderComponent(FormRadioFieldComponent, {
            control,
            field: new FormRadioField({ key: 'size' }),
            options: [
                { label: 'Small', value: 's' },
                { label: 'Large', value: 'l' }
            ]
        });
    });

    it('offers one radio per option and writes the chosen one', () => {
        const radios = queryAll<HTMLInputElement>(fixture, 'input[type="radio"]');

        expect(fixture.nativeElement.textContent).toContain('Small');
        expect(radios).toHaveLength(2);

        radios[1].click();

        expect(control.value).toBe('l');
    });
});
