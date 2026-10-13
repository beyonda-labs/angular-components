import { userNameOrUnknown } from './user-name';

describe('userNameOrUnknown', () => {
    const translate = (key: string): string => (key === 'angular-components.user-name.unknown' ? 'Unknown' : key);

    it('keeps a name the data gives', () => {
        expect(userNameOrUnknown('Ada Lovelace', translate)).toBe('Ada Lovelace');
    });

    it('names a user the data no longer resolves as unknown', () => {
        expect(userNameOrUnknown(null, translate)).toBe('Unknown');
        expect(userNameOrUnknown(undefined, translate)).toBe('Unknown');
        expect(userNameOrUnknown(' ', translate)).toBe('Unknown');
    });
});
