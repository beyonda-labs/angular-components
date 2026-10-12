import { userContactLabel, userDisplayName, userFullName } from './user-names';

describe('user names', () => {
    describe('userFullName', () => {
        it('joins the name and the surname the user has', () => {
            expect(userFullName({ name: ' Ada ', surname: 'Lovelace' })).toBe('Ada Lovelace');
            expect(userFullName({ name: null, surname: 'Lovelace' })).toBe('Lovelace');
            expect(userFullName({})).toBe('');
        });
    });

    describe('userContactLabel', () => {
        it('names a user by name and surname with the email after them', () => {
            expect(userContactLabel({ email: 'ada@example.test', name: 'Ada', surname: 'Lovelace' })).toBe(
                'Ada Lovelace (ada@example.test)'
            );
        });

        it('names a user without a name, or named by the email, by the email alone', () => {
            expect(userContactLabel({ email: 'ada@example.test', name: null })).toBe('ada@example.test');
            expect(userContactLabel({ email: 'ada@example.test', name: 'ada@example.test' })).toBe('ada@example.test');
        });
    });

    describe('userDisplayName', () => {
        it('names a user by name and surname, or by the email without them', () => {
            expect(userDisplayName({ email: 'ada@example.test', name: 'Ada', surname: 'Lovelace' })).toBe(
                'Ada Lovelace'
            );
            expect(userDisplayName({ email: 'ada@example.test' })).toBe('ada@example.test');
        });
    });
});
