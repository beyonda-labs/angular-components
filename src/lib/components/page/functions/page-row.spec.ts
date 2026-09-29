import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageItemType } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { isActionVisible, isCategoryRow, toHandlerItems } from './page-row';

interface Row extends PageItem {
    type: PageItemType;
}

const CATEGORIES = new PageCategoriesConfig({});
const FOLDER: Row = { actions: ['archive', PageStandardAction.EditCategory], id: 'f', type: PageItemType.Category };
const OTHER_FOLDER: Row = { ...FOLDER, id: 'g' };
const REPORT: Row = { actions: ['archive', 'duplicate', PageStandardAction.Edit], id: 1, type: PageItemType.Item };
const SUMMARY: Row = { ...REPORT, id: 2 };

function buildAction(key: string, scope: PageActionScope, handler?: (items: PageItem[]) => void): PageAction {
    return new PageAction({ handler, key, scope, zone: PageActionZone.Menu });
}

describe('page rows', () => {
    it('shows a single-row action only while exactly one selected row lists its key', () => {
        const duplicate = buildAction('duplicate', PageActionScope.Single);

        expect(isActionVisible(duplicate, [], [REPORT])).toBe(true);
        expect(isActionVisible(duplicate, [], [REPORT, SUMMARY])).toBe(false);
        expect(isActionVisible(duplicate, [], [])).toBe(false);
        expect(isActionVisible(duplicate, [], [FOLDER])).toBe(false);
    });

    it('asks for exactly one row for edit and edit-category, whatever their scope', () => {
        const edit = buildAction(PageStandardAction.Edit, PageActionScope.Item);
        const editCategory = buildAction(PageStandardAction.EditCategory, PageActionScope.Item);

        expect(isActionVisible(edit, [], [REPORT])).toBe(true);
        expect(isActionVisible(edit, [], [REPORT, SUMMARY])).toBe(false);
        expect(isActionVisible(editCategory, [], [FOLDER, OTHER_FOLDER], CATEGORIES)).toBe(false);
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

    it('tells a category apart by the type field the categories config names', () => {
        const kind = new PageCategoriesConfig({ typeField: 'kind' });
        const folder: PageItem & { kind: PageItemType } = { id: 'k', kind: PageItemType.Category };

        expect(isCategoryRow(folder, kind)).toBe(true);
        expect(isCategoryRow(FOLDER, kind)).toBe(false);
        expect(isCategoryRow(FOLDER)).toBe(false);
    });
});
