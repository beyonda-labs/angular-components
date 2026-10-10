import { SearchField, SearchFieldType } from '../../search/models/search.model';
import { SearchFilter, SearchFilterOperator } from '../../search/models/search-filter.model';
import { PageConfig } from '../models/page.model';
import {
    PAGE_ORGANIZATION_FIELD,
    PAGE_ORGANIZATION_FILTER_LABEL,
    PAGE_ORGANIZATIONS_MINIMUM,
    PageOrganization
} from '../models/page-organization.model';
import { hasOrganizationColumn } from './page-organization-column';

export function buildPageOrganizationField(organizations: PageOrganization[]): SearchField | null {
    return hasOrganizationChoice(organizations)
        ? new SearchField({
              key: PAGE_ORGANIZATION_FIELD,
              label: PAGE_ORGANIZATION_FILTER_LABEL,
              operators: [SearchFilterOperator.Equals],
              options: organizations.map(({ id, name }) => ({ label: name, value: id })),
              type: SearchFieldType.Select
          })
        : null;
}

export function hasOrganizationChoice(organizations: PageOrganization[]): boolean {
    return organizations.length >= PAGE_ORGANIZATIONS_MINIMUM;
}

export function hasOrganizationFilter(filters: SearchFilter[]): boolean {
    return filters.some(filter => filter.field === PAGE_ORGANIZATION_FIELD);
}

export function readOrganizationsUrl({
    baseUrl,
    tableConfig
}: Pick<PageConfig, 'baseUrl' | 'tableConfig'>): string | null {
    const isEnabled =
        Boolean(tableConfig?.search?.isOrganizationFilterEnabled) || hasOrganizationColumn(tableConfig?.columns ?? []);

    return isEnabled && baseUrl ? baseUrl : null;
}
