import { PropertyTextField } from './fields/property-text-field.model';

describe('PropertyField', () => {
    it('applies the defaults of the optional properties', () => {
        const field = new PropertyTextField({ id: 'text' });

        expect(field.canAcceptVariable).toBe(false);
        expect(field.isDisabled).toBe(false);
        expect(field.isHidden).toBe(false);
        expect(field.label).toBe('text.label');
        expect(field.isRequired).toBe(false);
    });

    it('falls back to defaultValue when no value is given', () => {
        const field = new PropertyTextField({ id: 'text', defaultValue: 'FACTURA' });

        expect(field.value).toBe('FACTURA');
    });

    it('keeps an explicit value over defaultValue', () => {
        const field = new PropertyTextField({ id: 'text', defaultValue: 'FACTURA', value: 'custom' });

        expect(field.value).toBe('custom');
    });
});
