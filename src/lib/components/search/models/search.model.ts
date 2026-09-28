import { SearchFilter, SearchFilterOperator } from './search-filter.model';

export enum SearchFieldType {
    Boolean = 'boolean',
    Number = 'number',
    Select = 'select',
    Tags = 'tags',
    Text = 'text'
}

const OPERATORS_BY_TYPE: Record<SearchFieldType, SearchFilterOperator[]> = {
    [SearchFieldType.Boolean]: [SearchFilterOperator.Equals, SearchFilterOperator.NotEquals],
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

export class SearchConfig {
    fields: SearchField[];
    prefix: string;

    mainField?: string;
    onFiltersChange?: (filters: SearchFilter[]) => void;
    placeholder?: string;

    constructor({ fields, prefix, mainField, onFiltersChange, placeholder }: SearchConfigParameters) {
        this.fields = fields;
        this.mainField = mainField;
        this.onFiltersChange = onFiltersChange;
        this.placeholder = placeholder;
        this.prefix = prefix;
    }
}

export class SearchField {
    key: string;
    type: SearchFieldType;

    options?: SearchFieldOption[];

    constructor({ key, type, options }: SearchFieldParameters) {
        this.key = key;
        this.options = options;
        this.type = type;
    }

    getOperators(): SearchFilterOperator[] {
        return OPERATORS_BY_TYPE[this.type];
    }
}

export interface SearchConfigParameters {
    fields: SearchField[];
    prefix: string;

    mainField?: string;
    onFiltersChange?: (filters: SearchFilter[]) => void;
    placeholder?: string;
}

export interface SearchFieldParameters {
    key: string;
    type: SearchFieldType;

    options?: SearchFieldOption[];
}
