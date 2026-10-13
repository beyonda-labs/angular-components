import { FormListField } from '../models/fields/form-list-field.model';
import { FormTextField } from '../models/fields/form-text-field.model';
import { holdsListValue } from './list-value';

describe('list value', () => {
    it('tells a list field given options or a picker, which holds a value, from one that only shows its items', () => {
        expect(holdsListValue(new FormListField({ key: 'members', options: [] }))).toBe(true);
        expect(holdsListValue(new FormListField({ key: 'members', picker: {} }))).toBe(true);
        expect(holdsListValue(new FormListField({ items: ['Invoice'], key: 'usedBy' }))).toBe(false);
        expect(holdsListValue(new FormTextField({ key: 'name' }))).toBe(false);
    });
});
