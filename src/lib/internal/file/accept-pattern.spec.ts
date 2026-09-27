import { isAcceptedMimeType, matchesAcceptPattern } from './accept-pattern';

describe('accept-pattern', () => {
    it('matches an exact type and a wildcard family', () => {
        expect(matchesAcceptPattern('application/pdf', 'application/pdf')).toBe(true);
        expect(matchesAcceptPattern('image/*', 'image/png')).toBe(true);
        expect(matchesAcceptPattern('image/*', 'application/pdf')).toBe(false);
    });

    it('accepts any type when the list is empty, and only the listed ones otherwise', () => {
        expect(isAcceptedMimeType([], 'text/plain')).toBe(true);
        expect(isAcceptedMimeType(['image/*', 'application/pdf'], 'application/pdf')).toBe(true);
        expect(isAcceptedMimeType(['image/*'], 'text/plain')).toBe(false);
    });
});
