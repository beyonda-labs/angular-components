import { PageCategoriesConfig, PageItemType } from '../../page/models/page-categories.model';
import { PageColumnContext } from '../../page/models/page-table.model';
import { TableColumn } from '../../table/models/table.model';
import { TableCell } from '../../table/models/table-cell.model';
import {
    ORGANIZATION_COLUMN_KEY,
    ORGANIZATION_FOLDER_TYPE_FIELD,
    OrganizationFolder
} from '../models/organization-folders.model';

export function buildOrganizationFoldersConfig(
    loadRow: (folder: OrganizationFolder) => TableCell[]
): PageCategoriesConfig<OrganizationFolder> {
    return new PageCategoriesConfig<OrganizationFolder>({
        loadRow,
        typeField: ORGANIZATION_FOLDER_TYPE_FIELD
    });
}

export function isColumnShownInFolders({ key }: TableColumn, { category, isSearching }: PageColumnContext): boolean {
    return key !== ORGANIZATION_COLUMN_KEY || (!category && isSearching);
}

export function isOrganizationFolder(row: object): row is OrganizationFolder {
    return (row as Record<string, unknown>)[ORGANIZATION_FOLDER_TYPE_FIELD] === PageItemType.Category;
}

export function withoutOrganizationFolders<TRow extends object>(rows: (TRow | OrganizationFolder)[]): TRow[] {
    return rows.filter((row): row is TRow => !isOrganizationFolder(row));
}
