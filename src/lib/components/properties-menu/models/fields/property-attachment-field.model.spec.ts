import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyAttachmentField, PropertyAttachmentOption } from './property-attachment-field.model';

const buildField = (value?: string): PropertyAttachmentField =>
    new PropertyAttachmentField({
        id: 'logo',
        options: [
            new PropertyAttachmentOption({ id: 'attachment-1', label: 'logo.png' }),
            new PropertyAttachmentOption({ id: 'attachment-2', label: 'signature.png' })
        ],
        value
    });

describe('PropertyAttachmentField', () => {
    it('should fix the field type to "attachment"', () => {
        expect(buildField().type).toBe(PropertyFieldType.Attachment);
    });

    it('should resolve the selected option from the value', () => {
        expect(buildField('attachment-2').selectedOption?.label).toBe('signature.png');
    });

    it('should return no selected option for a value the catalog does not carry', () => {
        expect(buildField('attachment-missing').selectedOption).toBeUndefined();
    });

    it('should default to an empty catalog and no variables', () => {
        const field = new PropertyAttachmentField({ id: 'logo' });

        expect(field.options).toEqual([]);
        expect(field.variables).toEqual([]);
    });

    it('should tell a variable reference apart from an attachment id', () => {
        expect(buildField('{{ logo }}').holdsVariable).toBe(true);
        expect(buildField('attachment-1').holdsVariable).toBe(false);
    });
});
