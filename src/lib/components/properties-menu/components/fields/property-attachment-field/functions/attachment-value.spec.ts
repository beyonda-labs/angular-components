import { PropertyAttachmentOption } from '../../../../models/fields/property-attachment-field.model';
import { isUnresolvedAttachment, isVariableReference, selectedAttachmentOption } from './attachment-value';

describe('attachment-value', () => {
    const options = [
        new PropertyAttachmentOption({ id: 'attachment-1', label: 'logo.png' }),
        new PropertyAttachmentOption({ id: 'attachment-2', label: 'signature.png' })
    ];

    describe('isUnresolvedAttachment', () => {
        it('flags an id that none of the options is', () => {
            expect(isUnresolvedAttachment({ options, value: 'attachment-missing' })).toBe(true);
        });

        it('does not flag a listed id, a variable reference, an empty value or a field without options', () => {
            expect(isUnresolvedAttachment({ options, value: 'attachment-1' })).toBe(false);
            expect(isUnresolvedAttachment({ options, value: '{{ logo }}' })).toBe(false);
            expect(isUnresolvedAttachment({ options, value: ' ' })).toBe(false);
            expect(isUnresolvedAttachment({ options: [], value: 'attachment-missing' })).toBe(false);
        });
    });

    describe('isVariableReference', () => {
        it('tells a variable reference apart from an attachment id', () => {
            expect(isVariableReference(' {{ logo }}')).toBe(true);
            expect(isVariableReference('attachment-1')).toBe(false);
            expect(isVariableReference(undefined)).toBe(false);
        });
    });

    describe('selectedAttachmentOption', () => {
        it('resolves the option the value names', () => {
            expect(selectedAttachmentOption({ options, value: 'attachment-2' })?.label).toBe('signature.png');
        });

        it('returns no option for a value the options do not carry', () => {
            expect(selectedAttachmentOption({ options, value: 'attachment-missing' })).toBeUndefined();
        });
    });
});
