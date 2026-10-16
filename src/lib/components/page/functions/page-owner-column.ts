import { UNKNOWN_USER_NAME_KEY } from '../../../internal/user-name/models/user-name.model';
import { TableColumn, TableColumnParameters } from '../../table/models/table.model';
import { TextTableCell } from '../../table/models/table-cell.model';
import {
    PAGE_OWNER_COLUMN_LABEL,
    PAGE_OWNER_COLUMN_TOOLTIP,
    PAGE_OWNER_COLUMN_WIDTH,
    PAGE_OWNER_FIELD,
    PAGE_OWNER_NAME_FIELD,
    PageOwnedItem
} from '../models/page-owner.model';

export function pageOwnerCell({
    ownerId,
    ownerName
}: Partial<Pick<PageOwnedItem, 'ownerId'>> & Pick<PageOwnedItem, 'ownerName'>): TextTableCell {
    if (ownerName) {
        return new TextTableCell({ content: ownerName, tooltip: ownerName });
    }

    return ownerId
        ? new TextTableCell({ content: UNKNOWN_USER_NAME_KEY, isTranslationKey: true })
        : new TextTableCell({ content: '' });
}

export function pageOwnerColumn(overrides: Partial<TableColumnParameters> = {}): TableColumn {
    return new TableColumn({
        isSortable: true,
        key: PAGE_OWNER_NAME_FIELD,
        label: PAGE_OWNER_COLUMN_LABEL,
        sortField: PAGE_OWNER_FIELD,
        tooltip: PAGE_OWNER_COLUMN_TOOLTIP,
        width: PAGE_OWNER_COLUMN_WIDTH,
        ...overrides
    });
}
