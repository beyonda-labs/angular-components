import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { PasswordPolicy } from '../../../services/password-policy/models/password-policy.model';
import { FormCheckboxField } from '../models/fields/form-checkbox-field.model';
import { FormChipsField } from '../models/fields/form-chips-field.model';
import { FormDateField } from '../models/fields/form-date-field.model';
import { FormFileField } from '../models/fields/form-file-field.model';
import { FormNumberField } from '../models/fields/form-number-field.model';
import { FormPasswordField } from '../models/fields/form-password-field.model';
import { FormTextField } from '../models/fields/form-text-field.model';
import { FormConfig, FormRow, FormSection } from '../models/form.model';
import { FormFieldCustomValidator } from '../models/form-field-validator.model';
import { FormService } from './form.service';

describe('FormService', () => {
    let service: FormService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FormService);
    });

    it('builds one group per section, seeded from the initial value and the field defaults', () => {
        const group = service.buildFormGroup(
            new FormConfig({
                initialValue: { contact: { name: 'Ada' } },
                prefix: 'demo',
                sections: [
                    new FormSection({
                        key: 'contact',
                        rows: [
                            new FormRow({
                                fields: [
                                    new FormTextField({ key: 'name' }),
                                    new FormTextField({ key: 'email' }),
                                    new FormCheckboxField({ key: 'subscribed', isDisabled: true }),
                                    new FormNumberField({ key: 'age' }),
                                    new FormChipsField({ key: 'tags' })
                                ]
                            })
                        ]
                    })
                ]
            })
        );

        expect(group.getRawValue()).toEqual({
            contact: { name: 'Ada', email: '', subscribed: false, age: null, tags: [] }
        });
        expect(group.get('contact.subscribed')?.disabled).toBe(true);
    });

    it('requires a value when the field is required', () => {
        const control = service.initFieldControl(new FormTextField({ key: 'name', isRequired: true }));

        expect(control?.valid).toBe(false);

        control?.setValue('Ada');
        expect(control?.valid).toBe(true);
    });

    it('validates minDate and maxDate in the format of the field', () => {
        const control = service.initFieldControl(
            new FormDateField({ key: 'date', format: 'DD/MM/YYYY', minDate: '01/04/2026', maxDate: '30/04/2026' })
        ) as FormControl<string | null>;

        control.setValue('31/03/2026');
        expect(control.errors?.['minDate']).toBeTruthy();

        control.setValue('01/05/2026');
        expect(control.errors?.['maxDate']).toBeTruthy();

        control.setValue('15/04/2026');
        expect(control.valid).toBe(true);
    });

    it('validates min and max for number fields', () => {
        const control = service.initFieldControl(new FormNumberField({ key: 'age', min: 10, max: 20 })) as FormControl<
            number | null
        >;

        control.setValue(5);
        expect(control.errors?.['min']).toBeTruthy();

        control.setValue(25);
        expect(control.errors?.['max']).toBeTruthy();

        control.setValue(15);
        expect(control.valid).toBe(true);
    });

    it('validates maxItems for chips fields', () => {
        const control = service.initFieldControl(new FormChipsField({ key: 'tags', maxItems: 2 })) as FormControl<
            string[] | null
        >;

        control.setValue(['a', 'b', 'c']);
        expect(control.errors?.['maxItems']).toBeTruthy();

        control.setValue(['a', 'b']);
        expect(control.valid).toBe(true);
    });

    it('validates a password against its policy, and only one that has a policy', () => {
        const policy = new PasswordPolicy({ isDigitRequired: true });
        const control = service.initFieldControl(new FormPasswordField({ key: 'password', policy })) as FormControl<
            string | null
        >;
        const plain = service.initFieldControl(new FormPasswordField({ key: 'password' })) as FormControl<
            string | null
        >;

        control.setValue('no digits here');
        plain.setValue('no digits here');
        expect(control.errors).toEqual({ passwordPolicy: { unmet: ['digit'] } });
        expect(plain.valid).toBe(true);

        control.setValue('with digit 1');
        expect(control.valid).toBe(true);
    });

    it('re-runs the policy of a password with the custom validators of the field', () => {
        const field = new FormPasswordField({
            key: 'password',
            policy: new PasswordPolicy({ isDigitRequired: true }),
            validators: [
                new FormFieldCustomValidator(current => (current.value === 'taken name 1' ? { taken: true } : null))
            ]
        });
        const validate = service.getCustomValidator(field);

        expect(validate?.(new FormControl('no digits here'))).toEqual({ passwordPolicy: { unmet: ['digit'] } });
        expect(validate?.(new FormControl('taken name 1'))).toEqual({ taken: true });
        expect(service.getCustomValidator(new FormPasswordField({ key: 'password' }))).toBeNull();
    });

    it('validates a file with its validators together with the accepted types and the size limit', () => {
        const control = service.initFieldControl(
            new FormFileField({
                key: 'attachment',
                accept: ['application/pdf'],
                maxSizeBytes: 4,
                validators: [
                    new FormFieldCustomValidator(current =>
                        (current.value as File | null)?.name.startsWith('draft') ? { draft: true } : null
                    )
                ]
            })
        ) as FormControl<File | null>;

        control.setValue(new File(['too large'], 'draft.txt', { type: 'text/plain' }));
        expect(Object.keys(control.errors ?? {}).sort()).toEqual(['accept', 'draft', 'maxSizeBytes']);

        control.setValue(new File(['pdf'], 'draft.pdf', { type: 'application/pdf' }));
        expect(Object.keys(control.errors ?? {})).toEqual(['draft']);

        control.setValue(new File(['pdf'], 'final.pdf', { type: 'application/pdf' }));
        expect(control.valid).toBe(true);
    });
});
