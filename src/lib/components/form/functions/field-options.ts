import { FormAutocompleteField } from '../models/fields/form-autocomplete-field.model';
import { FormListField } from '../models/fields/form-list-field.model';
import { FormField, FormFieldOption, FormFieldType, FormRule } from '../models/form-field.model';
import { holdsListValue } from './list-value';

export function haveSameOptions(previous: FormFieldOption[], current: FormFieldOption[]): boolean {
    return (
        previous.length === current.length && previous.every((option, index) => option.value === current[index].value)
    );
}

export function isFreeText(field: FormField): boolean {
    return field.type === FormFieldType.Autocomplete && (field as FormAutocompleteField).isFreeTextAllowed;
}

export function offersOwnOptions(field: FormField): boolean {
    return holdsListValue(field) && !(field as FormListField).picker?.search;
}

export function ruleOf<T>(field: FormField, key: 'excludedValues' | 'options'): FormRule<T[]> {
    return (field as Partial<Record<typeof key, FormRule<T[]>>>)[key] ?? [];
}
