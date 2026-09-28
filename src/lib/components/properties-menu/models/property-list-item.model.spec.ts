import { PropertyListItem } from './property-list-item.model';

describe('PropertyListItem', () => {
    it('applies the defaults', () => {
        const item = new PropertyListItem({ id: 'block-heading', label: 'Encabezado' });

        expect(item.disabled).toBe(false);
        expect(item.hidden).toBe(false);
        expect(item.metadata).toEqual({});
        expect(item.description).toBeUndefined();
        expect(item.icon).toBeUndefined();
    });

    it('defaults the label to the key sentinel of its id', () => {
        const item = new PropertyListItem({ id: 'block-heading' });

        expect(item.label).toBe('block-heading.label');
    });

    it('keeps the description it is given', () => {
        const item = new PropertyListItem({
            id: 'block-heading',
            label: 'Encabezado',
            description: 'Título o subtítulo destacado'
        });

        expect(item.description).toBe('Título o subtítulo destacado');
    });
});
