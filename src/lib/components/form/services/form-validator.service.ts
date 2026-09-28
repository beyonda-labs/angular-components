import { Injectable } from '@angular/core';
import { AsyncValidatorFn, ValidatorFn, Validators } from '@angular/forms';

import { FormField, FormFieldType } from '../models/form-field.model';
import {
    FormFieldCustomValidator,
    FormFieldValidator,
    FormFieldValidatorType
} from '../models/form-field-validator.model';

const SYNC_VALIDATED_TYPES: ReadonlySet<FormFieldType> = new Set([
    FormFieldType.Checkbox,
    FormFieldType.Date,
    FormFieldType.Number,
    FormFieldType.Radio,
    FormFieldType.Select,
    FormFieldType.Text,
    FormFieldType.Textarea,
    FormFieldType.TextVariable
]);

@Injectable({
    providedIn: 'root'
})
export class FormValidatorService {
    getCustomValidators(field: FormField): ValidatorFn[] {
        if (!SYNC_VALIDATED_TYPES.has(field.type)) {
            return [];
        }

        return field.validators
            .filter(validator => validator instanceof FormFieldCustomValidator)
            .map(validator => validator.validatorFn);
    }

    getFieldAsyncValidators(field: FormField): AsyncValidatorFn[] {
        return field.asyncValidators.map(v => v.asyncValidatorFn);
    }

    getFieldValidators(field: FormField): ValidatorFn[] {
        return SYNC_VALIDATED_TYPES.has(field.type) ? this.getSyncValidators(field.validators) : [];
    }

    private getSyncValidators(textFieldValidator: FormFieldValidator[]): ValidatorFn[] {
        const validators: ValidatorFn[] = [];

        textFieldValidator.forEach(fieldValidator => {
            switch (fieldValidator.type) {
                case FormFieldValidatorType.MaxLength:
                case FormFieldValidatorType.MinLength: {
                    const length = Number(fieldValidator.args as number);

                    if (!Number.isFinite(length)) {
                        break;
                    }

                    validators.push(
                        fieldValidator.type === FormFieldValidatorType.MaxLength
                            ? Validators.maxLength(length)
                            : Validators.minLength(length)
                    );
                    break;
                }

                case FormFieldValidatorType.Pattern:
                    validators.push(Validators.pattern(fieldValidator.args as RegExp));
                    break;
                case FormFieldValidatorType.Email:
                    validators.push(Validators.email);
                    break;
                case FormFieldValidatorType.Url:
                    validators.push(Validators.pattern(/^https?:\/\/.+/u));
                    break;
                case FormFieldValidatorType.Custom:
                    validators.push((fieldValidator as FormFieldCustomValidator).validatorFn);
                    break;
                default:
                    break;
            }
        });

        return validators;
    }
}
