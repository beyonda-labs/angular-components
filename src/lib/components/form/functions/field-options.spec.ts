import { of } from 'rxjs';

import { FormAutocompleteField } from '../models/fields/form-autocomplete-field.model';
import { FormListField } from '../models/fields/form-list-field.model';
import { FormSelectField } from '../models/fields/form-select-field.model';
import { FormTextField } from '../models/fields/form-text-field.model';
import { haveSameOptions, isFreeText, offersOwnOptions, ruleOf } from './field-options';

describe('field-options', () => {
    describe('haveSameOptions', () => {
        it('tells options with the same values in the same order from any other list', () => {
            const options = [
                { label: 'Europe', value: 'eu' },
                { label: 'Asia', value: 'asia' }
            ];

            expect(haveSameOptions(options, [{ label: 'Europa', value: 'eu' }, options[1]])).toBe(true);
            expect(haveSameOptions(options, [...options].reverse())).toBe(false);
            expect(haveSameOptions(options, [options[0]])).toBe(false);
        });
    });

    describe('isFreeText', () => {
        it('tells an autocomplete that takes what is typed from any other field', () => {
            expect(isFreeText(new FormAutocompleteField({ key: 'city', isFreeTextAllowed: true }))).toBe(true);
            expect(isFreeText(new FormAutocompleteField({ key: 'city' }))).toBe(false);
            expect(isFreeText(new FormSelectField({ key: 'city' }))).toBe(false);
        });
    });

    describe('offersOwnOptions', () => {
        it('tells a list that holds ids from its own options from one fed by a search, or one that only shows', () => {
            expect(offersOwnOptions(new FormListField({ key: 'roles', options: [] }))).toBe(true);
            expect(offersOwnOptions(new FormListField({ key: 'roles', picker: {} }))).toBe(true);
            expect(offersOwnOptions(new FormListField({ key: 'people', picker: { search: () => of([]) } }))).toBe(
                false
            );
            expect(offersOwnOptions(new FormListField({ items: ['Invoice'], key: 'usedBy' }))).toBe(false);
        });
    });

    describe('ruleOf', () => {
        it('reads the options or the excluded values of a field, or none when it has no such rule', () => {
            const options = [{ label: 'Europe', value: 'eu' }];

            expect(ruleOf(new FormSelectField({ key: 'region', options }), 'options')).toBe(options);
            expect(
                ruleOf(new FormAutocompleteField({ excludedValues: ['eu'], key: 'region' }), 'excludedValues')
            ).toEqual(['eu']);
            expect(ruleOf(new FormTextField({ key: 'name' }), 'options')).toEqual([]);
        });
    });
});
