import { avatarInitials } from './avatar-initials';

describe('avatarInitials', () => {
    it('takes the first letter of the name and of the surname, in capitals', () => {
        expect(avatarInitials('ada', 'lovelace')).toBe('AL');
        expect(avatarInitials(' Nicolás ', 'Navarro')).toBe('NN');
    });

    it('drops the accents of the letters it takes', () => {
        expect(avatarInitials('Ana', 'Álvarez')).toBe('AA');
        expect(avatarInitials('élodie', 'Ñúñez')).toBe('EN');
    });

    it('takes the first letter of the name alone when there is no surname', () => {
        expect(avatarInitials('grace@example.test')).toBe('G');
        expect(avatarInitials('Grace', ' ')).toBe('G');
    });

    it('answers nothing for an empty name', () => {
        expect(avatarInitials('')).toBe('');
        expect(avatarInitials(null, null)).toBe('');
    });
});
