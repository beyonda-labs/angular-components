import { faFolder } from '@fortawesome/free-solid-svg-icons';

import { BadgeTableCell, LinkTableCell, TextTableCell } from '../../table/models/table-cell.model';
import { PageViewMode } from '../models/page-categories.model';
import { isSharedCategory, withCategoryIcon } from './page-shared-category';

const SHARED_ICON = { icon: faFolder, label: 'demo.shared' };

describe('isSharedCategory', () => {
    it('takes a folder as shared when it says so, or when the view is the shared one', () => {
        expect(isSharedCategory({ id: 1, isShared: true } as never, PageViewMode.Table)).toBe(true);
        expect(isSharedCategory({ id: 1 }, PageViewMode.Shared)).toBe(true);
        expect(isSharedCategory({ id: 1, isShared: false } as never, PageViewMode.Table)).toBe(false);
        expect(isSharedCategory({ id: 1 }, PageViewMode.Trash)).toBe(false);
    });
});

describe('withCategoryIcon', () => {
    it('gives the first text or link cell the icon, keeping the others and never writing into the cells', () => {
        const action = jest.fn();
        const link = new LinkTableCell({ action, content: 'Clients' });
        const owner = new TextTableCell({ content: 'Ada' });
        const [first, second] = withCategoryIcon([link, owner], SHARED_ICON) as LinkTableCell[];

        first.action();

        expect(first).toBeInstanceOf(LinkTableCell);
        expect(first).toEqual(
            expect.objectContaining({
                content: 'Clients',
                icon: faFolder,
                iconLabel: 'demo.shared'
            })
        );
        expect(action).toHaveBeenCalled();
        expect(second).toBe(owner);
        expect(link.icon).toBeUndefined();
    });

    it('leaves a row alone when its first cell takes no icon, or when it has no cells', () => {
        const badges = [new BadgeTableCell({ badges: [] })];

        expect(withCategoryIcon(badges, SHARED_ICON)).toBe(badges);
        expect(withCategoryIcon([], SHARED_ICON)).toEqual([]);
    });
});
