import { PageConfig } from '../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageItemType, PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageOwnedItem } from '../models/page-owner.model';
import { PageTableConfig } from '../models/page-table.model';
import { buildRowDropOptions, findStandardMoveAction, isMoveDragAllowed, isMoveDropAllowed } from './page-row-drop';
import { pageStandardAction } from './page-standard-actions';

interface Row extends PageItem {
    parentId: string | null;
    type: PageItemType;
}

interface OwnedRow extends PageOwnedItem, Row {}

const CATEGORIES = new PageCategoriesConfig({});
const MOVE = pageStandardAction(PageStandardAction.Move);
const INVOICES: Row = { actions: ['move'], id: 'invoices', parentId: null, type: PageItemType.Category };
const ARCHIVE: Row = { actions: ['move'], id: 'archive', parentId: null, type: PageItemType.Category };
const NESTED: Row = { actions: ['move'], id: 'nested', parentId: 'invoices', type: PageItemType.Category };
const OFFER: Row = { actions: ['move'], id: 'offer', parentId: null, type: PageItemType.Item };
const LOCKED: Row = { actions: [], id: 'locked', parentId: null, type: PageItemType.Item };

describe('buildRowDropOptions', () => {
    function buildConfig(baseUrl?: string): PageConfig {
        return new PageConfig({
            baseUrl,
            prefix: 'demo',
            tableConfig: new PageTableConfig({ categoriesConfig: CATEGORIES, columns: [], loadRow: () => [] })
        });
    }

    it('lets the rows the move allows be dropped onto a folder, through the drop it is given', () => {
        const onRowDrop = jest.fn();
        const options = buildRowDropOptions(buildConfig('/files'), [MOVE], PageViewMode.Table, onRowDrop);

        options.onRowDrop?.(INVOICES, [OFFER]);

        expect(options.isRowDraggable?.(OFFER)).toBe(true);
        expect(options.isRowDraggable?.(LOCKED)).toBe(false);
        expect(options.isDropAllowed?.(INVOICES, [OFFER])).toBe(true);
        expect(onRowDrop).toHaveBeenCalledWith(INVOICES, [OFFER]);
    });

    it('offers no drag without the standard move, without a base URL, or in the trash', () => {
        expect(buildRowDropOptions(buildConfig('/files'), [], PageViewMode.Table, jest.fn())).toEqual({});
        expect(buildRowDropOptions(buildConfig(), [MOVE], PageViewMode.Table, jest.fn())).toEqual({});
        expect(buildRowDropOptions(buildConfig('/files'), [MOVE], PageViewMode.Trash, jest.fn())).toEqual({});
    });
});

describe('findStandardMoveAction', () => {
    it('finds the standard move action, inside a group too, and none with a handler of its own', () => {
        const group = new PageAction({
            key: 'more',
            scope: PageActionScope.Group,
            subActions: [MOVE],
            zone: PageActionZone.Menu
        });

        expect(findStandardMoveAction([pageStandardAction(PageStandardAction.Delete), group])).toBe(MOVE);
        expect(findStandardMoveAction([pageStandardAction(PageStandardAction.Move, { action: () => {} })])).toBe(
            undefined
        );
    });
});

describe('isMoveDragAllowed', () => {
    it('lets a row be dragged when it lists the move action', () => {
        expect(isMoveDragAllowed(MOVE, OFFER, CATEGORIES)).toBe(true);
        expect(isMoveDragAllowed(MOVE, LOCKED, CATEGORIES)).toBe(false);
    });
});

describe('isMoveDropAllowed', () => {
    it('accepts rows that can move onto another folder', () => {
        expect(isMoveDropAllowed(MOVE, INVOICES, [OFFER, ARCHIVE], CATEGORIES)).toBe(true);
    });

    it('refuses a target that is not a folder and rows that cannot move', () => {
        expect(isMoveDropAllowed(MOVE, OFFER, [ARCHIVE], CATEGORIES)).toBe(false);
        expect(isMoveDropAllowed(MOVE, INVOICES, [OFFER, LOCKED], CATEGORIES)).toBe(false);
        expect(isMoveDropAllowed(MOVE, INVOICES, [], CATEGORIES)).toBe(false);
    });

    it('refuses dropping a folder into itself or into one of its children', () => {
        expect(isMoveDropAllowed(MOVE, INVOICES, [INVOICES, OFFER], CATEGORIES)).toBe(false);
        expect(isMoveDropAllowed(MOVE, NESTED, [INVOICES], CATEGORIES)).toBe(false);
    });

    it('refuses dropping rows onto the folder they are already in', () => {
        expect(isMoveDropAllowed(MOVE, INVOICES, [NESTED], CATEGORIES)).toBe(false);
    });

    describe('with owners', () => {
        const ADA_INVOICES: OwnedRow = { ...INVOICES, ownerId: 'ada', ownerName: 'Ada Lovelace' };
        const ADA_ARCHIVE: OwnedRow = { ...ARCHIVE, ownerId: 'ada', ownerName: 'Ada Lovelace' };
        const ADA_OFFER: OwnedRow = { ...OFFER, ownerId: 'ada', ownerName: 'Ada Lovelace' };
        const GRACE_INVOICES: OwnedRow = { ...INVOICES, id: 'grace-invoices', ownerId: 'grace', ownerName: 'Grace' };
        const GRACE_OFFER: OwnedRow = { ...OFFER, id: 'grace-offer', ownerId: 'grace', ownerName: 'Grace' };
        const COMMON: OwnedRow = { ...INVOICES, id: 'common', ownerId: null, ownerName: null };

        it('accepts rows onto a folder of their own owner', () => {
            expect(isMoveDropAllowed(MOVE, ADA_INVOICES, [ADA_OFFER, ADA_ARCHIVE], CATEGORIES)).toBe(true);
        });

        it('refuses rows onto a folder of another owner, or onto a folder nobody owns', () => {
            expect(isMoveDropAllowed(MOVE, GRACE_INVOICES, [ADA_OFFER], CATEGORIES)).toBe(false);
            expect(isMoveDropAllowed(MOVE, COMMON, [ADA_OFFER], CATEGORIES)).toBe(false);
        });

        it('refuses rows of several owners onto any folder', () => {
            expect(isMoveDropAllowed(MOVE, ADA_INVOICES, [ADA_OFFER, GRACE_OFFER], CATEGORIES)).toBe(false);
            expect(isMoveDropAllowed(MOVE, GRACE_INVOICES, [ADA_OFFER, GRACE_OFFER], CATEGORIES)).toBe(false);
        });
    });
});
