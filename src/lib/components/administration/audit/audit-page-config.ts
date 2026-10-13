import { faDownload } from '@fortawesome/free-solid-svg-icons';

import { pageDateRangeFields } from '../../page/functions/page-date-range-filter';
import { buildPageOrganizationField } from '../../page/functions/page-organization-filter';
import { pageStandardAction } from '../../page/functions/page-standard-actions';
import { PageConfig } from '../../page/models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../../page/models/page-action.model';
import { PageHeaderConfig } from '../../page/models/page-header.model';
import { SearchSort, SearchSortDirection } from '../../page/models/page-search.model';
import { PageTableConfig, PageTableSearchConfig } from '../../page/models/page-table.model';
import { SearchField, SearchFieldType } from '../../search/models/search.model';
import { SearchFilterOperator } from '../../search/models/search-filter.model';
import { TableColumn } from '../../table/models/table.model';
import { ORGANIZATION_COLUMN_KEY } from '../models/organization-folders.model';
import { auditActionOptions, auditEntityOptions } from './functions/audit-filters';
import { AUDIT_EXPORT_ACTION, AuditEventRow, AuditPageConfigOptions } from './models/audit.model';

const COLUMNS = [
    new TableColumn({ isHideable: false, isSortable: true, key: 'occurredAt', width: 2 }),
    new TableColumn({ isSortable: true, key: 'user', sortField: 'userName', width: 3 }),
    new TableColumn({ key: 'action', width: 2 }),
    new TableColumn({ isSortable: true, key: 'entityName', width: 3 }),
    new TableColumn({ isSortable: true, key: 'ip', width: 2 })
];
const EQUALS = [SearchFilterOperator.Equals];
const ORDER: SearchSort = { direction: SearchSortDirection.Desc, field: 'occurredAt' };
const ORGANIZATION_COLUMN = new TableColumn({
    isSortable: true,
    key: ORGANIZATION_COLUMN_KEY,
    sortField: 'organizationName',
    width: 2
});
const TEXT_FIELD = 'text';

export function buildAuditPageConfig({
    config,
    hasSeveralOrganizations,
    isOrganizationShown,
    loadRow,
    onDataLoaded,
    onExport,
    onReady,
    onView,
    organizations,
    searchUsers
}: AuditPageConfigOptions): PageConfig<unknown, AuditEventRow> {
    const { baseUrl, height, prefix, storageKey } = config;
    const organizationField = buildPageOrganizationField(organizations);

    return new PageConfig<unknown, AuditEventRow>({
        baseUrl,
        headerConfig: new PageHeaderConfig<AuditEventRow>({
            actions: [
                pageStandardAction<AuditEventRow>(PageStandardAction.View, {
                    handler: ([event]) => onView(event),
                    tooltip: `${prefix}.actions.view.tooltip`
                }),
                new PageAction<AuditEventRow>({
                    handler: () => onExport(),
                    icon: faDownload,
                    key: AUDIT_EXPORT_ACTION,
                    scope: PageActionScope.Global,
                    zone: PageActionZone.Right
                })
            ],
            title: `${prefix}.title`
        }),
        onDataLoaded,
        onReady,
        prefix,
        tableConfig: new PageTableConfig<AuditEventRow>({
            columns: [...COLUMNS, ...(isOrganizationShown ? [ORGANIZATION_COLUMN] : [])],
            height,
            isColumnShown: ({ key }) => key !== ORGANIZATION_COLUMN_KEY || hasSeveralOrganizations(),
            loadRow,
            order: ORDER,
            search: new PageTableSearchConfig({
                fields: [
                    new SearchField({ key: TEXT_FIELD, type: SearchFieldType.Text }),
                    ...pageDateRangeFields(),
                    new SearchField({
                        key: 'userId',
                        operators: EQUALS,
                        searchOptions: searchUsers,
                        type: SearchFieldType.Autocomplete
                    }),
                    new SearchField({
                        key: 'entity',
                        operators: EQUALS,
                        options: auditEntityOptions(config),
                        type: SearchFieldType.Select
                    }),
                    new SearchField({
                        key: 'action',
                        operators: EQUALS,
                        options: auditActionOptions(config),
                        type: SearchFieldType.Select
                    }),
                    ...(organizationField ? [organizationField] : [])
                ],
                mainField: TEXT_FIELD,
                textField: TEXT_FIELD
            }),
            storageKey
        })
    });
}
