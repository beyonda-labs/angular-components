import { Observable } from 'rxjs';

import { PageOwner } from './page-owner.model';

export interface PageTransferFields {
    targetUserId: string;
}

export interface PageTransferFormOptions {
    count: number;
    notice: string;
    owners: PageOwner[];
    searchTargets: (search: string, limit: number) => Observable<PageTransferTargets>;
}

export interface PageTransferFormValue {
    main: PageTransferFields;
}

export interface PageTransferResponse {
    transferred: number;
}

export interface PageTransferTarget {
    label: string;
    value: string;

    description?: string;
}

export interface PageTransferTargets {
    options: PageTransferTarget[];

    hasMore?: boolean;
}

export const PAGE_TRANSFER_CATEGORY_IDS_PARAMETER = 'categoryIds';

export const PAGE_TRANSFER_FORM_PREFIX = 'angular-components.page.transfer';

export const PAGE_TRANSFER_FORM_SECTION = 'main';

export const PAGE_TRANSFER_IDS_PARAMETER = 'ids';

export const PAGE_TRANSFER_NOTICE = 'angular-components.page.transfer.notice';

export const PAGE_TRANSFER_PATH = '/transfer';

export const PAGE_TRANSFER_SEARCH_LIMIT = 20;

export const PAGE_TRANSFER_SUCCESS_TOAST = 'angular-components.page.toast.transferred';

export const PAGE_TRANSFER_TARGETS_PATH = '/transfer-targets';

export class PageTransferConfig {
    notice: string;

    constructor({ notice = PAGE_TRANSFER_NOTICE }: PageTransferConfigParameters = {}) {
        this.notice = notice;
    }
}

export interface PageTransferConfigParameters {
    notice?: string;
}
