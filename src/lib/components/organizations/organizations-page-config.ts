import { pageStandardAction } from '../page/functions/page-standard-actions';
import { PageConfig, PageHandle } from '../page/models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../page/models/page-action.model';
import { PageFormConfig } from '../page/models/page-form.model';
import { PageHeaderConfig } from '../page/models/page-header.model';
import { PageStatusConfig } from '../page/models/page-lifecycle.model';
import { SearchSort, SearchSortDirection } from '../page/models/page-search.model';
import { PageTableConfig, PageTableSearchConfig } from '../page/models/page-table.model';
import { SearchField, SearchFieldOption, SearchFieldType } from '../search/models/search.model';
import { TableColumn } from '../table/models/table.model';
import { TableCell } from '../table/models/table-cell.model';
import {
    ORGANIZATION_STATUS_TRANSITIONS,
    OrganizationFormValue,
    OrganizationRow,
    ORGANIZATIONS_INVITE_ADMIN_ACTION,
    OrganizationsConfig,
    OrganizationStatus
} from './models/organizations.model';

const COLUMNS = [
    new TableColumn({ isHideable: false, isSortable: true, key: 'name', width: 5 }),
    new TableColumn({ key: 'status', width: 2 }),
    new TableColumn({ isSortable: true, key: 'userCount', width: 2 }),
    new TableColumn({ isSortable: true, key: 'createdAt', width: 2 })
];
const ORDER: SearchSort = { direction: SearchSortDirection.Asc, field: 'name' };
const TEXT_FIELD = 'text';

export interface OrganizationsPageConfigOptions {
    config: OrganizationsConfig;
    formConfig: PageFormConfig<OrganizationFormValue, OrganizationRow>;
    loadRow: (organization: OrganizationRow) => TableCell[];
    onInviteAdmin: (organization: OrganizationRow) => void;
    onReady: (handle: PageHandle<OrganizationRow>) => void;
}

export function buildOrganizationsPageConfig({
    config,
    formConfig,
    loadRow,
    onInviteAdmin,
    onReady
}: OrganizationsPageConfigOptions): PageConfig<OrganizationFormValue, OrganizationRow> {
    const { baseUrl, height, prefix, storageKey } = config;

    return new PageConfig<OrganizationFormValue, OrganizationRow>({
        baseUrl,
        formConfig,
        headerConfig: new PageHeaderConfig<OrganizationRow>({
            actions: [
                pageStandardAction<OrganizationRow>(PageStandardAction.Create),
                pageStandardAction<OrganizationRow>(PageStandardAction.Edit),
                pageStandardAction<OrganizationRow>(PageStandardAction.ChangeStatus),
                new PageAction<OrganizationRow>({
                    handler: ([organization]) => onInviteAdmin(organization),
                    key: ORGANIZATIONS_INVITE_ADMIN_ACTION,
                    scope: PageActionScope.Single,
                    zone: PageActionZone.Menu
                })
            ],
            title: `${prefix}.title`
        }),
        onReady,
        prefix,
        statusConfig: new PageStatusConfig({ transitions: ORGANIZATION_STATUS_TRANSITIONS }),
        tableConfig: new PageTableConfig<OrganizationRow>({
            columns: COLUMNS,
            height,
            loadRow,
            order: ORDER,
            search: new PageTableSearchConfig({
                fields: [
                    new SearchField({ key: TEXT_FIELD, type: SearchFieldType.Text }),
                    new SearchField({ key: 'status', options: statusOptions(prefix), type: SearchFieldType.Select })
                ],
                mainField: TEXT_FIELD,
                textField: TEXT_FIELD
            }),
            storageKey
        })
    });
}

function statusOptions(prefix: string): SearchFieldOption[] {
    return Object.values(OrganizationStatus).map(status => ({ label: `${prefix}.status.${status}`, value: status }));
}
