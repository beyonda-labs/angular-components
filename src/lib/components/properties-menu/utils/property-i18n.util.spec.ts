import { resolvePropertyLabelKey } from './property-i18n.util';

describe('resolvePropertyLabelKey', () => {
    it('should prefix the key when the label is still the default sentinel', () => {
        expect(resolvePropertyLabelKey('app.properties-menu', 'groups', 'content', 'content.label')).toBe(
            'app.properties-menu.groups.content.label'
        );
    });

    it('should keep an explicitly provided label as-is', () => {
        expect(resolvePropertyLabelKey('app.properties-menu', 'groups', 'content', 'Contenido')).toBe('Contenido');
    });
});
