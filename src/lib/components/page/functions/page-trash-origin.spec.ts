import { LinkTableCell, TextTableCell } from '../../table/models/table-cell.model';
import { readItemName, readParentPath, withOriginTooltip } from './page-trash-origin';

describe('page trash origin', () => {
    it('reads the names of the parent path of a row, and nothing when the row has none', () => {
        expect(readParentPath({ id: 1, parentPath: ['Clients', 2026] } as never, 'parentPath')).toEqual([
            'Clients',
            '2026'
        ]);
        expect(readParentPath({ id: 1 }, 'parentPath')).toBeNull();
    });

    it('reads the name of a row as the last level of its origin, and nothing for a blank one', () => {
        expect(readItemName({ id: 1, name: 'Offer' } as never, 'name')).toEqual(['Offer']);
        expect(readItemName({ id: 1, title: 2026 } as never, 'title')).toEqual(['2026']);
        expect(readItemName({ id: 1, name: '  ' } as never, 'name')).toEqual([]);
        expect(readItemName({ id: 1 }, 'name')).toEqual([]);
    });

    it('puts the origin from the root down on the tooltip of the first cell, keeping its kind and the rest', () => {
        const action = jest.fn();
        const cells = [
            new LinkTableCell({ action, content: 'Offer', tooltip: 'Offer', tooltipItems: ['Used twice'] }),
            new TextTableCell({ content: 'Draft' })
        ];

        const [first, second] = withOriginTooltip(cells, 'All templates', ['Clients', '2026']);

        expect(first).toBeInstanceOf(LinkTableCell);
        expect(first).toEqual(
            expect.objectContaining({ action, content: 'Offer', tooltip: 'All templates / Clients / 2026' })
        );
        expect(first.tooltipItems).toBeUndefined();
        expect(second).toBe(cells[1]);
        expect(cells[0].tooltip).toBe('Offer');
    });

    it('names only the root for a row at the root, and leaves a row without cells alone', () => {
        expect(withOriginTooltip([new TextTableCell({ content: 'Offer' })], 'All templates', [])[0].tooltip).toBe(
            'All templates'
        );
        expect(withOriginTooltip([], 'All templates', ['Clients'])).toEqual([]);
    });
});
