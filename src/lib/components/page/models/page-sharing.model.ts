import { Observable } from 'rxjs';

export enum PageShareAccess {
    Read = 'read',
    Write = 'write'
}

export enum PageShareGranteeType {
    Group = 'group',
    User = 'user'
}

export interface PageInheritedShare extends PageShare {
    folderId: string;
    folderName: string;
}

export interface PageShare {
    access: PageShareAccess;
    granteeId: string;
    granteeName: string;
    granteeType: PageShareGranteeType;
    id: string;
}

export interface PageShareEntry {
    access: PageShareAccess;
    granteeId: string;
    granteeType: PageShareGranteeType;
}

export interface PageShareFormOptions {
    folderName: string;
    inherited: PageInheritedShare[];
    searchTargets: (search: string, limit: number) => Observable<PageShareTargets>;
    shares: PageShare[];
}

export interface PageShareFormValue {
    grantees?: Partial<Record<PageShareAccess, string[]>>;
}

export interface PageShares {
    inherited: PageInheritedShare[];
    shares: PageShare[];
}

export interface PageShareTarget {
    id: string;
    name: string;

    email?: string;
    memberCount?: number;
}

export interface PageShareTargets {
    groups: PageShareTarget[];
    users: PageShareTarget[];

    hasMore?: boolean;
}

export const PAGE_SHARE_ACCESS_LEVELS: readonly PageShareAccess[] = [PageShareAccess.Read, PageShareAccess.Write];

export const PAGE_SHARE_FORM_PREFIX = 'angular-components.page.share';

export const PAGE_SHARE_FORM_SECTION = 'grantees';

export const PAGE_SHARE_SEARCH_LIMIT = 20;

export const PAGE_SHARE_SEARCH_MAX_LIMIT = 50;

export const PAGE_SHARED_LABEL = 'angular-components.page.shared.label';

export const PAGE_SHARED_PATH = '/shared';
