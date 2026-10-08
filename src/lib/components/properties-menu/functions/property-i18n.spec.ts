import { resolvePropertyLabelKey } from './property-i18n';

describe('resolvePropertyLabelKey', () => {
    it('prefixes the key while the label is still the default sentinel', () => {
        expect(resolvePropertyLabelKey('app.properties-menu', 'groups', 'content', 'content.label')).toBe(
            'app.properties-menu.groups.content.label'
        );
    });

    it('turns a camelCase id into a kebab-case segment of the default key', () => {
        expect(resolvePropertyLabelKey('app.properties-menu', 'groups', 'pageLayout', 'pageLayout.label')).toBe(
            'app.properties-menu.groups.page-layout.label'
        );
    });

    it('keeps an explicit label as it is', () => {
        expect(resolvePropertyLabelKey('app.properties-menu', 'groups', 'content', 'Contenido')).toBe('Contenido');
    });
});
