import { SearchFilterOperator, StringFilter } from '../../search/models/search-filter.model';
import { PageSearch } from '../models/page-search.model';
import { withSearchText } from './page-search-text';

describe('withSearchText', () => {
    const status = new StringFilter({ field: 'status', operator: SearchFilterOperator.Equals, value: 'active' });

    function buildSearch(text?: string): PageSearch {
        return {
            filters: [status, ...(text === undefined ? [] : [new StringFilter({ field: 'text', value: text })])],
            page: 1,
            size: 25
        };
    }

    it('sends the filter of the text field as the text of the search, leaving the other filters as they are', () => {
        expect(withSearchText(buildSearch(' ada '), 'text')).toEqual({
            filters: [status],
            page: 1,
            size: 25,
            text: 'ada'
        });
    });

    it('drops a blank filter of the text field without sending a text', () => {
        expect(withSearchText(buildSearch('  '), 'text')).toEqual({ filters: [status], page: 1, size: 25 });
    });

    it('leaves the search as it is without a text field', () => {
        const search = buildSearch('ada');

        expect(withSearchText(search)).toBe(search);
    });
});
