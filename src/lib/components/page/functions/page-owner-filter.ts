import { SearchField, SearchFieldType } from '../../search/models/search.model';
import { SearchFilter, SearchFilterOperator } from '../../search/models/search-filter.model';
import { PageConfig } from '../models/page.model';
import { PAGE_OWNER_FIELD, PAGE_OWNER_FILTER_LABEL, PAGE_OWNERS_MINIMUM, PageOwner } from '../models/page-owner.model';

export function buildPageOwnerField(owners: PageOwner[]): SearchField | null {
    return owners.length < PAGE_OWNERS_MINIMUM
        ? null
        : new SearchField({
              key: PAGE_OWNER_FIELD,
              label: PAGE_OWNER_FILTER_LABEL,
              operators: [SearchFilterOperator.Equals],
              options: owners.map(({ id, name }) => ({ label: name, value: id })),
              type: SearchFieldType.Select
          });
}

export function hasOwnerFilter(filters: SearchFilter[]): boolean {
    return filters.some(filter => filter.field === PAGE_OWNER_FIELD);
}

export function readOwnerFilterUrl({
    baseUrl,
    tableConfig
}: Pick<PageConfig, 'baseUrl' | 'tableConfig'>): string | null {
    return tableConfig?.search?.isOwnerFilterEnabled && baseUrl ? baseUrl : null;
}
