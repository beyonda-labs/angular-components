import { pageStandardAction } from '../../page/functions/page-standard-actions';
import { PageConfig } from '../../page/models/page.model';
import { PageActionScope, PageStandardAction } from '../../page/models/page-action.model';
import { PageHeaderConfig } from '../../page/models/page-header.model';
import { SearchSort, SearchSortDirection } from '../../page/models/page-search.model';
import { PageTableConfig, PageTableSearchConfig } from '../../page/models/page-table.model';
import { SearchField, SearchFieldType } from '../../search/models/search.model';
import { TableColumn } from '../../table/models/table.model';
import { organizationStatusOptions } from './functions/organization-status';
import { OrganizationFormValue, OrganizationRow, OrganizationsPageConfigOptions } from './models/organizations.model';

const COLUMNS = [
    new TableColumn({ isHideable: false, isSortable: true, key: 'name', width: 5 }),
    new TableColumn({ key: 'status', width: 2 }),
    new TableColumn({ isSortable: true, key: 'userCount', width: 2 }),
    new TableColumn({ isSortable: true, key: 'createdAt', width: 2 })
];
const ORDER: SearchSort = { direction: SearchSortDirection.Asc, field: 'name' };
const TEXT_FIELD = 'text';

export function buildOrganizationsPageConfig({
    config,
    formConfig,
    loadRow,
    onDelete,
    onEdit,
    onReady
}: OrganizationsPageConfigOptions): PageConfig<OrganizationFormValue, OrganizationRow> {
    const { baseUrl, height, prefix, storageKey } = config;

    return new PageConfig<OrganizationFormValue, OrganizationRow>({
        baseUrl,
        formConfig,
        headerConfig: new PageHeaderConfig<OrganizationRow>({
            actions: [
                pageStandardAction<OrganizationRow>(PageStandardAction.Create),
                pageStandardAction<OrganizationRow>(PageStandardAction.Edit, {
                    action: ([organization]) => onEdit(organization)
                }),
                pageStandardAction<OrganizationRow>(PageStandardAction.Delete, {
                    action: ([organization]) => onDelete(organization),
                    scope: PageActionScope.Single
                })
            ],
            title: `${prefix}.title`
        }),
        onReady,
        prefix,
        tableConfig: new PageTableConfig<OrganizationRow>({
            columns: COLUMNS,
            height,
            loadRow,
            order: ORDER,
            search: new PageTableSearchConfig({
                fields: [
                    new SearchField({ key: TEXT_FIELD, type: SearchFieldType.Text }),
                    new SearchField({
                        key: 'status',
                        options: organizationStatusOptions(prefix),
                        type: SearchFieldType.Select
                    })
                ],
                mainField: TEXT_FIELD,
                textField: TEXT_FIELD
            }),
            storageKey
        })
    });
}
