import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { FormTextField } from '../models/fields/form-text-field.model';
import {
    FormFieldAsyncValidator,
    FormFieldCustomValidator,
    FormFieldEmailValidator,
    FormFieldLengthValidator,
    FormFieldPatternValidator,
    FormFieldUrlValidator,
    FormFieldValidatorType
} from '../models/form-field-validator.model';
import { FormValidatorService } from './form-validator.service';

describe('FormValidatorService', () => {
    let service: FormValidatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FormValidatorService]
        });

        service = TestBed.inject(FormValidatorService);
    });

    it('returns one sync validator per length and pattern rule', () => {
        const validators = service.getFieldValidators(
            new FormTextField({
                key: 'text1',
                validators: [
                    new FormFieldLengthValidator(5, FormFieldValidatorType.MinLength),
                    new FormFieldPatternValidator(/^[A-Za-z]+$/u)
                ]
            })
        );

        expect(validators.length).toBe(2);
    });

    it('returns one validator per email and url rule', () => {
        const validators = service.getFieldValidators(
            new FormTextField({
                key: 'text2',
                validators: [new FormFieldEmailValidator(), new FormFieldUrlValidator()]
            })
        );

        expect(validators.length).toBe(2);
    });

    it('returns a custom validator that runs its function on the control', () => {
        const validators = service.getFieldValidators(
            new FormTextField({
                key: 'text3',
                validators: [new FormFieldCustomValidator(control => (control.value ? null : { required: true }))]
            })
        );

        const control = new FormControl('');
        const result = validators[0](control);

        expect(result?.['required']).toBe(true);
    });

    it('returns only the custom validators of a field', () => {
        const unique = (): null => null;
        const validators = service.getCustomValidators(
            new FormTextField({
                key: 'text5',
                validators: [new FormFieldEmailValidator(), new FormFieldCustomValidator(unique)]
            })
        );

        expect(validators).toEqual([unique]);
    });

    it('returns the async validators of a field', () => {
        const asyncValidators = service.getFieldAsyncValidators(
            new FormTextField({
                key: 'text4',
                asyncValidators: [new FormFieldAsyncValidator(() => Promise.resolve(null))]
            })
        );

        expect(asyncValidators.length).toBe(1);
    });
});
