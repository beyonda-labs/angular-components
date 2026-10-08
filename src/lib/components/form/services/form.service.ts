import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { FormChipsField } from '../models/fields/form-chips-field.model';
import { FormDateField } from '../models/fields/form-date-field.model';
import { FormFileField, matchesAcceptPattern } from '../models/fields/form-file-field.model';
import { FormNumberField } from '../models/fields/form-number-field.model';
import { FormConfig } from '../models/form.model';
import { FormField, FormFieldType, FormValue } from '../models/form-field.model';
import { DateFormatService } from './date-format.service';
import { FormValidatorService } from './form-validator.service';

const EMPTY_VALUES: Partial<Record<FormFieldType, unknown>> = {
    [FormFieldType.Autocomplete]: '',
    [FormFieldType.Checkbox]: false,
    [FormFieldType.Chips]: [],
    [FormFieldType.Date]: '',
    [FormFieldType.File]: null,
    [FormFieldType.Number]: null,
    [FormFieldType.Password]: '',
    [FormFieldType.Radio]: '',
    [FormFieldType.Select]: '',
    [FormFieldType.Text]: '',
    [FormFieldType.TextVariable]: '',
    [FormFieldType.Textarea]: ''
};

@Injectable({
    providedIn: 'root'
})
export class FormService {
    private readonly dateFormatService = inject(DateFormatService);
    private readonly formValidatorService = inject(FormValidatorService);

    buildFormGroup<TValue>(config: FormConfig<TValue>): FormGroup {
        const initialValue = (config.initialValue ?? {}) as FormValue;
        const formGroup = new FormGroup({});

        for (const section of config.sections) {
            const sectionGroup = new FormGroup({});

            for (const row of section.rows) {
                for (const field of row.fields) {
                    const control = this.initFieldControl(field, initialValue[section.key]?.[field.key]);

                    if (control && !sectionGroup.contains(field.key)) {
                        sectionGroup.addControl(field.key, control);
                    }
                }
            }

            formGroup.addControl(section.key, sectionGroup);
        }

        return formGroup;
    }

    emptyValue(type: FormFieldType): unknown {
        return EMPTY_VALUES[type];
    }

    getCustomValidator(field: FormField): ValidatorFn | null {
        return Validators.compose(this.formValidatorService.getCustomValidators(field));
    }

    initFieldControl(field: FormField, initialValue?: unknown): FormControl | undefined {
        if (!(field.type in EMPTY_VALUES)) {
            return undefined;
        }

        return this.buildControl<unknown>(field, initialValue ?? EMPTY_VALUES[field.type]);
    }

    private buildControl<T>(field: FormField, value: T): FormControl<T> {
        return new FormControl<T>(
            { value, disabled: field.isDisabled === true },
            {
                asyncValidators: this.formValidatorService.getFieldAsyncValidators(field),
                nonNullable: false,
                validators: this.getValidators(field)
            }
        ) as FormControl<T>;
    }

    private getChipsValidators(field: FormChipsField): ValidatorFn[] {
        if (field.maxItems === undefined) {
            return [];
        }

        const { maxItems } = field;

        return [
            control => {
                const value = control.value as string[] | null;

                return value && value.length > maxItems ? { maxItems: { maxItems, actual: value.length } } : null;
            }
        ];
    }

    private getDateRangeValidators(field: FormDateField): ValidatorFn[] {
        const validators: ValidatorFn[] = [];
        const parse = (value?: string | null): Date | null => this.dateFormatService.parseDate(value, field.format);

        if (field.minDate) {
            validators.push(control => {
                const value = control.value as string | null;
                const currentDate = parse(value);
                const minDate = parse(field.minDate);

                return currentDate && minDate && currentDate < minDate
                    ? { minDate: { minDate: field.minDate, actual: value } }
                    : null;
            });
        }

        if (field.maxDate) {
            validators.push(control => {
                const value = control.value as string | null;
                const currentDate = parse(value);
                const maxDate = parse(field.maxDate);

                return currentDate && maxDate && currentDate > maxDate
                    ? { maxDate: { maxDate: field.maxDate, actual: value } }
                    : null;
            });
        }

        return validators;
    }

    private getFileValidators(field: FormFileField): ValidatorFn[] {
        const validators: ValidatorFn[] = [];

        if (field.maxSizeBytes !== undefined) {
            const { maxSizeBytes } = field;

            validators.push(control => {
                const file = control.value as File | null;

                return file && file.size > maxSizeBytes ? { maxSizeBytes: { maxSizeBytes, actual: file.size } } : null;
            });
        }

        if (field.accept.length > 0) {
            validators.push(control => {
                const file = control.value as File | null;

                return file && !field.accept.some(pattern => matchesAcceptPattern(pattern, file.type))
                    ? { accept: { accept: field.accept, actual: file.type } }
                    : null;
            });
        }

        return validators;
    }

    private getNumberRangeValidators(field: FormNumberField): ValidatorFn[] {
        const validators: ValidatorFn[] = [];

        if (field.min !== undefined) {
            const { min } = field;

            validators.push(control => {
                const value = control.value as number | null;

                return value !== null && value < min ? { min: { min, actual: value } } : null;
            });
        }

        if (field.max !== undefined) {
            const { max } = field;

            validators.push(control => {
                const value = control.value as number | null;

                return value !== null && value > max ? { max: { max, actual: value } } : null;
            });
        }

        return validators;
    }

    private getTypeValidators(field: FormField): ValidatorFn[] {
        switch (field.type) {
            case FormFieldType.Chips:
                return this.getChipsValidators(field as FormChipsField);
            case FormFieldType.Date:
                return this.getDateRangeValidators(field as FormDateField);
            case FormFieldType.File:
                return this.getFileValidators(field as FormFileField);
            case FormFieldType.Number:
                return this.getNumberRangeValidators(field as FormNumberField);
            default:
                return [];
        }
    }

    private getValidators(field: FormField): ValidatorFn[] {
        return [
            ...(field.isRequired === true ? [Validators.required] : []),
            ...this.formValidatorService.getFieldValidators(field),
            ...this.getTypeValidators(field)
        ];
    }
}
