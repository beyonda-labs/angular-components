import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

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
        fixture = TestBed.createComponent(FormSelectFieldComponent);
        fixture.componentRef.setInput('control', control);
        fixture.componentRef.setInput('field', new FormSelectField({ key: 'role' }));
        fixture.componentRef.setInput('options', [
            { label: 'Lead', value: 'lead' },
            { label: 'Ops', value: 'ops', isDisabled: true }
        ]);
        fixture.componentRef.setInput('prefix', 'demo.person.role');
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('lists the placeholder and the options it is given, and writes the picked one', () => {
        const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
        const options = [...select.options];

        expect(options.map(option => option.textContent?.trim())).toEqual([
            'demo.person.role.placeholder',
            'Lead',
            'Ops'
        ]);
        expect(options[2].disabled).toBe(true);

        select.value = 'lead';
        select.dispatchEvent(new Event('change'));

        expect(control.value).toBe('lead');
    });
});
