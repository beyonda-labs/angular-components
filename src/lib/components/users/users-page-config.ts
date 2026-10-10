import { buildPageOrganizationField } from '../page/functions/page-organization-filter';
import { pageStandardAction } from '../page/functions/page-standard-actions';
import { PageConfig, PageHandle } from '../page/models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../page/models/page-action.model';
import { PageFormConfig } from '../page/models/page-form.model';
import { PageHeaderConfig } from '../page/models/page-header.model';
import { PageStatusConfig } from '../page/models/page-lifecycle.model';
import { PageOrganization } from '../page/models/page-organization.model';
import { SearchSort, SearchSortDirection } from '../page/models/page-search.model';
import { PageTableConfig, PageTableSearchConfig } from '../page/models/page-table.model';
import { SearchField, SearchFieldOption, SearchFieldType } from '../search/models/search.model';
import { TableColumn } from '../table/models/table.model';
import { TableCell } from '../table/models/table-cell.model';
import {
    USER_STATUS_TRANSITIONS,
    UserFormValue,
    UserRow,
    USERS_RESEND_INVITATION_ACTION,
    UsersConfig,
    UserStatus
} from './models/users.model';

const LEADING_COLUMNS = [
    new TableColumn({ isHideable: false, isSortable: true, key: 'name', width: 3 }),
    new TableColumn({ isSortable: true, key: 'email', width: 3 })
];
const ORDER: SearchSort = { direction: SearchSortDirection.Asc, field: 'email' };
const ORGANIZATION_COLUMN = new TableColumn({
    isSortable: true,
    key: 'organization',
    sortField: 'organizationName',
    width: 2
});
const TEXT_FIELD = 'text';
const TRAILING_COLUMNS = [
    new TableColumn({ key: 'roles', width: 2 }),
    new TableColumn({ isSortable: true, key: 'status', width: 2 }),
    new TableColumn({ isSortable: true, key: 'lastLoginAt', width: 2 }),
    new TableColumn({ isSortable: true, isVisible: false, key: 'createdAt', width: 2 })
];

export interface UsersPageConfigOptions {
    config: UsersConfig;
    formConfig: PageFormConfig<UserFormValue, UserRow>;
    loadRow: (user: UserRow) => TableCell[];
    onReady: (handle: PageHandle<UserRow>) => void;
    onResendInvitation: (user: UserRow) => void;
    organizations: PageOrganization[];
    roleOptions: SearchFieldOption[];
}

export function buildUsersPageConfig({
    config,
    formConfig,
    loadRow,
    onReady,
    onResendInvitation,
    organizations,
    roleOptions
}: UsersPageConfigOptions): PageConfig<UserFormValue, UserRow> {
    const { baseUrl, height, prefix, storageKey } = config;
    const organizationField = buildPageOrganizationField(organizations);

    return new PageConfig<UserFormValue, UserRow>({
        baseUrl,
        formConfig,
        headerConfig: new PageHeaderConfig<UserRow>({
            actions: [
                pageStandardAction<UserRow>(PageStandardAction.Create),
                pageStandardAction<UserRow>(PageStandardAction.Edit),
                pageStandardAction<UserRow>(PageStandardAction.ChangeStatus),
                new PageAction<UserRow>({
                    handler: ([user]) => onResendInvitation(user),
                    key: USERS_RESEND_INVITATION_ACTION,
                    scope: PageActionScope.Single,
                    zone: PageActionZone.Menu
                })
            ],
            title: `${prefix}.title`
        }),
        onReady,
        prefix,
        statusConfig: new PageStatusConfig({ transitions: USER_STATUS_TRANSITIONS }),
        tableConfig: new PageTableConfig<UserRow>({
            columns: [...LEADING_COLUMNS, ...(organizationField ? [ORGANIZATION_COLUMN] : []), ...TRAILING_COLUMNS],
            height,
            loadRow,
            order: ORDER,
            search: new PageTableSearchConfig({
                fields: [
                    new SearchField({ key: TEXT_FIELD, type: SearchFieldType.Text }),
                    new SearchField({ key: 'status', options: statusOptions(prefix), type: SearchFieldType.Select }),
                    new SearchField({ key: 'role', options: roleOptions, type: SearchFieldType.Select }),
                    ...(organizationField ? [organizationField] : [])
                ],
                mainField: TEXT_FIELD,
                textField: TEXT_FIELD
            }),
            storageKey
        })
    });
}

function statusOptions(prefix: string): SearchFieldOption[] {
    return Object.values(UserStatus).map(status => ({ label: `${prefix}.status.${status}`, value: status }));
}
