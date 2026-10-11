import { userRoleLabel } from './user-role-labels';

describe('userRoleLabel', () => {
    const translations: Record<string, string> = { 'my-app.roles.content-editor': 'Content editor' };
    const translate = (key: string): string => translations[key] ?? key;

    it('reads the label of a role from its key under the prefix, as a kebab-case segment', () => {
        expect(userRoleLabel('contentEditor', 'my-app.roles', translate)).toBe('Content editor');
    });

    it('falls back to the name of the role when the app translates none', () => {
        expect(userRoleLabel('auditor', 'my-app.roles', translate)).toBe('auditor');
    });
});
