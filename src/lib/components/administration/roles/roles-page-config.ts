import { buildPageOrganizationField } from '../../page/functions/page-organization-filter';
import { pageStandardAction } from '../../page/functions/page-standard-actions';
import { PageConfig, PageHandle } from '../../page/models/page.model';
import { PageStandardAction } from '../../page/models/page-action.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import { PageHeaderConfig } from '../../page/models/page-header.model';
import { PageOrganization } from '../../page/models/page-organization.model';
import { PageTableConfig, PageTableSearchConfig } from '../../page/models/page-table.model';
import { SearchField, SearchFieldType } from '../../search/models/search.model';
import { TableColumn } from '../../table/models/table.model';
import { TableCell } from '../../table/models/table-cell.model';
import { RoleFormValue, RoleRow, RolesConfig } from './models/roles.model';

const DESCRIPTION_COLUMN = new TableColumn({ key: 'description', width: 4 });
const LEADING_COLUMNS = [
    new TableColumn({ isHideable: false, key: 'name', width: 3 }),
    new TableColumn({ key: 'type', width: 2 }),
    new TableColumn({ key: 'permissionCount', width: 2 }),
    new TableColumn({ key: 'memberCount', width: 2 }),
    new TableColumn({ key: 'groupCount', width: 2 })
];
const ORGANIZATION_COLUMN = new TableColumn({ key: 'organization', width: 2 });
const TEXT_FIELD = 'text';

export interface RolesPageConfigOptions {
    config: RolesConfig;
    formConfig: PageFormConfig<RoleFormValue, RoleRow>;
    isOrganizationShown: boolean;
    loadRow: (role: RoleRow) => TableCell[];
    onDuplicate: (role: RoleRow) => void;
    onReady: (handle: PageHandle<RoleRow>) => void;
    organizations: PageOrganization[];
}

export function buildRolesPageConfig({
    config,
    formConfig,
    isOrganizationShown,
    loadRow,
    onDuplicate,
    onReady,
    organizations
}: RolesPageConfigOptions): PageConfig<RoleFormValue, RoleRow> {
    const { baseUrl, height, prefix, storageKey } = config;
    const organizationField = buildPageOrganizationField(organizations);

    return new PageConfig<RoleFormValue, RoleRow>({
        baseUrl,
        formConfig,
        headerConfig: new PageHeaderConfig<RoleRow>({
            actions: [
                pageStandardAction<RoleRow>(PageStandardAction.Create),
                pageStandardAction<RoleRow>(PageStandardAction.Edit),
                pageStandardAction<RoleRow>(PageStandardAction.Duplicate, { handler: ([role]) => onDuplicate(role) }),
                pageStandardAction<RoleRow>(PageStandardAction.Delete)
            ],
            title: `${prefix}.title`
        }),
        onReady,
        prefix,
        tableConfig: new PageTableConfig<RoleRow>({
            columns: [...LEADING_COLUMNS, ...(isOrganizationShown ? [ORGANIZATION_COLUMN] : []), DESCRIPTION_COLUMN],
            height,
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
