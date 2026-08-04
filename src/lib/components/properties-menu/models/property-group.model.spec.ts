import { PropertyTextField } from './fields/property-text-field.model';
import { PropertyGroup, PropertyGroupVariant } from './property-group.model';
import { PropertyFieldsContent } from './property-group-content.model';

describe('PropertyGroup', () => {
    it('should default to collapsed and primary variant', () => {
        const group = new PropertyGroup({ id: 'spacing', label: 'Espaciado' });

        expect(group.expanded).toBe(false);
        expect(group.variant).toBe(PropertyGroupVariant.PRIMARY);
        expect(group.disabled).toBe(false);
        expect(group.hidden).toBe(false);
        expect(group.showHeader).toBe(true);
        expect(group.content).toBeInstanceOf(PropertyFieldsContent);
    });

    it('should default the label to a translation key sentinel based on the id', () => {
        const group = new PropertyGroup({ id: 'spacing' });

        expect(group.label).toBe('spacing.label');
    });

    it('should keep the provided content instance as-is', () => {
        const field = new PropertyTextField({ id: 'text' });
        const content = new PropertyFieldsContent({ fields: [field] });
        const group = new PropertyGroup({ id: 'content', label: 'Contenido', content });

        expect(group.content).toBe(content);
    });

    it('should mark secondary groups as such', () => {
        const group = new PropertyGroup({ id: 'advanced', label: 'Avanzado', variant: PropertyGroupVariant.SECONDARY });

        expect(group.variant).toBe(PropertyGroupVariant.SECONDARY);
    });

    it('should force expanded to true when showHeader is false, regardless of the expanded input', () => {
        const group = new PropertyGroup({ id: 'structure', showHeader: false, expanded: false });

        expect(group.expanded).toBe(true);
    });

    it('should respect the expanded input when showHeader is true', () => {
        const group = new PropertyGroup({ id: 'content', showHeader: true, expanded: true });

        expect(group.expanded).toBe(true);
    });
});
