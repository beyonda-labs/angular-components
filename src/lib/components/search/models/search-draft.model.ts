import { SearchField, SearchFieldOption } from './search.model';
import { SearchFilterOperator } from './search-filter.model';

export interface SearchDraftRow {
    fieldKey: string;
    operator: SearchFilterOperator | '';
    value: string;
    valueLabel: string;
    valueTo: string;
}

export interface SearchSuggestionRequest {
    field: SearchField;
    index: number;
    text: string;
}

export interface SearchSuggestions {
    hasMore: boolean;
    index: number;
    options: SearchFieldOption[];
}
