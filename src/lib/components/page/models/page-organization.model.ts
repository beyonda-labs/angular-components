import { PageItem } from './page-item.model';

export interface PageOrganization {
    id: string;
    name: string;
}

export interface PageOrganizationItem extends PageItem {
    organizationId?: string | null;
    organizationName?: string | null;
}

export interface PageOrganizationsAnswer {
    baseUrl: string;
    organizations: PageOrganization[];
}

export interface PageOrganizationsResponse {
    organizations: PageOrganization[];
}

export const PAGE_ORGANIZATION_COLUMN_LABEL = 'angular-components.page.table.columns.organization-name';

export const PAGE_ORGANIZATION_COLUMN_TOOLTIP = 'angular-components.page.table.tooltips.organization-name';

export const PAGE_ORGANIZATION_COLUMN_WIDTH = 2;

export const PAGE_ORGANIZATION_FIELD = 'organizationId';

export const PAGE_ORGANIZATION_FILTER_LABEL = 'angular-components.page.search.fields.organization-id';

export const PAGE_ORGANIZATION_NAME_FIELD = 'organizationName';

export const PAGE_ORGANIZATIONS_MINIMUM = 2;

export const PAGE_ORGANIZATIONS_PATH = '/organizations';
