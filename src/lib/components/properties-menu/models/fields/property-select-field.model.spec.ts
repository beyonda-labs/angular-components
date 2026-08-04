import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyOption } from '../property-option.model';
import { PropertySelectField } from './property-select-field.model';

describe('PropertySelectField', () => {
    it('should transform option configs into PropertyOption instances', () => {
        const field = new PropertySelectField({ id: 'font', options: [{ value: 'Inter' }, { value: 'Arial' }] });

        expect(field.options[0]).toBeInstanceOf(PropertyOption);
        expect(field.options).toHaveLength(2);
    });

    it('should reuse PropertyOption instances instead of rebuilding them', () => {
        const option = new PropertyOption({ value: 'Inter' });
        const field = new PropertySelectField({ id: 'font', options: [option] });

        expect(field.options[0]).toBe(option);
    });

    it('should default to an empty options list', () => {
        const field = new PropertySelectField({ id: 'font' });

        expect(field.options).toEqual([]);
    });

    it('should fix the field type to "select"', () => {
        const field = new PropertySelectField({ id: 'font' });

        expect(field.type).toBe(PropertyFieldType.Select);
    });
});
