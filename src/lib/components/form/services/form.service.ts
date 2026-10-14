import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { matchesAcceptPattern } from '../../../internal/file/accept-pattern';
import { haveSameOptions } from '../functions/field-options';
import { holdsListValue } from '../functions/list-value';
import { passwordPolicyValidator } from '../functions/password-rules';
import { FormChipsField } from '../models/fields/form-chips-field.model';
import { FormDateField } from '../models/fields/form-date-field.model';
import { FormFileField } from '../models/fields/form-file-field.model';
import { FormNumberField } from '../models/fields/form-number-field.model';
import { FormPasswordField } from '../models/fields/form-password-field.model';
import { FormConfig } from '../models/form.model';
import { FormField, FormFieldType, FormValue } from '../models/form-field.model';
import { FormFieldState } from '../models/form-field-state.model';
import { DateFormatService } from './date-format.service';
import { FormValidatorService } from './form-validator.service';

const EMPTY_VALUES: Partial<Record<FormFieldType, unknown>> = {
    [FormFieldType.Autocomplete]: '',
    [FormFieldType.Checkbox]: false,
    [FormFieldType.CheckboxGroup]: [],
    [FormFieldType.CheckboxSections]: [],
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

    dropUnlistedIds(control: AbstractControl, state: FormFieldState, previous: FormFieldState | undefined): void {
        const ids: unknown = control.value;

        if (!previous || !Array.isArray(ids) || haveSameOptions(previous.options, state.options)) {
            return;
        }

        const listed = ids.filter(id => state.options.some(option => option.value === id));

        if (listed.length !== ids.length) {
            control.setValue(listed);
        }
    }

    emptyValue(type: FormFieldType): unknown {
        return EMPTY_VALUES[type];
    }

    getCustomValidator(field: FormField): ValidatorFn | null {
        return Validators.compose([
            ...this.formValidatorService.getCustomValidators(field),
            ...getPasswordValidators(field)
        ]);
    }

    initFieldControl(field: FormField, initialValue?: unknown): FormControl | undefined {
        if (holdsListValue(field)) {
            return this.buildControl<unknown>(field, initialValue ?? []);
        }

        if (!(field.type in EMPTY_VALUES)) {
            return undefined;
        }

        return this.buildControl<unknown>(field, initialValue ?? EMPTY_VALUES[field.type]);
    }

    syncDisabled(control: AbstractControl, state: Pick<FormFieldState, 'isDisabled' | 'isHidden'>): void {
        const shouldDisable = state.isDisabled || state.isHidden;

        if (control.disabled === shouldDisable) {
            return;
        }

        if (shouldDisable) {
            control.disable();
        } else {
            control.enable();
        }
    }

    syncRequired(control: AbstractControl, isRequired: boolean): void {
        if (control.hasValidator(Validators.required) === isRequired) {
            return;
        }

        if (isRequired) {
            control.addValidators(Validators.required);
        } else {
            control.removeValidators(Validators.required);
        }

        control.updateValueAndValidity();
    }

    syncValidatorErrors(
        control: AbstractControl,
        errors: ValidationErrors | null,
        previous: ValidationErrors | null
    ): void {
        const current = Object.keys(errors ?? {});
        const cleared = Object.keys(previous ?? {}).filter(key => !current.includes(key));
        const isApplied = current.every(key => control.hasError(key)) && cleared.every(key => !control.hasError(key));

        if (control.enabled && !isApplied) {
            control.updateValueAndValidity();
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

    private getTypeValidators(field: FormField): ValidatorFn[] {
        switch (field.type) {
            case FormFieldType.Chips:
                return getChipsValidators(field as FormChipsField);
            case FormFieldType.Date:
                return this.getDateRangeValidators(field as FormDateField);
            case FormFieldType.File:
                return getFileValidators(field as FormFileField);
            case FormFieldType.Number:
                return getNumberRangeValidators(field as FormNumberField);
            case FormFieldType.Password:
                return getPasswordValidators(field);
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

function getChipsValidators(field: FormChipsField): ValidatorFn[] {
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

function getFileValidators(field: FormFileField): ValidatorFn[] {
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

function getNumberRangeValidators(field: FormNumberField): ValidatorFn[] {
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

function getPasswordValidators(field: FormField): ValidatorFn[] {
    const { policy } = field as FormPasswordField;

    return field.type === FormFieldType.Password && policy ? [passwordPolicyValidator(policy)] : [];
}
