import { PageItemType, PageViewMode } from '../../page/models/page-categories.model';
import { TableColumn } from '../../table/models/table.model';
import { TextTableCell } from '../../table/models/table-cell.model';
import { OrganizationFolder } from '../models/organization-folders.model';
import {
    buildOrganizationFoldersConfig,
    isColumnShownInFolders,
    isOrganizationFolder,
    withoutOrganizationFolders
} from './organization-folders';

describe('organization folders', () => {
    const acme: OrganizationFolder = { actions: [], entryType: PageItemType.Category, id: 'o1', name: 'Acme' };

    it('reads a folder from the entryType of its row, so a row with a type of its own stays a row', () => {
        const loadRow = jest.fn(() => [new TextTableCell({ content: 'Acme' })]);
        const config = buildOrganizationFoldersConfig(loadRow, 'demo.users');

        expect(config.typeField).toBe('entryType');
        expect(config.formConfig).toBeUndefined();
        expect(config.loadRow?.(acme, PageViewMode.Table)).toEqual([new TextTableCell({ content: 'Acme' })]);
        expect(loadRow).toHaveBeenCalledWith(acme, PageViewMode.Table);
    });

    it('counts the folders as organizations and the rows by the texts under the prefix of the page', () => {
        const config = buildOrganizationFoldersConfig(() => [], 'demo.users');

        expect(config.countLabels).toEqual({
            one: 'demo.users.count.categories.one',
            other: 'demo.users.count.categories.other'
        });
        expect(config.itemCountLabels).toEqual({
            one: 'demo.users.count.items.one',
            other: 'demo.users.count.items.other'
        });
    });

    it('tells a folder from a row', () => {
        expect(isOrganizationFolder(acme)).toBe(true);
        expect(isOrganizationFolder({ id: 'r1', type: PageItemType.Category })).toBe(false);
        expect(isOrganizationFolder({ entryType: PageItemType.Item, id: 'r1' })).toBe(false);
    });

    it('leaves the folders out of a list of rows', () => {
        const role = { id: 'r1', name: 'Reviewers' };

        expect(withoutOrganizationFolders([acme, role])).toEqual([role]);
    });

    it('shows the organization column only in a search at the root, and every other column always', () => {
        const organization = new TableColumn({ key: 'organization' });
        const email = new TableColumn({ key: 'email' });
        const category = { id: 'o1', label: 'Acme' };

        expect([
            isColumnShownInFolders(organization, { isSearching: true }),
            isColumnShownInFolders(organization, { isSearching: false }),
            isColumnShownInFolders(organization, { category, isSearching: true }),
            isColumnShownInFolders(organization, { category, isSearching: false })
        ]).toEqual([true, false, false, false]);
        expect(isColumnShownInFolders(email, { category, isSearching: false })).toBe(true);
    });
});
