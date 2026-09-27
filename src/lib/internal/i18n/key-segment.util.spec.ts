import { toKeySegment } from './key-segment.util';

describe('toKeySegment', () => {
    it('turns a camelCase identifier into kebab-case', () => {
        expect(toKeySegment('valueString')).toBe('value-string');
        expect(toKeySegment('fileTypeName')).toBe('file-type-name');
    });

    it('turns a PascalCase identifier into kebab-case', () => {
        expect(toKeySegment('ValueString')).toBe('value-string');
    });

    it('keeps an identifier that is already a key segment', () => {
        expect(toKeySegment('value-string')).toBe('value-string');
        expect(toKeySegment('name')).toBe('name');
        expect(toKeySegment('text1')).toBe('text1');
        expect(toKeySegment('section-2')).toBe('section-2');
    });

    it('keeps a run of capitals together as one word', () => {
        expect(toKeySegment('pdfURL')).toBe('pdf-url');
        expect(toKeySegment('URLValue')).toBe('url-value');
        expect(toKeySegment('pdfURLValue')).toBe('pdf-url-value');
    });

    it('keeps a digit with the word before it', () => {
        expect(toKeySegment('line2Height')).toBe('line2-height');
        expect(toKeySegment('address2')).toBe('address2');
    });
});
