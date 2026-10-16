import { SearchFieldType } from '../../search/models/search.model';
import { SearchFilterOperator } from '../../search/models/search-filter.model';
import { pageDateRangeFields } from './page-date-range-filter';

describe('pageDateRangeFields', () => {
    it('builds a from and a to date field, each with the bound it stands for and the label of the page', () => {
        expect(pageDateRangeFields()).toEqual([
            expect.objectContaining({
                key: 'from',
                label: 'angular-components.page.search.fields.from',
                operators: [SearchFilterOperator.GreaterThanOrEquals],
                type: SearchFieldType.Date
            }),
            expect.objectContaining({
                key: 'to',
                label: 'angular-components.page.search.fields.to',
                operators: [SearchFilterOperator.LessThanOrEquals],
                type: SearchFieldType.Date
            })
        ]);
    });

    it('names the fields as the backend reads them', () => {
        expect(pageDateRangeFields('createdFrom', 'createdTo').map(({ key }) => key)).toEqual([
            'createdFrom',
            'createdTo'
        ]);
    });
});
