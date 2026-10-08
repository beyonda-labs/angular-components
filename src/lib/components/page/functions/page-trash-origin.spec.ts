import { LinkTableCell, TextTableCell } from '../../table/models/table-cell.model';
import { readParentPath, withOriginTooltip } from './page-trash-origin';

describe('page trash origin', () => {
    it('reads the names of the parent path of a row, and nothing when the row has none', () => {
        expect(readParentPath({ id: 1, parentPath: ['Clients', 2026] } as never, 'parentPath')).toEqual([
            'Clients',
            '2026'
        ]);
        expect(readParentPath({ id: 1 }, 'parentPath')).toBeNull();
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
