import { PropertyGroup } from './property-group.model';
import { PropertyTab } from './property-tab.model';

describe('PropertyTab', () => {
    it('should apply default values', () => {
        const tab = new PropertyTab({ id: 'properties', label: 'Propiedades' });

        expect(tab.disabled).toBe(false);
        expect(tab.hidden).toBe(false);
        expect(tab.icon).toBeUndefined();
        expect(tab.addLabel).toBeUndefined();
    });

    it('should default the label to a translation key sentinel based on the id', () => {
        const tab = new PropertyTab({ id: 'properties' });

        expect(tab.label).toBe('properties.label');
    });

    it('should default groups to an empty array', () => {
        const tab = new PropertyTab({ id: 'properties' });

        expect(tab.groups).toEqual([]);
    });

    it('should keep already-instantiated PropertyGroup instances', () => {
        const tab = new PropertyTab({
            id: 'properties',
            label: 'Propiedades',
            groups: [new PropertyGroup({ id: 'content', label: 'Contenido' })]
        });

        expect(tab.groups[0]).toBeInstanceOf(PropertyGroup);
    });

    it('should order groups by the order property', () => {
        const tab = new PropertyTab({
            id: 'properties',
            label: 'Propiedades',
            groups: [
                new PropertyGroup({ id: 'advanced', label: 'Avanzado', order: 2 }),
                new PropertyGroup({ id: 'content', label: 'Contenido', order: 1 })
            ]
        });

        expect(tab.groups.map(group => group.id)).toEqual(['content', 'advanced']);
    });
});
