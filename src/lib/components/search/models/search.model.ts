import { SearchFilter, SearchFilterOperator } from './search-filter.model';

export enum SearchFieldType {
    Boolean = 'boolean',
    Number = 'number',
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
    [SearchFieldType.Text]: [
        SearchFilterOperator.Contains,
        SearchFilterOperator.NotContains,
        SearchFilterOperator.Equals,
        SearchFilterOperator.NotEquals,
        SearchFilterOperator.StartsWith,
        SearchFilterOperator.EndsWith
    ]
};

export class SearchField {
    key: string;
    type: SearchFieldType;

    constructor({ key, type }: SearchFieldParameters) {
        this.key = key;
        this.type = type;
    }

    getOperators(): SearchFilterOperator[] {
        return OPERATORS_BY_TYPE[this.type];
    }
}

export interface SearchFieldParameters {
    key: string;
    type: SearchFieldType;
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

export interface SearchConfigParameters {
    fields: SearchField[];
    prefix: string;

    mainField?: string;
    onFiltersChange?: (filters: SearchFilter[]) => void;
    placeholder?: string;
}
