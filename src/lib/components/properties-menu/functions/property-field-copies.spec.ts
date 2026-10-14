import { PropertyAttachmentField } from '../models/fields/property-attachment-field.model';
import { PropertyTextField } from '../models/fields/property-text-field.model';
import { PropertyToggleField } from '../models/fields/property-toggle-field.model';
import { propertyFieldWithDisabled, propertyFieldWithValue } from './property-field-copies';

describe('property-field-copies', () => {
    describe('propertyFieldWithDisabled', () => {
        it('returns a disabled copy of the same subclass, leaving the original enabled', () => {
            const field = new PropertyTextField({ id: 'text', placeholder: 'Enter text', value: 'FACTURA' });
            const disabled = propertyFieldWithDisabled(field);

            expect(disabled).toBeInstanceOf(PropertyTextField);
            expect([disabled.isDisabled, disabled.value, disabled.placeholder]).toEqual([
                true,
                'FACTURA',
                'Enter text'
            ]);
            expect(field.isDisabled).toBe(false);
            expect(propertyFieldWithDisabled(disabled, false).isDisabled).toBe(false);
        });
    });

    describe('propertyFieldWithValue', () => {
        it('returns a new instance with the updated value, of the same subclass', () => {
            const field = new PropertyTextField({ id: 'text', placeholder: 'Enter text', value: 'FACTURA' });
            const updated = propertyFieldWithValue(field, 'NUEVO TEXTO');

            expect(updated).not.toBe(field);
            expect(updated).toBeInstanceOf(PropertyTextField);
            expect(updated.value).toBe('NUEVO TEXTO');
            expect(updated.placeholder).toBe('Enter text');
            expect(field.value).toBe('FACTURA');
        });

        it('works for any concrete subclass', () => {
            const updated = propertyFieldWithValue(new PropertyToggleField({ id: 'visible', value: false }), true);

            expect(updated).toBeInstanceOf(PropertyToggleField);
            expect(updated.value).toBe(true);
        });

        it('keeps what the subclass adds, such as the upload of an attachment field turned off', () => {
            const field = new PropertyAttachmentField({ id: 'logo', isUploadEnabled: false });

            expect(propertyFieldWithValue(field, 'attachment-1').isUploadEnabled).toBe(false);
        });
    });
});
