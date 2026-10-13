import { Observable } from 'rxjs';

import { FormField, FormFieldBaseParameters, FormFieldOption, FormFieldType, FormRule } from '../form-field.model';

export type FormAutocompleteSearch = (
    text: string,
    excludedValues: string[]
) => Observable<FormAutocompleteSearchResult | FormFieldOption[]>;

export interface FormAutocompleteSearchResult {
    options: FormFieldOption[];

    hasMore?: boolean;
}

export class FormAutocompleteField extends FormField {
    excludedValues: FormRule<string[]>;
    isClearedOnSelect: boolean;
    isFreeTextAllowed: boolean;
    options: FormRule<FormFieldOption[]>;

    emptyKey?: string;
    filter?: (option: FormFieldOption, text: string) => boolean;
    onSelect?: (option: FormFieldOption) => void;
    search?: FormAutocompleteSearch;

    constructor({
        emptyKey,
        excludedValues = [],
        filter,
        isClearedOnSelect = false,
        isFreeTextAllowed = false,
        onSelect,
        options = [],
        search,
        ...base
    }: FormAutocompleteFieldParameters) {
        super({ ...base, type: FormFieldType.Autocomplete });

        this.emptyKey = emptyKey;
        this.excludedValues = excludedValues;
        this.filter = filter;
        this.isClearedOnSelect = isClearedOnSelect;
        this.isFreeTextAllowed = isFreeTextAllowed;
        this.onSelect = onSelect;
        this.options = options;
        this.search = search;
    }
}

export interface FormAutocompleteFieldParameters extends FormFieldBaseParameters {
    emptyKey?: string;
    excludedValues?: FormRule<string[]>;
    filter?: (option: FormFieldOption, text: string) => boolean;
    isClearedOnSelect?: boolean;
    isFreeTextAllowed?: boolean;
    onSelect?: (option: FormFieldOption) => void;
    options?: FormRule<FormFieldOption[]>;
    search?: FormAutocompleteSearch;
}
