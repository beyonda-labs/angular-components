import { Injectable } from '@angular/core';
import { AsyncValidatorFn, ValidatorFn, Validators } from '@angular/forms';

import { FormField } from '../models/form-field.model';
import {
    FormFieldCustomValidator,
    FormFieldValidator,
    FormFieldValidatorType
} from '../models/form-field-validator.model';

const URL_PATTERN = /^https?:\/\/.+/u;

@Injectable({
    providedIn: 'root'
})
export class FormValidatorService {
    getCustomValidators(field: FormField): ValidatorFn[] {
        return field.validators
            .filter(validator => validator instanceof FormFieldCustomValidator)
            .map(validator => validator.validatorFn);
    }

    getFieldAsyncValidators(field: FormField): AsyncValidatorFn[] {
        return field.asyncValidators.map(v => v.asyncValidatorFn);
    }

    getFieldValidators(field: FormField): ValidatorFn[] {
        return field.validators.flatMap(validator => toValidators(validator));
    }
}

function toLengthValidators(fieldValidator: FormFieldValidator): ValidatorFn[] {
    const length = Number(fieldValidator.args as number);

    if (!Number.isFinite(length)) {
        return [];
    }

    return [
        fieldValidator.type === FormFieldValidatorType.MaxLength
            ? Validators.maxLength(length)
            : Validators.minLength(length)
    ];
}

function toValidators(fieldValidator: FormFieldValidator): ValidatorFn[] {
    switch (fieldValidator.type) {
        case FormFieldValidatorType.Custom:
            return [(fieldValidator as FormFieldCustomValidator).validatorFn];
        case FormFieldValidatorType.Email:
            return [Validators.email];
        case FormFieldValidatorType.MaxLength:
        case FormFieldValidatorType.MinLength:
            return toLengthValidators(fieldValidator);
        case FormFieldValidatorType.Pattern:
            return [Validators.pattern(fieldValidator.args as RegExp)];
        case FormFieldValidatorType.Url:
            return [Validators.pattern(URL_PATTERN)];
        default:
            return [];
    }
}
