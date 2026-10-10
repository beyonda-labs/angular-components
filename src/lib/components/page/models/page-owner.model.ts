import { PageItem } from './page-item.model';

export interface PageOwnedItem extends PageItem {
    ownerId: string | null;
    ownerName: string | null;
}

export interface PageOwner {
    id: string;
    name: string;
}

export interface PageOwnersAnswer {
    baseUrl: string;
    owners: PageOwner[];
}

export interface PageOwnersResponse {
    owners: PageOwner[];
}

export const PAGE_OWNER_COLUMN_LABEL = 'angular-components.page.table.columns.owner-name';

export const PAGE_OWNER_COLUMN_TOOLTIP = 'angular-components.page.table.tooltips.owner-name';

export const PAGE_OWNER_COLUMN_WIDTH = 2;

export const PAGE_OWNER_FIELD = 'ownerId';

export const PAGE_OWNER_FILTER_LABEL = 'angular-components.page.search.fields.owner-id';

export const PAGE_OWNER_NAME_FIELD = 'ownerName';

export const PAGE_OWNERS_MINIMUM = 2;

export const PAGE_OWNERS_PATH = '/owners';
