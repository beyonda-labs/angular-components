import { PropertyFieldType } from '../property-field-type.model';
import { PropertyOption } from '../property-option.model';
import { PropertySelectField } from './property-select-field.model';

describe('PropertySelectField', () => {
    it('keeps the options it is given', () => {
        const option = new PropertyOption({ value: 'Inter' });
        const field = new PropertySelectField({ id: 'font', options: [option] });

        expect(field.options[0]).toBe(option);
    });

    it('defaults to an empty options list and no variables', () => {
        const field = new PropertySelectField({ id: 'font' });

        expect(field.options).toEqual([]);
        expect(field.variables).toEqual([]);
    });

    it('fixes the field type to "select"', () => {
        expect(new PropertySelectField({ id: 'font' }).type).toBe(PropertyFieldType.Select);
    });

    it('is not searchable unless asked', () => {
        expect(new PropertySelectField({ id: 'font' }).isSearchable).toBe(false);
        expect(new PropertySelectField({ id: 'font', isSearchable: true }).isSearchable).toBe(true);
    });
});
