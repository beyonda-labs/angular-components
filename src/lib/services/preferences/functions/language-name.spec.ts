import { languageName } from './language-name';

describe('languageName', () => {
    it('names a language in that same language, starting with a capital', () => {
        expect(languageName('en')).toBe('English');
        expect(languageName('es')).toBe('Español');
    });

    it('falls back to the code it cannot name', () => {
        expect(languageName('not a language')).toBe('not a language');
    });
});
