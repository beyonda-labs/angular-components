import { buildPageOrganizationField } from '../../page/functions/page-organization-filter';
import { pageStandardAction } from '../../page/functions/page-standard-actions';
import { PageBackendResponse, PageConfig, PageHandle } from '../../page/models/page.model';
import { PageStandardAction } from '../../page/models/page-action.model';
import { PageCategoriesConfig } from '../../page/models/page-categories.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import { PageHeaderConfig } from '../../page/models/page-header.model';
import { PageOrganization } from '../../page/models/page-organization.model';
import { PageTableConfig, PageTableSearchConfig } from '../../page/models/page-table.model';
import { SearchField, SearchFieldType } from '../../search/models/search.model';
import { TableColumn } from '../../table/models/table.model';
import { TableCell } from '../../table/models/table-cell.model';
import { isColumnShownInFolders } from '../functions/organization-folders';
import { ORGANIZATION_COLUMN_KEY, OrganizationFolder } from '../models/organization-folders.model';
import { RoleFormValue, RoleRow, RolesConfig, RolesPageMode } from './models/roles.model';

const DESCRIPTION_COLUMN = new TableColumn({ key: 'description', width: 4 });
const LEADING_COLUMNS = [
    new TableColumn({ isHideable: false, key: 'name', width: 3 }),
    new TableColumn({ key: 'type', width: 2 }),
    new TableColumn({ key: 'permissionCount', width: 2 })
];
const MANAGE_COLUMNS = [
    new TableColumn({ key: 'memberCount', width: 2 }),
    new TableColumn({ key: 'groupCount', width: 2 })
];
const ORGANIZATION_COLUMN = new TableColumn({ key: ORGANIZATION_COLUMN_KEY, width: 2 });
const SOURCES_COLUMN = new TableColumn({ key: 'sources', width: 3 });
const TEXT_FIELD = 'text';

export interface RolesPageConfigOptions {
    config: RolesConfig;
    formConfig: PageFormConfig<RoleFormValue, RoleRow>;
    isOrganizationShown: boolean;
    loadRow: (role: RoleRow) => TableCell[];
    mode: RolesPageMode;
    onDataLoaded: (response: PageBackendResponse<RoleRow | OrganizationFolder>) => void;
    onDuplicate: (role: RoleRow) => void;
    onReady: (handle: PageHandle<RoleRow, OrganizationFolder>) => void;
    onView: (role: RoleRow) => void;
    organizations: PageOrganization[];

    categoriesConfig?: PageCategoriesConfig<OrganizationFolder>;
}

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
                    handler: ([role]) => onView(role),
                    tooltip: `${prefix}.actions.view.tooltip`
                }),
                pageStandardAction<RoleRow>(PageStandardAction.Duplicate, { handler: ([role]) => onDuplicate(role) }),
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
                ...(mode === RolesPageMode.Read ? [SOURCES_COLUMN] : MANAGE_COLUMNS),
                ...(isOrganizationShown ? [ORGANIZATION_COLUMN] : []),
                DESCRIPTION_COLUMN
            ],
            height: categoriesConfig ? foldersHeight : height,
            isColumnShown: categoriesConfig ? isColumnShownInFolders : undefined,
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
