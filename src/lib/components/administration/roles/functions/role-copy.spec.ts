import { roleCopyName } from './role-copy';

describe('roleCopyName', () => {
    it('joins the name and the copy suffix with a space', () => {
        expect(roleCopyName('Administrador', '(copia)', 60)).toBe('Administrador (copia)');
    });

    it('cuts the name, never the suffix, so the copy fits the length', () => {
        const name = 'R'.repeat(58);

        expect(roleCopyName(name, '(copy)', 60)).toBe(`${'R'.repeat(53)} (copy)`);
        expect(roleCopyName(name, '(copy)', 60)).toHaveLength(60);
    });

    it('leaves no space at the end of a cut name', () => {
        expect(roleCopyName('Reviewers of templates', '(copy)', 17)).toBe('Reviewers (copy)');
    });
});
