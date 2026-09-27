import { PropertyFieldType } from '../property-field-type.model';
import { PropertyOption } from '../property-option.model';
import { PropertySelectField } from './property-select-field.model';

describe('PropertySelectField', () => {
    it('should keep the options it is given', () => {
        const option = new PropertyOption({ value: 'Inter' });
        const field = new PropertySelectField({ id: 'font', options: [option] });

        expect(field.options[0]).toBe(option);
    });

    it('should default to an empty options list and no variables', () => {
        const field = new PropertySelectField({ id: 'font' });

        expect(field.options).toEqual([]);
        expect(field.variables).toEqual([]);
    });

    it('should fix the field type to "select"', () => {
        expect(new PropertySelectField({ id: 'font' }).type).toBe(PropertyFieldType.Select);
    });

    it('should not be searchable unless asked', () => {
        expect(new PropertySelectField({ id: 'font' }).searchable).toBe(false);
        expect(new PropertySelectField({ id: 'font', searchable: true }).searchable).toBe(true);
    });

    it('should tell a variable reference apart from an option value', () => {
        expect(new PropertySelectField({ id: 'font', value: '{{ font }}' }).holdsVariable).toBe(true);
        expect(new PropertySelectField({ id: 'font', value: 'Inter' }).holdsVariable).toBe(false);
    });
});
