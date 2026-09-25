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

    initFieldControl(field: FormField, initialValue?: unknown): FormControl | undefined {
        switch (field.type) {
            case FormFieldType.Autocomplete:
            case FormFieldType.Date:
            case FormFieldType.Password:
            case FormFieldType.Radio:
            case FormFieldType.Select:
            case FormFieldType.Text:
            case FormFieldType.TextVariable:
            case FormFieldType.Textarea:
                return this.buildControl<string | null>(field, (initialValue as string | null) ?? '');
            case FormFieldType.Checkbox:
                return this.buildControl<boolean | null>(field, (initialValue as boolean | null) ?? false);
            case FormFieldType.Chips:
                return this.buildControl<string[] | null>(field, (initialValue as string[] | null) ?? []);
            case FormFieldType.File:
                return this.buildControl<File | null>(field, (initialValue as File | null) ?? null);
            case FormFieldType.Number:
                return this.buildControl<number | null>(field, (initialValue as number | null) ?? null);
            default:
                return undefined;
        }
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

    private getValidators(field: FormField): ValidatorFn[] {
        return [
            ...(field.isRequired ? [Validators.required] : []),
            ...this.formValidatorService.getFieldValidators(field),
            ...this.getTypeValidators(field)
        ];
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
}
