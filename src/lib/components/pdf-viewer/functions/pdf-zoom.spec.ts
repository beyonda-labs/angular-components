import { toZoomFactor } from './pdf-zoom';

describe('toZoomFactor', () => {
    it('keeps a numeric zoom as its factor', () => {
        expect(toZoomFactor(1.5)).toBe(1.5);
    });

    it('starts a named zoom from a factor of one', () => {
        expect(toZoomFactor('page-width')).toBe(1);
        expect(toZoomFactor('auto')).toBe(1);
    });
});
