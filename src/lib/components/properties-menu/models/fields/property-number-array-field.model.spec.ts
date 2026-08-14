import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyNumberArrayField } from './property-number-array-field.model';

describe('PropertyNumberArrayField', () => {
    it('should apply default values for optional properties', () => {
        const field = new PropertyNumberArrayField({ id: 'widths' });

        expect(field.entryDefaultValue).toBe(1);
        expect(field.minLength).toBe(0);
        expect(field.max).toBeUndefined();
        expect(field.maxLength).toBeUndefined();
        expect(field.min).toBeUndefined();
        expect(field.step).toBeUndefined();
    });

    it('should keep the provided constraints and value', () => {
        const field = new PropertyNumberArrayField({
            id: 'widths',
            entryDefaultValue: 2,
            max: 10,
            maxLength: 6,
            min: 0.01,
            minLength: 1,
            step: 0.5,
            value: [1, 1, 2]
        });

        expect(field.entryDefaultValue).toBe(2);
        expect(field.max).toBe(10);
        expect(field.maxLength).toBe(6);
        expect(field.min).toBe(0.01);
        expect(field.minLength).toBe(1);
        expect(field.step).toBe(0.5);
        expect(field.value).toEqual([1, 1, 2]);
    });

    it('should fix the field type to "numberArray"', () => {
        const field = new PropertyNumberArrayField({ id: 'widths' });

        expect(field.type).toBe(PropertyFieldType.NumberArray);
    });
});
