import { acceptedMimeTypes } from './attachment-accept';

describe('acceptedMimeTypes', () => {
    it('splits an accept list into its trimmed patterns', () => {
        expect(acceptedMimeTypes('image/png, image/* ,application/pdf')).toEqual([
            'image/png',
            'image/*',
            'application/pdf'
        ]);
    });

    it('gives no pattern for no list, an empty one or empty entries', () => {
        expect(acceptedMimeTypes(undefined)).toEqual([]);
        expect(acceptedMimeTypes('')).toEqual([]);
        expect(acceptedMimeTypes(' , ')).toEqual([]);
    });
});
