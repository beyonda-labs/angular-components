import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { FormDateField } from '../models/fields/form-date-field.model';
import { FormNumberField } from '../models/fields/form-number-field.model';
import { FormTextField } from '../models/fields/form-text-field.model';
import { FormConfig, FormSection } from '../models/form.model';
import { FormService } from './form.service';
import { FormValidatorService } from './form-validator.service';

describe('FormService', () => {
    let service: FormService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FormService, FormValidatorService]
        });

        service = TestBed.inject(FormService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('getFieldPrefix should build prefix correctly', () => {
        const result = service.getFieldPrefix(
            { i18nPrefix: 'my.form' } as FormConfig,
            { key: 'sectionA' } as FormSection,
            { key: 'fieldA' } as FormTextField
        );

        expect(result).toBe('my.form.sectionA.fieldA');
    });

    it('should validate minDate and maxDate for date controls', () => {
        const control = service.initFieldControl(
            new FormDateField({
                key: 'date1',
                minDate: '2026-01-01',
                maxDate: '2026-12-31'
            })
        ) as FormControl<string | null>;

        control.setValue('2025-01-01');
        expect(control.errors?.['minDate']).toBeTruthy();

        control.setValue('2027-01-01');
        expect(control.errors?.['maxDate']).toBeTruthy();

        control.setValue('2026-06-15');
        expect(control.valid).toBe(true);
    });

    it('should validate minDate and maxDate using the configured date format', () => {
        const control = service.initFieldControl(
            new FormDateField({
                key: 'date1',
                format: 'DD/MM/YYYY',
                minDate: '01/04/2026',
                maxDate: '30/04/2026'
            })
        ) as FormControl<string | null>;

        control.setValue('31/03/2026');
        expect(control.errors?.['minDate']).toBeTruthy();

        control.setValue('01/05/2026');
        expect(control.errors?.['maxDate']).toBeTruthy();

        control.setValue('15/04/2026');
        expect(control.valid).toBe(true);
    });

    it('should validate min and max for number controls', () => {
        const control = service.initFieldControl(
            new FormNumberField({
                key: 'number1',
                min: 10,
                max: 20
            })
        ) as FormControl<number | null>;

        control.setValue(5);
        expect(control.errors?.['min']).toBeTruthy();

        control.setValue(25);
        expect(control.errors?.['max']).toBeTruthy();

        control.setValue(15);
        expect(control.valid).toBe(true);
    });

    it('getSectionGroup should return undefined if section does not exist', () => {
        const result = service.getSectionGroup({ formGroup: new FormGroup({}) } as FormConfig, 'missing');

        expect(result).toBeUndefined();
    });
});
