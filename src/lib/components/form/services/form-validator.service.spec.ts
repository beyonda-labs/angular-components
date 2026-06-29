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
    FormFieldValidatorType} from '../models/form-field-validator.model';
import { FormValidatorService } from './form-validator.service';

describe('FormValidatorService', () => {
    let service: FormValidatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FormValidatorService]
        });

        service = TestBed.inject(FormValidatorService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should return sync validators for text field', () => {
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

    it('should support email and url validators', () => {
        const validators = service.getFieldValidators(
            new FormTextField({
                key: 'text2',
                validators: [new FormFieldEmailValidator(), new FormFieldUrlValidator()]
            })
        );

        expect(validators.length).toBe(2);
    });

    it('should support custom validator', () => {
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

    it('should return async validators', () => {
        const asyncValidators = service.getFieldAsyncValidators(
            new FormTextField({
                key: 'text4',
                asyncValidators: [new FormFieldAsyncValidator(() => Promise.resolve(null))]
            })
        );

        expect(asyncValidators.length).toBe(1);
    });
});
