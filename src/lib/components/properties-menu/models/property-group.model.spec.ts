import { PropertyTextField } from './fields/property-text-field.model';
import { PropertyGroup, PropertyGroupVariant } from './property-group.model';
import { PropertyFieldsContent } from './property-group-content.model';

describe('PropertyGroup', () => {
    it('defaults to collapsed and to the primary variant', () => {
        const group = new PropertyGroup({ id: 'spacing', label: 'Espaciado' });

        expect(group.expanded).toBe(false);
        expect(group.variant).toBe(PropertyGroupVariant.PRIMARY);
        expect(group.disabled).toBe(false);
        expect(group.hidden).toBe(false);
        expect(group.showHeader).toBe(true);
        expect(group.content).toBeInstanceOf(PropertyFieldsContent);
    });

    it('defaults the label to the key sentinel of its id', () => {
        const group = new PropertyGroup({ id: 'spacing' });

        expect(group.label).toBe('spacing.label');
    });

    it('keeps the content instance it is given', () => {
        const field = new PropertyTextField({ id: 'text' });
        const content = new PropertyFieldsContent({ fields: [field] });
        const group = new PropertyGroup({ id: 'content', label: 'Contenido', content });

        expect(group.content).toBe(content);
    });

    it('marks a secondary group as such', () => {
        const group = new PropertyGroup({ id: 'advanced', label: 'Avanzado', variant: PropertyGroupVariant.SECONDARY });

        expect(group.variant).toBe(PropertyGroupVariant.SECONDARY);
    });

    it('is always expanded when showHeader is false, whatever expanded says', () => {
        const group = new PropertyGroup({ id: 'structure', showHeader: false, expanded: false });

        expect(group.expanded).toBe(true);
    });

    it('follows expanded when showHeader is true', () => {
        const group = new PropertyGroup({ id: 'content', showHeader: true, expanded: true });

        expect(group.expanded).toBe(true);
    });
});
