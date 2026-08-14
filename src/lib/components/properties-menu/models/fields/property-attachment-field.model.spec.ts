import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyAttachmentField, PropertyAttachmentOption } from './property-attachment-field.model';

const buildField = (value?: string): PropertyAttachmentField =>
    new PropertyAttachmentField({
        id: 'logo',
        value,
        options: [
            { id: 'attachment-1', label: 'logo.png' },
            { id: 'attachment-2', label: 'signature.png' }
        ]
    });

describe('PropertyAttachmentField', () => {
    it('should fix the field type to "attachment"', () => {
        expect(buildField().type).toBe(PropertyFieldType.Attachment);
    });

    it('should transform option configs into PropertyAttachmentOption instances', () => {
        expect(buildField().options[0]).toBeInstanceOf(PropertyAttachmentOption);
    });

    it('should resolve the selected option from the value', () => {
        expect(buildField('attachment-2')?.selectedOption?.label).toBe('signature.png');
    });

    it('should return no selected option for a value the catalog does not carry', () => {
        expect(buildField('attachment-missing').selectedOption).toBeUndefined();
    });

    it('should default to an empty catalog', () => {
        expect(new PropertyAttachmentField({ id: 'logo' }).options).toEqual([]);
    });
});
