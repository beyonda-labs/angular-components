import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageItemType } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { isActionVisible, isCategoryRow, keepListedRows, toHandlerItems, toTrashItems } from './page-row';

interface Row extends PageItem {
    type: PageItemType;
}

const CATEGORIES = new PageCategoriesConfig({});
const FOLDER: Row = { actions: ['archive', PageStandardAction.EditCategory], id: 'f', type: PageItemType.Category };
const OTHER_FOLDER: Row = { ...FOLDER, id: 'g' };
const REPORT: Row = { actions: ['archive', 'duplicate', PageStandardAction.Edit], id: 1, type: PageItemType.Item };
const SUMMARY: Row = { ...REPORT, id: 2 };

function buildAction(key: string, scope: PageActionScope, action?: (items: PageItem[]) => void): PageAction {
    return new PageAction({ action, key, scope, zone: PageActionZone.Menu });
}

describe('page rows', () => {
    it('keeps of a selection the rows the list still shows, as the list shows them', () => {
        const renamed: Row = { ...REPORT, actions: [] };

        expect(keepListedRows([REPORT, SUMMARY], [FOLDER, renamed])).toEqual([renamed]);
    });

    it('shows a single-row action only while exactly one selected row lists its key', () => {
        const duplicate = buildAction('duplicate', PageActionScope.Single);

        expect(isActionVisible(duplicate, [], [REPORT])).toBe(true);
        expect(isActionVisible(duplicate, [], [REPORT, SUMMARY])).toBe(false);
        expect(isActionVisible(duplicate, [], [])).toBe(false);
        expect(isActionVisible(duplicate, [], [FOLDER])).toBe(false);
    });

    it('asks for exactly one row for edit, edit-category and view, whatever their scope', () => {
        const edit = buildAction(PageStandardAction.Edit, PageActionScope.Item);
        const editCategory = buildAction(PageStandardAction.EditCategory, PageActionScope.Item);
        const view = buildAction(PageStandardAction.View, PageActionScope.Item);
        const readable: Row = { ...REPORT, actions: [PageStandardAction.View] };

        expect(isActionVisible(edit, [], [REPORT])).toBe(true);
        expect(isActionVisible(edit, [], [REPORT, SUMMARY])).toBe(false);
        expect(isActionVisible(editCategory, [], [FOLDER, OTHER_FOLDER], CATEGORIES)).toBe(false);
        expect(isActionVisible(view, [], [readable])).toBe(true);
        expect(isActionVisible(view, [], [readable, { ...readable, id: 2 }])).toBe(false);
    });

    it('shows move only while the selected rows have a single owner, or none of them has owners', () => {
        const move = buildAction(PageStandardAction.Move, PageActionScope.Item);
        const customMove = buildAction(PageStandardAction.Move, PageActionScope.Item, jest.fn());
        const adaReport = { ...REPORT, actions: [PageStandardAction.Move], ownerId: 'ada' } as PageItem;
        const adaSummary = { ...SUMMARY, actions: [PageStandardAction.Move], ownerId: 'ada' } as PageItem;
        const graceSummary = { ...adaSummary, ownerId: 'grace' } as PageItem;
        const plainReport: Row = { ...REPORT, actions: [PageStandardAction.Move] };
        const plainSummary: Row = { ...SUMMARY, actions: [PageStandardAction.Move] };

        expect(isActionVisible(move, [], [adaReport, adaSummary])).toBe(true);
        expect(isActionVisible(move, [], [plainReport, plainSummary])).toBe(true);
        expect(isActionVisible(move, [], [adaReport, graceSummary])).toBe(false);
        expect(isActionVisible(customMove, [], [adaReport, graceSummary])).toBe(false);
    });

    it('hides an action with a handler when every selected row is a category, unlike a standard one', () => {
        const custom = buildAction('archive', PageActionScope.Item, jest.fn());
        const standard = buildAction('archive', PageActionScope.Item);

        expect(isActionVisible(custom, [], [FOLDER], CATEGORIES)).toBe(false);
        expect(isActionVisible(custom, [], [FOLDER, REPORT], CATEGORIES)).toBe(true);
        expect(isActionVisible(standard, [], [FOLDER], CATEGORIES)).toBe(true);
    });

    it('hands a handler the selected rows that are not categories, and no row for a global action', () => {
        const archive = buildAction('archive', PageActionScope.Item, jest.fn());
        const create = buildAction(PageStandardAction.Create, PageActionScope.Global, jest.fn());

        expect(toHandlerItems(archive, [FOLDER, REPORT], CATEGORIES)).toEqual([REPORT]);
        expect(toHandlerItems(archive, [FOLDER, REPORT])).toEqual([FOLDER, REPORT]);
        expect(toHandlerItems(create, [REPORT], CATEGORIES)).toEqual([]);
    });

    it('hands a share handler the folder it shares, and shows it only on a folder that lists it', () => {
        const share = buildAction(PageStandardAction.Share, PageActionScope.Single, jest.fn());
        const sharedFolder: Row = { ...FOLDER, actions: [PageStandardAction.Share] };

        expect(toHandlerItems(share, [sharedFolder], CATEGORIES)).toEqual([sharedFolder]);
        expect(isActionVisible(share, [], [sharedFolder], CATEGORIES)).toBe(true);
        expect(isActionVisible(share, [], [FOLDER], CATEGORIES)).toBe(false);
        expect(isActionVisible(share, [], [{ ...REPORT, actions: [PageStandardAction.Share] }], CATEGORIES)).toBe(
            false
        );
    });

    it('hands a transfer handler every selected row, folders included, and shows it while every row lists it', () => {
        const transfer = buildAction(PageStandardAction.Transfer, PageActionScope.Item, jest.fn());
        const folder: Row = { ...FOLDER, actions: [PageStandardAction.Transfer] };
        const report: Row = { ...REPORT, actions: [PageStandardAction.Transfer] };

        expect(toHandlerItems(transfer, [folder, report], CATEGORIES)).toEqual([folder, report]);
        expect(isActionVisible(transfer, [], [folder, report], CATEGORIES)).toBe(true);
        expect(isActionVisible(transfer, [], [folder, REPORT], CATEGORIES)).toBe(false);
    });

    it('tells a category apart by the type field the categories config names', () => {
        const kind = new PageCategoriesConfig({ typeField: 'kind' });
        const folder: PageItem & { kind: PageItemType } = { id: 'k', kind: PageItemType.Category };

        expect(isCategoryRow(folder, kind)).toBe(true);
        expect(isCategoryRow(FOLDER, kind)).toBe(false);
        expect(isCategoryRow(FOLDER)).toBe(false);
    });

    it('keeps only the id and the type of each row for a trash request', () => {
        expect(toTrashItems([REPORT, FOLDER], CATEGORIES)).toEqual([
            { id: 1, type: PageItemType.Item },
            { id: 'f', type: PageItemType.Category }
        ]);
    });

    it('reads the entry type from the type field the categories config names, and sends it as the type', () => {
        const entryType = new PageCategoriesConfig({ typeField: 'entryType' });
        const variable = { entryType: PageItemType.Item, id: 'v', type: 'string' } as PageItem;
        const folder = { entryType: PageItemType.Category, id: 'g' } as PageItem;

        expect(toTrashItems([variable, folder], entryType)).toEqual([
            { id: 'v', type: PageItemType.Item },
            { id: 'g', type: PageItemType.Category }
        ]);
    });

    it('sends every row as an item without categories', () => {
        expect(toTrashItems([{ id: 1, type: 'string' } as PageItem, FOLDER])).toEqual([
            { id: 1, type: PageItemType.Item },
            { id: 'f', type: PageItemType.Item }
        ]);
    });
});
