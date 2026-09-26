import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';

import { FormDateField } from '../../../models/fields/form-date-field.model';
import { FormDateFieldComponent } from './field-date.component';

describe('FormDateFieldComponent', () => {
    let fixture: ComponentFixture<FormDateFieldComponent>;
    let control: FormControl<string | null>;

    async function render(field: FormDateField): Promise<void> {
        control = new FormControl<string | null>('');
        fixture = await renderComponent(FormDateFieldComponent, { control, field, prefix: 'demo.person.birthday' });
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormDateFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('uses the format as placeholder and keeps the picker and the control in sync', async () => {
        await render(new FormDateField({ key: 'birthday' }));
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        expect(input.placeholder).toBe('YYYY-MM-DD');

        control.setValue('2026-06-15');
        expect(fixture.componentInstance.datepickerControl.value?.getFullYear()).toBe(2026);

        fixture.componentInstance.datepickerControl.setValue(new Date(2026, 0, 2));
        expect(control.value).toBe('2026-01-02');
    });

    it('honours a custom format', async () => {
        await render(new FormDateField({ key: 'birthday', format: 'DD/MM/YYYY' }));

        fixture.componentInstance.datepickerControl.setValue(new Date(2026, 3, 5));

        expect(control.value).toBe('05/04/2026');
    });
});
