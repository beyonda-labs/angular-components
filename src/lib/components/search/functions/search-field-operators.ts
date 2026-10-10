import { OPERATORS_BY_TYPE, SearchFieldParameters } from '../models/search.model';
import { SearchFilterOperator } from '../models/search-filter.model';

export function searchFieldOperators({
    operators,
    type
}: Pick<SearchFieldParameters, 'operators' | 'type'>): SearchFilterOperator[] {
    return OPERATORS_BY_TYPE[type].filter(operator => !operators || operators.includes(operator));
}
