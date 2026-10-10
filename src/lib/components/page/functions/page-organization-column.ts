import { TableColumn, TableColumnParameters } from '../../table/models/table.model';
import { TextTableCell } from '../../table/models/table-cell.model';
import {
    PAGE_ORGANIZATION_COLUMN_LABEL,
    PAGE_ORGANIZATION_COLUMN_TOOLTIP,
    PAGE_ORGANIZATION_COLUMN_WIDTH,
    PAGE_ORGANIZATION_NAME_FIELD,
    PAGE_ORGANIZATIONS_MINIMUM,
    PageOrganization,
    PageOrganizationItem
} from '../models/page-organization.model';

export function hasOrganizationColumn(columns: TableColumn[]): boolean {
    return columns.some(isOrganizationColumn);
}

export function hiddenOrganizationColumn(columns: TableColumn[], organizations: PageOrganization[]): number {
    return organizations.length < PAGE_ORGANIZATIONS_MINIMUM ? columns.findIndex(isOrganizationColumn) : -1;
}

export function pageOrganizationCell({
    organizationName
}: Pick<PageOrganizationItem, 'organizationName'>): TextTableCell {
    return new TextTableCell({ content: organizationName ?? '', tooltip: organizationName ?? undefined });
}

export function pageOrganizationColumn(overrides: Partial<TableColumnParameters> = {}): TableColumn {
    return new TableColumn({
        key: PAGE_ORGANIZATION_NAME_FIELD,
        label: PAGE_ORGANIZATION_COLUMN_LABEL,
        tooltip: PAGE_ORGANIZATION_COLUMN_TOOLTIP,
        width: PAGE_ORGANIZATION_COLUMN_WIDTH,
        ...overrides
    });
}

export function withoutColumn<T>(entries: T[], index: number): T[] {
    return index < 0 ? entries : entries.filter((_, current) => current !== index);
}

function isOrganizationColumn({ key }: TableColumn): boolean {
    return key === PAGE_ORGANIZATION_NAME_FIELD;
}
