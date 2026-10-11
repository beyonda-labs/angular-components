import { userFullName } from './user-labels';

describe('userFullName', () => {
    it('joins the name and the surname the user has', () => {
        expect(userFullName({ name: ' Ada ', surname: 'Lovelace' })).toBe('Ada Lovelace');
        expect(userFullName({ surname: 'Lovelace' })).toBe('Lovelace');
        expect(userFullName({})).toBe('');
    });
});
