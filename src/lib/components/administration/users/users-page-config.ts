import { buildPageOrganizationField } from '../../page/functions/page-organization-filter';
import { pageStandardAction } from '../../page/functions/page-standard-actions';
import { PageConfig, PageHandle } from '../../page/models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../../page/models/page-action.model';
import { PageCategoriesConfig } from '../../page/models/page-categories.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import { PageHeaderConfig } from '../../page/models/page-header.model';
import { PageOrganization } from '../../page/models/page-organization.model';
import { SearchSort, SearchSortDirection } from '../../page/models/page-search.model';
import { PageTableConfig, PageTableSearchConfig } from '../../page/models/page-table.model';
import { SearchField, SearchFieldOption, SearchFieldType } from '../../search/models/search.model';
import { TableColumn } from '../../table/models/table.model';
import { TableCell } from '../../table/models/table-cell.model';
import { isColumnShownInFolders } from '../functions/organization-folders';
import { ORGANIZATION_COLUMN_KEY, OrganizationFolder } from '../models/organization-folders.model';
import {
    UserFormValue,
    UserRow,
    USERS_RESEND_INVITATION_ACTION,
    USERS_TRANSFER_ACTION,
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
    key: ORGANIZATION_COLUMN_KEY,
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
    isOrganizationShown: boolean;
    loadRow: (user: UserRow) => TableCell[];
    onDelete: (users: UserRow[]) => void;
    onReady: (handle: PageHandle<UserRow, OrganizationFolder>) => void;
    onResendInvitation: (user: UserRow) => void;
    onTransfer: (user: UserRow) => void;
    organizations: PageOrganization[];
    roleOptions: SearchFieldOption[];

    categoriesConfig?: PageCategoriesConfig<OrganizationFolder>;
}

export function buildUsersPageConfig({
    categoriesConfig,
    config,
    formConfig,
    isOrganizationShown,
    loadRow,
    onDelete,
    onReady,
    onResendInvitation,
    onTransfer,
    organizations,
    roleOptions
}: UsersPageConfigOptions): PageConfig<UserFormValue, UserRow, OrganizationFolder> {
    const { baseUrl, foldersHeight, height, prefix, storageKey } = config;
    const organizationField = buildPageOrganizationField(organizations);

    return new PageConfig<UserFormValue, UserRow, OrganizationFolder>({
        baseUrl,
        formConfig,
        headerConfig: new PageHeaderConfig<UserRow>({
            actions: [
                pageStandardAction<UserRow>(PageStandardAction.Create),
                pageStandardAction<UserRow>(PageStandardAction.Edit),
                new PageAction<UserRow>({
                    handler: ([user]) => onResendInvitation(user),
                    key: USERS_RESEND_INVITATION_ACTION,
                    scope: PageActionScope.Single,
                    zone: PageActionZone.Menu
                }),
                new PageAction<UserRow>({
                    handler: ([user]) => onTransfer(user),
                    key: USERS_TRANSFER_ACTION,
                    scope: PageActionScope.Single,
                    zone: PageActionZone.Menu
                }),
                pageStandardAction<UserRow>(PageStandardAction.Delete, { handler: users => onDelete(users) })
            ],
            title: `${prefix}.title`
        }),
        onReady,
        prefix,
        tableConfig: new PageTableConfig<UserRow, OrganizationFolder>({
            categoriesConfig,
            columns: [...LEADING_COLUMNS, ...(isOrganizationShown ? [ORGANIZATION_COLUMN] : []), ...TRAILING_COLUMNS],
            height: categoriesConfig ? foldersHeight : height,
            isColumnShown: categoriesConfig ? isColumnShownInFolders : undefined,
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
