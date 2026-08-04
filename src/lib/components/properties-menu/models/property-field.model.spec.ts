import { PropertyTextField } from './fields/property-text-field.model';
import { PropertyToggleField } from './fields/property-toggle-field.model';

describe('PropertyField', () => {
    it('should apply default values for optional properties', () => {
        const field = new PropertyTextField({ id: 'text' });

        expect(field.acceptsVariable).toBe(false);
        expect(field.disabled).toBe(false);
        expect(field.hidden).toBe(false);
        expect(field.label).toBe('text.label');
        expect(field.required).toBe(false);
    });

    it('should fall back to defaultValue when value is not provided', () => {
        const field = new PropertyTextField({ id: 'text', defaultValue: 'FACTURA' });

        expect(field.value).toBe('FACTURA');
    });

    it('should keep an explicit value over defaultValue', () => {
        const field = new PropertyTextField({ id: 'text', defaultValue: 'FACTURA', value: 'custom' });

        expect(field.value).toBe('custom');
    });

    describe('withValue', () => {
        it('should return a new instance with the updated value, preserving the concrete subclass', () => {
            const field = new PropertyTextField({ id: 'text', placeholder: 'Enter text', value: 'FACTURA' });
            const updated = field.withValue('NUEVO TEXTO');

            expect(updated).not.toBe(field);
            expect(updated).toBeInstanceOf(PropertyTextField);
            expect(updated.value).toBe('NUEVO TEXTO');
            expect(updated.placeholder).toBe('Enter text');
            expect(field.value).toBe('FACTURA');
        });

        it('should work for any concrete subclass', () => {
            const field = new PropertyToggleField({ id: 'visible', value: false });
            const updated = field.withValue(true);

            expect(updated).toBeInstanceOf(PropertyToggleField);
            expect(updated.value).toBe(true);
        });
    });
});
