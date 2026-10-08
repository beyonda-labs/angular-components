import { PropertyGroup } from './property-group.model';
import { PropertyTab } from './property-tab.model';

describe('PropertyTab', () => {
    it('applies the defaults', () => {
        const tab = new PropertyTab({ id: 'properties', label: 'Propiedades' });

        expect(tab.disabled).toBe(false);
        expect(tab.hidden).toBe(false);
        expect(tab.icon).toBeUndefined();
        expect(tab.addLabel).toBeUndefined();
    });

    it('defaults the label to the key sentinel of its id', () => {
        const tab = new PropertyTab({ id: 'properties' });

        expect(tab.label).toBe('properties.label');
    });

    it('defaults to no groups', () => {
        const tab = new PropertyTab({ id: 'properties' });

        expect(tab.groups).toEqual([]);
    });

    it('keeps the PropertyGroup instances it is given', () => {
        const tab = new PropertyTab({
            id: 'properties',
            label: 'Propiedades',
            groups: [new PropertyGroup({ id: 'content', label: 'Contenido' })]
        });

        expect(tab.groups[0]).toBeInstanceOf(PropertyGroup);
    });

    it('orders the groups by their order', () => {
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
