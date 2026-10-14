import { PropertyFieldType } from '../property-field-type.model';
import { PropertyAttachmentField } from './property-attachment-field.model';

describe('PropertyAttachmentField', () => {
    it('fixes the field type to "attachment"', () => {
        expect(new PropertyAttachmentField({ id: 'logo' }).type).toBe(PropertyFieldType.Attachment);
    });

    it('defaults to an empty catalog, no variables and the upload enabled', () => {
        const field = new PropertyAttachmentField({ id: 'logo' });

        expect(field.isUploadEnabled).toBe(true);
        expect(field.options).toEqual([]);
        expect(field.variables).toEqual([]);
    });
});
