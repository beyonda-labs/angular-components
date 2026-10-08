import { OPERATORS_BY_TYPE, SearchFieldParameters } from '../models/search.model';
import { SearchFilterOperator } from '../models/search-filter.model';

export function searchFieldOperators({ type }: Pick<SearchFieldParameters, 'type'>): SearchFilterOperator[] {
    return [...OPERATORS_BY_TYPE[type]];
}
