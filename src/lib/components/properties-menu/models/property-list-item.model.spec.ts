import { PropertyListItem } from './property-list-item.model';

describe('PropertyListItem', () => {
    it('should apply default values', () => {
        const item = new PropertyListItem({ id: 'block-heading', label: 'Encabezado' });

        expect(item.disabled).toBe(false);
        expect(item.hidden).toBe(false);
        expect(item.metadata).toEqual({});
        expect(item.description).toBeUndefined();
        expect(item.icon).toBeUndefined();
    });

    it('should default the label to a translation key sentinel based on the id', () => {
        const item = new PropertyListItem({ id: 'block-heading' });

        expect(item.label).toBe('block-heading.label');
    });

    it('should keep the provided description', () => {
        const item = new PropertyListItem({
            id: 'block-heading',
            label: 'Encabezado',
            description: 'Título o subtítulo destacado'
        });

        expect(item.description).toBe('Título o subtítulo destacado');
    });
});
