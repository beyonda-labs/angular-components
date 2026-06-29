import { Injectable } from '@angular/core';
import { AsyncValidatorFn, ValidatorFn, Validators } from '@angular/forms';

import { FormField, FormFieldType } from '../models/form-field.model';
import { FormFieldCustomValidator, FormFieldValidator, FormFieldValidatorType } from '../models/form-field-validator.model';

@Injectable({
    providedIn: 'root'
})
export class FormValidatorService {
    getFieldValidators(field: FormField): ValidatorFn[] {
        switch (field.type) {
            case FormFieldType.Text:
            case FormFieldType.Checkbox:
            case FormFieldType.Date:
            case FormFieldType.Number:
            case FormFieldType.Radio:
            case FormFieldType.Select:
            case FormFieldType.Textarea:
                return this.getSyncValidators(field.validators);
            default:
                return [];
        }
    }

    getFieldAsyncValidators(field: FormField): AsyncValidatorFn[] {
        return field.asyncValidators.map(v => v.asyncValidatorFn);
    }

    private getSyncValidators(textFieldValidator: FormFieldValidator[]): ValidatorFn[] {
        const validators: ValidatorFn[] = [];

        textFieldValidator.forEach(fieldValidator => {
            switch (fieldValidator.type) {
                case FormFieldValidatorType.MaxLength:
                case FormFieldValidatorType.MinLength: {
                    const length = Number(fieldValidator.args as number);

                    if (!Number.isFinite(length)) {break;}

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
