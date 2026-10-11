import { roleLabel } from './role-labels';

describe('roleLabel', () => {
    const translations: Record<string, string> = { 'my-app.roles.adminuser': 'Administrator' };
    const translate = (key: string): string => translations[key] ?? key;

    it('labels a base role from the role prefix, falling back to its name', () => {
        expect(roleLabel({ isBase: true, name: 'adminuser' }, 'my-app.roles', translate)).toBe('Administrator');
        expect(roleLabel({ isBase: true, name: 'normaluser' }, 'my-app.roles', translate)).toBe('normaluser');
    });

    it('shows an extra role by the name it was given', () => {
        expect(roleLabel({ isBase: false, name: 'adminuser' }, 'my-app.roles', translate)).toBe('adminuser');
    });
});
