import { matchesOptionText } from './option-match';

const NORA = 'Nora Lectora (nora@empresa.com)';

describe('option match', () => {
    it.each(['nora', 'nora lec', 'nora@', 'LECTORA', 'empresa.com', '  nora   lec '])(
        'finds the text %p anywhere in the label, whatever its case and its spaces',
        text => {
            expect(matchesOptionText(NORA, text)).toBe(true);
        }
    );

    it('ignores the accents of the label and of the text', () => {
        expect(matchesOptionText('Íñigo Núñez', 'INIGO nunez')).toBe(true);
        expect(matchesOptionText('Inigo Nunez', 'íñigo')).toBe(true);
    });

    it('does not find a text the label does not hold', () => {
        expect(matchesOptionText(NORA, 'lectora nora')).toBe(false);
    });
});
