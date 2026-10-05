import { fieldErrorOf } from './field-error';

describe('fieldErrorOf', () => {
    it('returns the first error that carries a message key', () => {
        expect(
            fieldErrorOf({
                required: true,
                duplicate: { messageKey: 'app.files.duplicate', messageParameters: { name: 'Logo' } }
            })
        ).toEqual({ messageKey: 'app.files.duplicate', messageParameters: { name: 'Logo' } });
    });

    it('returns null when no error carries a message key', () => {
        expect(fieldErrorOf({ required: true, maxlength: { requiredLength: 3 } })).toBeNull();
        expect(fieldErrorOf(null)).toBeNull();
    });
});
