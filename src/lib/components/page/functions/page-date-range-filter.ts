import { SearchField, SearchFieldType } from '../../search/models/search.model';
import { SearchFilterOperator } from '../../search/models/search-filter.model';
import {
    PAGE_DATE_RANGE_FROM_FIELD,
    PAGE_DATE_RANGE_FROM_LABEL,
    PAGE_DATE_RANGE_TO_FIELD,
    PAGE_DATE_RANGE_TO_LABEL
} from '../models/page-date-range.model';

export function pageDateRangeFields(
    fromKey: string = PAGE_DATE_RANGE_FROM_FIELD,
    toKey: string = PAGE_DATE_RANGE_TO_FIELD
): SearchField[] {
    return [
        new SearchField({
            key: fromKey,
            label: PAGE_DATE_RANGE_FROM_LABEL,
            operators: [SearchFilterOperator.GreaterThanOrEquals],
            type: SearchFieldType.Date
        }),
        new SearchField({
            key: toKey,
            label: PAGE_DATE_RANGE_TO_LABEL,
            operators: [SearchFilterOperator.LessThanOrEquals],
            type: SearchFieldType.Date
        })
    ];
}
