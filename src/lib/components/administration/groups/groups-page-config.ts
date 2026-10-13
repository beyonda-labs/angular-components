import { buildPageOrganizationField } from '../../page/functions/page-organization-filter';
import { pageStandardAction } from '../../page/functions/page-standard-actions';
import { PageConfig } from '../../page/models/page.model';
import { PageStandardAction } from '../../page/models/page-action.model';
import { PageHeaderConfig } from '../../page/models/page-header.model';
import { SearchSort, SearchSortDirection } from '../../page/models/page-search.model';
import { PageTableConfig, PageTableSearchConfig } from '../../page/models/page-table.model';
import { SearchField, SearchFieldType } from '../../search/models/search.model';
import { TableColumn } from '../../table/models/table.model';
import { isColumnShownInFolders } from '../functions/organization-folders';
import { ORGANIZATION_COLUMN_KEY, OrganizationFolder } from '../models/organization-folders.model';
import { GroupFormValue, GroupRow, GroupsPageConfigOptions, GroupsPageMode } from './models/groups.model';

const CREATED_AT_COLUMN = new TableColumn({ isSortable: true, key: 'createdAt', width: 2 });
const EXTRA_ROLE_COUNT_COLUMN = new TableColumn({ isSortable: true, key: 'extraRoleCount', width: 2 });
const LEADING_COLUMNS = [
    new TableColumn({ isHideable: false, isSortable: true, key: 'name', width: 5 }),
    new TableColumn({ isSortable: true, key: 'memberCount', width: 2 })
];
const ORDER: SearchSort = { direction: SearchSortDirection.Asc, field: 'name' };
const ORGANIZATION_COLUMN = new TableColumn({
    isSortable: true,
    key: ORGANIZATION_COLUMN_KEY,
    sortField: 'organizationName',
    width: 3
});
const ROLE_COUNT_COLUMN = new TableColumn({ key: 'roleCount', width: 2 });
const TEXT_FIELD = 'text';

export function buildGroupsPageConfig({
    categoriesConfig,
    config,
    formConfig,
    isOrganizationShown,
    loadRow,
    mode,
    onDataLoaded,
    onEdit,
    onReady,
    onView,
    organizations
}: GroupsPageConfigOptions): PageConfig<GroupFormValue, GroupRow, OrganizationFolder> {
    const { baseUrl, foldersHeight, height, prefix, storageKey } = config;
    const organizationField = buildPageOrganizationField(organizations);

    return new PageConfig<GroupFormValue, GroupRow, OrganizationFolder>({
        baseUrl,
        formConfig,
        headerConfig: new PageHeaderConfig<GroupRow>({
            actions: [
                pageStandardAction<GroupRow>(PageStandardAction.Create),
                pageStandardAction<GroupRow>(PageStandardAction.Edit, { handler: ([group]) => onEdit(group) }),
                pageStandardAction<GroupRow>(PageStandardAction.View, {
                    handler: ([group]) => onView(group),
                    tooltip: `${prefix}.actions.view.tooltip`
                }),
                pageStandardAction<GroupRow>(PageStandardAction.Delete)
            ],
            title: `${prefix}.title`
        }),
        onDataLoaded,
        onReady,
        prefix,
        tableConfig: new PageTableConfig<GroupRow, OrganizationFolder>({
            categoriesConfig,
            columns: [
                ...LEADING_COLUMNS,
                EXTRA_ROLE_COUNT_COLUMN,
                ...(isOrganizationShown ? [ORGANIZATION_COLUMN] : []),
                ROLE_COUNT_COLUMN,
                CREATED_AT_COLUMN
            ],
            height: categoriesConfig ? foldersHeight : height,
            isColumnShown: (column, context) =>
                isColumnShownInMode(column, mode()) && (!categoriesConfig || isColumnShownInFolders(column, context)),
            loadRow,
            order: ORDER,
            search: new PageTableSearchConfig({
                fields: [
                    new SearchField({ key: TEXT_FIELD, type: SearchFieldType.Text }),
                    ...(organizationField ? [organizationField] : [])
                ],
                mainField: TEXT_FIELD,
                textField: TEXT_FIELD
            }),
            storageKey
        })
    });
}

function isColumnShownInMode({ key }: TableColumn, mode: GroupsPageMode): boolean {
    switch (key) {
        case EXTRA_ROLE_COUNT_COLUMN.key:
        case ORGANIZATION_COLUMN_KEY:
            return mode === GroupsPageMode.Manage;
        case ROLE_COUNT_COLUMN.key:
            return mode === GroupsPageMode.ReadWithRoles;
        default:
            return true;
    }
}
