import { buildPageOrganizationField } from '../../page/functions/page-organization-filter';
import { pageStandardAction } from '../../page/functions/page-standard-actions';
import { PageConfig } from '../../page/models/page.model';
import { PageStandardAction } from '../../page/models/page-action.model';
import { PageHeaderConfig } from '../../page/models/page-header.model';
import { PageTableConfig, PageTableSearchConfig } from '../../page/models/page-table.model';
import { SearchField, SearchFieldType } from '../../search/models/search.model';
import { TableColumn } from '../../table/models/table.model';
import { isColumnShownInFolders } from '../functions/organization-folders';
import { ORGANIZATION_COLUMN_KEY, OrganizationFolder } from '../models/organization-folders.model';
import { RoleFormValue, RoleRow, RolesPageConfigOptions, RolesPageMode } from './models/roles.model';

const DESCRIPTION_COLUMN = new TableColumn({ key: 'description', width: 4 });
const GROUP_COUNT_COLUMN = new TableColumn({ key: 'groupCount', width: 2 });
const LEADING_COLUMNS = [
    new TableColumn({ isHideable: false, key: 'name', width: 3 }),
    new TableColumn({ key: 'type', width: 2 }),
    new TableColumn({ key: 'permissionCount', width: 2 })
];
const MEMBER_COUNT_COLUMN = new TableColumn({ key: 'memberCount', width: 2 });
const ORGANIZATION_COLUMN = new TableColumn({ key: ORGANIZATION_COLUMN_KEY, width: 2 });
const SOURCES_COLUMN = new TableColumn({ key: 'sources', width: 3 });
const TEXT_FIELD = 'text';

export function buildRolesPageConfig({
    categoriesConfig,
    config,
    formConfig,
    isOrganizationShown,
    loadRow,
    mode,
    onDataLoaded,
    onDuplicate,
    onReady,
    onView,
    organizations
}: RolesPageConfigOptions): PageConfig<RoleFormValue, RoleRow, OrganizationFolder> {
    const { baseUrl, foldersHeight, height, prefix, storageKey } = config;
    const organizationField = buildPageOrganizationField(organizations);

    return new PageConfig<RoleFormValue, RoleRow, OrganizationFolder>({
        baseUrl,
        formConfig,
        headerConfig: new PageHeaderConfig<RoleRow>({
            actions: [
                pageStandardAction<RoleRow>(PageStandardAction.Create),
                pageStandardAction<RoleRow>(PageStandardAction.Edit),
                pageStandardAction<RoleRow>(PageStandardAction.View, {
                    action: ([role]) => onView(role),
                    tooltip: `${prefix}.actions.view.tooltip`
                }),
                pageStandardAction<RoleRow>(PageStandardAction.Duplicate, { action: ([role]) => onDuplicate(role) }),
                pageStandardAction<RoleRow>(PageStandardAction.Delete)
            ],
            title: `${prefix}.title`
        }),
        onDataLoaded,
        onReady,
        prefix,
        tableConfig: new PageTableConfig<RoleRow, OrganizationFolder>({
            categoriesConfig,
            columns: [
                ...LEADING_COLUMNS,
                MEMBER_COUNT_COLUMN,
                GROUP_COUNT_COLUMN,
                SOURCES_COLUMN,
                ...(isOrganizationShown ? [ORGANIZATION_COLUMN] : []),
                DESCRIPTION_COLUMN
            ],
            height: categoriesConfig ? (foldersHeight ?? height) : height,
            isColumnShown: (column, context) =>
                isColumnShownInMode(column, mode()) && (!categoriesConfig || isColumnShownInFolders(column, context)),
            loadRow,
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

function isColumnShownInMode({ key }: TableColumn, mode: RolesPageMode): boolean {
    switch (key) {
        case GROUP_COUNT_COLUMN.key:
        case MEMBER_COUNT_COLUMN.key:
            return mode === RolesPageMode.Manage;
        case SOURCES_COLUMN.key:
            return mode === RolesPageMode.Read;
        default:
            return true;
    }
}
