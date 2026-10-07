import { SearchField, SearchFieldType } from '../models/search.model';
import { SearchFilterOperator } from '../models/search-filter.model';
import { searchFieldOperators } from './search-field-operators';

describe('searchFieldOperators', () => {
    it('offers only equality to boolean and select fields', () => {
        const equality = [SearchFilterOperator.Equals, SearchFilterOperator.NotEquals];

        expect(searchFieldOperators({ type: SearchFieldType.Boolean })).toEqual(equality);
        expect(searchFieldOperators({ type: SearchFieldType.Select })).toEqual(equality);
    });

    it('offers comparisons and between to number fields, equality first', () => {
        expect(searchFieldOperators({ type: SearchFieldType.Number })).toEqual([
            SearchFilterOperator.Equals,
            SearchFilterOperator.NotEquals,
            SearchFilterOperator.GreaterThan,
            SearchFilterOperator.GreaterThanOrEquals,
            SearchFilterOperator.LessThan,
            SearchFilterOperator.LessThanOrEquals,
            SearchFilterOperator.Between
        ]);
    });

    it('offers whole-element matching to tags fields', () => {
        expect(searchFieldOperators({ type: SearchFieldType.Tags })).toEqual([
            SearchFilterOperator.Contains,
            SearchFilterOperator.NotContains
        ]);
    });

    it('offers matching and equality to text fields, contains first', () => {
        expect(searchFieldOperators(new SearchField({ key: 'name', type: SearchFieldType.Text }))).toEqual([
            SearchFilterOperator.Contains,
            SearchFilterOperator.NotContains,
            SearchFilterOperator.Equals,
            SearchFilterOperator.NotEquals,
            SearchFilterOperator.StartsWith,
            SearchFilterOperator.EndsWith
        ]);
    });

    it('returns a new list each time, so changing it leaves the next call intact', () => {
        const first = searchFieldOperators({ type: SearchFieldType.Boolean });

        first.pop();

        expect(searchFieldOperators({ type: SearchFieldType.Boolean })).toEqual([
            SearchFilterOperator.Equals,
            SearchFilterOperator.NotEquals
        ]);
    });
});
