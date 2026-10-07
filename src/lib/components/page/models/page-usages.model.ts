import { ConfirmationModalConfig } from '../../modal/models/modal.model';
import { PageStandardAction } from './page-action.model';

export const PAGE_MORE_USERS = '...';
export const PAGE_USAGE_COUNT_FIELD = 'usageCount';
export const PAGE_USAGES_IDS_SEPARATOR = ',';
export const PAGE_USED_BY_FIELD = 'usedBy';
export const PAGE_USERS_SEPARATOR = ', ';
export const PAGE_USAGE_CHECKED_ACTIONS: ReadonlySet<string> = new Set([
    PageStandardAction.Delete,
    PageStandardAction.DeleteTrashItem
]);

export interface InUseConfirmationOptions {
    confirmation: ConfirmationModalConfig;
    inUseModal: string;
    listedUsers: number;
    selectedIds: (string | number)[];
    suffixes: Record<string, string>;
    usages: PageUsages[];
}

export interface PageUsages {
    id: string;
    total: number;
    users: PageUser[];
}

export interface PageUsagesResponse {
    usages: PageUsages[];
}

export interface PageUser {
    id: string;
    name: string;
    resource: string;

    kind?: string;
}

export interface PageUserList {
    total: number;
    users: PageUser[];
}

export class PageUsagesConfig {
    listedUsers: number;
    suffixes: Record<string, string>;

    constructor({ listedUsers = 10, suffixes = {} }: PageUsagesConfigParameters = {}) {
        this.listedUsers = listedUsers;
        this.suffixes = suffixes;
    }
}

export interface PageUsagesConfigParameters {
    listedUsers?: number;
    suffixes?: Record<string, string>;
}
