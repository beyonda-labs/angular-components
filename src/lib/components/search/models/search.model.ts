import { Observable } from 'rxjs';

import { SearchFilter, SearchFilterOperator } from './search-filter.model';

export enum SearchFieldType {
    Autocomplete = 'autocomplete',
    Boolean = 'boolean',
    Date = 'date',
    Number = 'number',
    Select = 'select',
    Tags = 'tags',
    Text = 'text'
}

export const OPERATORS_BY_TYPE: Record<SearchFieldType, SearchFilterOperator[]> = {
    [SearchFieldType.Autocomplete]: [SearchFilterOperator.Equals, SearchFilterOperator.NotEquals],
    [SearchFieldType.Boolean]: [SearchFilterOperator.Equals, SearchFilterOperator.NotEquals],
    [SearchFieldType.Date]: [
        SearchFilterOperator.Between,
        SearchFilterOperator.GreaterThanOrEquals,
        SearchFilterOperator.LessThanOrEquals
    ],
    [SearchFieldType.Number]: [
        SearchFilterOperator.Equals,
        SearchFilterOperator.NotEquals,
        SearchFilterOperator.GreaterThan,
        SearchFilterOperator.GreaterThanOrEquals,
        SearchFilterOperator.LessThan,
        SearchFilterOperator.LessThanOrEquals,
        SearchFilterOperator.Between
    ],
    [SearchFieldType.Select]: [SearchFilterOperator.Equals, SearchFilterOperator.NotEquals],
    [SearchFieldType.Tags]: [SearchFilterOperator.Contains, SearchFilterOperator.NotContains],
    [SearchFieldType.Text]: [
        SearchFilterOperator.Contains,
        SearchFilterOperator.NotContains,
        SearchFilterOperator.Equals,
        SearchFilterOperator.NotEquals,
        SearchFilterOperator.StartsWith,
        SearchFilterOperator.EndsWith
    ]
};

export interface SearchFieldOption {
    label: string;
    value: string;
}

export interface SearchFieldOptionsResult {
    options: SearchFieldOption[];

    hasMore?: boolean;
}

export class SearchConfig {
    fields: SearchField[];
    filters: SearchFilter[];
    prefix: string;

    mainField?: string;
    onFiltersChange?: (filters: SearchFilter[]) => void;
    onPanelOpen?: () => void;
    placeholder?: string;

    constructor({
        fields,
        filters = [],
        mainField,
        onFiltersChange,
        onPanelOpen,
        placeholder,
        prefix
    }: SearchConfigParameters) {
        this.fields = fields;
        this.filters = filters;
        this.mainField = mainField;
        this.onFiltersChange = onFiltersChange;
        this.onPanelOpen = onPanelOpen;
        this.placeholder = placeholder;
        this.prefix = prefix;
    }
}

export class SearchField {
    key: string;
    type: SearchFieldType;

    label?: string;
    operators?: SearchFilterOperator[];
    options?: SearchFieldOption[];
    searchOptions?: (text: string) => Observable<SearchFieldOptionsResult>;

    constructor({ key, label, operators, options, searchOptions, type }: SearchFieldParameters) {
        this.key = key;
        this.label = label;
        this.operators = operators;
        this.options = options;
        this.searchOptions = searchOptions;
        this.type = type;
    }
}

export interface SearchConfigParameters {
    fields: SearchField[];
    prefix: string;

    filters?: SearchFilter[];
    mainField?: string;
    onFiltersChange?: (filters: SearchFilter[]) => void;
    onPanelOpen?: () => void;
    placeholder?: string;
}

export interface SearchFieldParameters {
    key: string;
    type: SearchFieldType;

    label?: string;
    operators?: SearchFilterOperator[];
    options?: SearchFieldOption[];
    searchOptions?: (text: string) => Observable<SearchFieldOptionsResult>;
}
