import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { FormCheckboxField } from '../models/fields/form-checkbox-field.model';
import { FormDateField } from '../models/fields/form-date-field.model';
import { FormNumberField } from '../models/fields/form-number-field.model';
import { FormTextField } from '../models/fields/form-text-field.model';
import { FormTextareaField } from '../models/fields/form-textarea-field.model';
import { FormConfig, FormSection } from '../models/form.model';
import { FormField, FormFieldType } from '../models/form-field.model';
import { DateFormatService } from './date-format.service';
import { FormValidatorService } from './form-validator.service';

@Injectable({
    providedIn: 'root'
})
export class FormService {
    private readonly dateFormatService = inject(DateFormatService);
    private readonly formValidatorService = inject(FormValidatorService);

    getFieldControl(sectionGroup: FormGroup, field: FormField): AbstractControl | undefined {
        const control = sectionGroup?.get(field.key);

        if (!control) {
            return undefined;
        }

        switch (field.type) {
            case FormFieldType.Text:
            case FormFieldType.Password:
            case FormFieldType.Date:
            case FormFieldType.Radio:
            case FormFieldType.Select:
            case FormFieldType.Textarea:
                return control as FormControl<string | null>;
            case FormFieldType.Number:
                return control as FormControl<number | null>;
            case FormFieldType.Checkbox:
                return control as FormControl<boolean | null>;
            default:
                return undefined;
        }
    }

    getFieldPrefix(formConfig: FormConfig, section: FormSection, field: FormField): string {
        return `${this.getSectionPrefix(formConfig, section)}.${field.key}`;
    }

    getSectionGroup(formConfig: FormConfig, sectionKey: string): FormGroup | undefined {
        const group = formConfig.formGroup?.get(sectionKey);

        return group instanceof FormGroup ? group : undefined;
    }

    getSectionPrefix(formConfig: FormConfig, section: FormSection): string {
        return `${formConfig.i18nPrefix}.${section.key}`;
    }

    initFieldControl(field: FormField): FormControl | undefined {
        switch (field.type) {
            case FormFieldType.Text:
            case FormFieldType.Password:
                return this.initTextFieldControl(field as FormTextField);
            case FormFieldType.Checkbox:
                return this.initCheckboxFieldControl(field as FormCheckboxField);
            case FormFieldType.Date:
                return this.initDateFieldControl(field as FormDateField);
            case FormFieldType.Radio:
            case FormFieldType.Select:
                return this.initStringFieldControl(field);
            case FormFieldType.Number:
                return this.initNumberFieldControl(field as FormNumberField);
            case FormFieldType.Textarea:
                return this.initTextareaFieldControl(field as FormTextareaField);
            default:
                return undefined;
        }
    }

    private getValidators(field: FormField): ValidatorFn[] {
        const validators: ValidatorFn[] = [];

        if (field.isRequired) {
            validators.push(Validators.required);
        }

        const fieldValidators = this.formValidatorService.getFieldValidators(field);

        fieldValidators.forEach(validator => validators.push(validator));

        return validators;
    }

    private initTextFieldControl(field: FormTextField): FormControl<string | null> {
        return new FormControl<string | null>(
            {
                value: '',
                disabled: field.isDisabled
            },
            {
                validators: this.getValidators(field),
                asyncValidators: this.formValidatorService.getFieldAsyncValidators(field)
            }
        );
    }

    private initStringFieldControl(field: FormField): FormControl<string | null> {
        return new FormControl<string | null>(
            { value: '', disabled: field.isDisabled },
            {
                validators: this.getValidators(field),
                asyncValidators: this.formValidatorService.getFieldAsyncValidators(field)
            }
        );
    }

    private initDateFieldControl(field: FormDateField): FormControl<string | null> {
        return new FormControl<string | null>(
            { value: '', disabled: field.isDisabled },
            {
                validators: [...this.getValidators(field), ...this.getDateRangeValidators(field)],
                asyncValidators: this.formValidatorService.getFieldAsyncValidators(field)
            }
        );
    }

    private initCheckboxFieldControl(field: FormCheckboxField): FormControl<boolean | null> {
        return new FormControl<boolean | null>(
            { value: false, disabled: field.isDisabled },
            {
                validators: this.getValidators(field),
                asyncValidators: this.formValidatorService.getFieldAsyncValidators(field)
            }
        );
    }

    private initTextareaFieldControl(field: FormTextareaField): FormControl<string | null> {
        return new FormControl<string | null>(
            { value: '', disabled: field.isDisabled },
            {
                validators: this.getValidators(field),
                asyncValidators: this.formValidatorService.getFieldAsyncValidators(field)
            }
        );
    }

    private initNumberFieldControl(field: FormNumberField): FormControl<number | null> {
        return new FormControl<number | null>(
            { value: null, disabled: field.isDisabled },
            {
                validators: [...this.getValidators(field), ...this.getNumberRangeValidators(field)],
                asyncValidators: this.formValidatorService.getFieldAsyncValidators(field)
            }
        );
    }

    private getDateRangeValidators(field: FormDateField): ValidatorFn[] {
        const validators: ValidatorFn[] = [];

        if (field.minDate) {
            validators.push(control => {
                const value = control.value as string | null;
                const currentDate = this.dateFormatService.parseDate(value, field.format);
                const minDate = this.dateFormatService.parseDate(field.minDate, field.format);

                if (!currentDate || !minDate) {
                    return null;
                }

                return currentDate < minDate ? { minDate: { minDate: field.minDate, actual: value } } : null;
            });
        }

        if (field.maxDate) {
            validators.push(control => {
                const value = control.value as string | null;
                const currentDate = this.dateFormatService.parseDate(value, field.format);
                const maxDate = this.dateFormatService.parseDate(field.maxDate, field.format);

                if (!currentDate || !maxDate) {
                    return null;
                }

                return currentDate > maxDate ? { maxDate: { maxDate: field.maxDate, actual: value } } : null;
            });
        }

        return validators;
    }

    private getNumberRangeValidators(field: FormNumberField): ValidatorFn[] {
        const validators: ValidatorFn[] = [];

        if (field.min !== undefined) {
            validators.push(control => {
                const value = control.value as number | null;

                if (value === null || value === undefined) {
                    return null;
                }

                return value < field.min! ? { min: { min: field.min, actual: value } } : null;
            });
        }

        if (field.max !== undefined) {
            validators.push(control => {
                const value = control.value as number | null;

                if (value === null || value === undefined) {
                    return null;
                }

                return value > field.max! ? { max: { max: field.max, actual: value } } : null;
            });
        }

        return validators;
    }
}
