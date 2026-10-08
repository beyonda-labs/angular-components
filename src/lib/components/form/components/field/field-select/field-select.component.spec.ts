import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent, textsOf } from '@testing/dom';

import { FormSelectField } from '../../../models/fields/form-select-field.model';
import { FormSelectFieldComponent } from './field-select.component';

describe('FormSelectFieldComponent', () => {
    let fixture: ComponentFixture<FormSelectFieldComponent>;
    let control: FormControl<string | null>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormSelectFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        control = new FormControl<string | null>('');
        fixture = await renderComponent(FormSelectFieldComponent, {
            control,
            field: new FormSelectField({ key: 'role' }),
            options: [
                { label: 'Lead', value: 'lead' },
                { label: 'Ops', value: 'ops', isDisabled: true }
            ],
            prefix: 'demo.person.role'
        });
    });

    it('lists the placeholder and the options it is given, and writes the picked one', () => {
        const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
        const options = [...select.options];

        expect(textsOf(options)).toEqual(['demo.person.role.placeholder', 'Lead', 'Ops']);
        expect(options[2].disabled).toBe(true);

        select.value = 'lead';
        select.dispatchEvent(new Event('change'));

        expect(control.value).toBe('lead');
    });

    it('empties the field again when the placeholder is picked', () => {
        const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

        control.setValue('lead');
        select.value = '';
        select.dispatchEvent(new Event('change'));

        expect(control.value).toBe('');
    });
});
