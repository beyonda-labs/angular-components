import { SearchConfig, SearchField, SearchFieldType } from '../models/search.model';
import { SearchDraftRow } from '../models/search-draft.model';
import { BooleanFilter, NumberFilter, SearchFilterOperator, StringFilter } from '../models/search-filter.model';
import {
    emptySearchRow,
    findMainTerm,
    isSearchRowValid,
    searchLabelKey,
    searchTermOf,
    toSearchDraftRow,
    toSearchFilter
} from './search-draft-rows';

const AUTHOR = new SearchField({
    key: 'author',
    options: [{ label: 'Ada', value: '7' }],
    type: SearchFieldType.Autocomplete
});
const CREATED = new SearchField({ key: 'created', type: SearchFieldType.Date });
const NAME = new SearchField({ key: 'name', type: SearchFieldType.Text });
const PRICE = new SearchField({ key: 'price', type: SearchFieldType.Number });
const PUBLISHED = new SearchField({ key: 'published', type: SearchFieldType.Boolean });
const FIELDS = [AUTHOR, CREATED, NAME, PRICE, PUBLISHED];

function buildRow(overrides: Partial<SearchDraftRow> = {}): SearchDraftRow {
    return { ...emptySearchRow('name', SearchFilterOperator.Contains), ...overrides };
}

describe('search-draft-rows', () => {
    it('reads the main term from a filter of a text field and nothing from other types', () => {
        const filters = [new StringFilter({ field: 'name', operator: SearchFilterOperator.Contains, value: 'deed' })];

        expect(findMainTerm(new SearchConfig({ fields: FIELDS, filters, mainField: 'name', prefix: 'p' }))).toBe(
            'deed'
        );
        expect(findMainTerm(new SearchConfig({ fields: FIELDS, filters, mainField: 'author', prefix: 'p' }))).toBe('');
    });

    it('accepts a row only with an operator and a value its type can read', () => {
        expect(isSearchRowValid(buildRow({ value: 'deed' }), NAME)).toBe(true);
        expect(isSearchRowValid(buildRow({ value: '  ' }), NAME)).toBe(false);
        expect(isSearchRowValid(buildRow({ operator: '', value: 'deed' }), NAME)).toBe(false);
        expect(isSearchRowValid(buildRow({ value: 'deed' }), undefined)).toBe(false);
        expect(isSearchRowValid(buildRow({ operator: SearchFilterOperator.Equals, value: 'maybe' }), PUBLISHED)).toBe(
            false
        );
        expect(
            isSearchRowValid(buildRow({ operator: SearchFilterOperator.Between, value: '1', valueTo: 'x' }), PRICE)
        ).toBe(false);
        expect(
            isSearchRowValid(
                buildRow({ operator: SearchFilterOperator.Between, value: '2026-10-01', valueTo: '2026-10-31' }),
                CREATED
            )
        ).toBe(true);
    });

    it('builds the filter of each type from a row', () => {
        expect(toSearchFilter(buildRow({ value: ' deed ' }), NAME)).toEqual(
            new StringFilter({ field: 'name', operator: SearchFilterOperator.Contains, value: 'deed' })
        );
        expect(toSearchFilter(buildRow({ operator: SearchFilterOperator.Equals, value: 'true' }), PUBLISHED)).toEqual(
            new BooleanFilter({ field: 'published', operator: SearchFilterOperator.Equals, value: true })
        );
        expect(
            toSearchFilter(buildRow({ operator: SearchFilterOperator.Between, value: '1', valueTo: '5' }), PRICE)
        ).toEqual(new NumberFilter({ field: 'price', operator: SearchFilterOperator.Between, value: [1, 5] }));
        expect(
            toSearchFilter(buildRow({ operator: SearchFilterOperator.LessThanOrEquals, value: '2026-10-13' }), CREATED)
        ).toEqual(
            new NumberFilter({
                field: 'created',
                operator: SearchFilterOperator.LessThanOrEquals,
                value: new Date(2026, 9, 14).getTime() - 1
            })
        );
    });

    it('turns a filter back into a row, naming a picked option by its label', () => {
        const filter = new StringFilter({ field: 'author', operator: SearchFilterOperator.Equals, value: '8' });

        expect(toSearchDraftRow(filter, FIELDS, new Map([[searchLabelKey('author', '8'), 'Grace']]))).toEqual({
            ...emptySearchRow('author', SearchFilterOperator.Equals),
            value: '8',
            valueLabel: 'Grace'
        });
        expect(toSearchDraftRow({ ...filter, value: '7' } as StringFilter, FIELDS, new Map()).valueLabel).toBe('Ada');
    });

    it('turns a date filter back into the days of the date inputs', () => {
        const filter = new NumberFilter({
            field: 'created',
            operator: SearchFilterOperator.Between,
            value: [new Date(2026, 9, 1).getTime(), new Date(2026, 9, 31, 23, 59).getTime()]
        });

        expect(toSearchDraftRow(filter, FIELDS, new Map())).toEqual({
            ...emptySearchRow('created', SearchFilterOperator.Between),
            value: '2026-10-01',
            valueTo: '2026-10-31'
        });
    });

    it('gives the main term of a row only for the types the search box holds', () => {
        expect(searchTermOf(buildRow({ value: 'deed' }), NAME)).toBe('deed');
        expect(searchTermOf(buildRow({ value: '7' }), AUTHOR)).toBe('');
        expect(searchTermOf(undefined, NAME)).toBe('');
    });
});
