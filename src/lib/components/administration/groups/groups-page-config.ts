import { buildPageOrganizationField } from '../../page/functions/page-organization-filter';
import { pageStandardAction } from '../../page/functions/page-standard-actions';
import { PageBackendResponse, PageConfig, PageHandle } from '../../page/models/page.model';
import { PageStandardAction } from '../../page/models/page-action.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import { PageHeaderConfig } from '../../page/models/page-header.model';
import { PageOrganization } from '../../page/models/page-organization.model';
import { SearchSort, SearchSortDirection } from '../../page/models/page-search.model';
import { PageTableConfig, PageTableSearchConfig } from '../../page/models/page-table.model';
import { SearchField, SearchFieldType } from '../../search/models/search.model';
import { TableColumn } from '../../table/models/table.model';
import { TableCell } from '../../table/models/table-cell.model';
import { GroupFormValue, GroupRow, GroupsConfig, GroupsPageMode } from './models/groups.model';

const CREATED_AT_COLUMN = new TableColumn({ isSortable: true, key: 'createdAt', width: 2 });
const EXTRA_ROLE_COUNT_COLUMN = new TableColumn({ isSortable: true, key: 'extraRoleCount', width: 2 });
const LEADING_COLUMNS = [
    new TableColumn({ isHideable: false, isSortable: true, key: 'name', width: 5 }),
    new TableColumn({ isSortable: true, key: 'memberCount', width: 2 })
];
const ORDER: SearchSort = { direction: SearchSortDirection.Asc, field: 'name' };
const ORGANIZATION_COLUMN = new TableColumn({
    isSortable: true,
    key: 'organization',
    sortField: 'organizationName',
    width: 3
});
const ROLE_COUNT_COLUMN = new TableColumn({ key: 'roleCount', width: 2 });
const TEXT_FIELD = 'text';

export interface GroupsPageConfigOptions {
    config: GroupsConfig;
    formConfig: PageFormConfig<GroupFormValue, GroupRow>;
    isOrganizationShown: boolean;
    loadRow: (group: GroupRow) => TableCell[];
    mode: GroupsPageMode;
    onDataLoaded: (response: PageBackendResponse<GroupRow>) => void;
    onEdit: (group: GroupRow) => void;
    onReady: (handle: PageHandle<GroupRow>) => void;
    onView: (group: GroupRow) => void;
    organizations: PageOrganization[];
}

export function buildGroupsPageConfig({
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
}: GroupsPageConfigOptions): PageConfig<GroupFormValue, GroupRow> {
    const { baseUrl, height, prefix, storageKey } = config;
    const organizationField = buildPageOrganizationField(organizations);

    return new PageConfig<GroupFormValue, GroupRow>({
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
        tableConfig: new PageTableConfig<GroupRow>({
            columns: [...LEADING_COLUMNS, ...modeColumns(mode, isOrganizationShown), CREATED_AT_COLUMN],
            height,
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

function modeColumns(mode: GroupsPageMode, isOrganizationShown: boolean): TableColumn[] {
    switch (mode) {
        case GroupsPageMode.Manage:
            return [EXTRA_ROLE_COUNT_COLUMN, ...(isOrganizationShown ? [ORGANIZATION_COLUMN] : [])];
        case GroupsPageMode.ReadWithRoles:
            return [ROLE_COUNT_COLUMN];
        default:
            return [];
    }
}
