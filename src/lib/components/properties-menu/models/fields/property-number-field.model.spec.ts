import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyNumberField } from './property-number-field.model';

describe('PropertyNumberField', () => {
    it('should apply default values for optional properties', () => {
        const field = new PropertyNumberField({ id: 'fontSize' });

        expect(field.placeholder).toBe('');
        expect(field.readonly).toBe(false);
        expect(field.max).toBeUndefined();
        expect(field.min).toBeUndefined();
        expect(field.step).toBeUndefined();
        expect(field.unit).toBeUndefined();
    });

    it('should keep the provided numeric constraints', () => {
        const field = new PropertyNumberField({ id: 'fontSize', max: 200, min: 1, step: 1, unit: 'px', value: 32 });

        expect(field.max).toBe(200);
        expect(field.min).toBe(1);
        expect(field.step).toBe(1);
        expect(field.unit).toBe('px');
        expect(field.value).toBe(32);
    });

    it('should fix the field type to "number"', () => {
        const field = new PropertyNumberField({ id: 'fontSize' });

        expect(field.type).toBe(PropertyFieldType.Number);
    });
});
