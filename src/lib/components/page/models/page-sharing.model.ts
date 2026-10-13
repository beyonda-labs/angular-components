export enum PageShareAccess {
    Read = 'read',
    Write = 'write'
}

export enum PageShareGranteeType {
    Group = 'group',
    User = 'user'
}

export type PageShareFormValue = Partial<Record<PageShareSection, Record<string, string>>>;

export type PageShareSection = 'groups' | 'users';

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

export interface PageShareChoice {
    field: string;
    granteeId: string;
    granteeType: PageShareGranteeType;
    name: string;
    options: PageShareAccess[];
    section: PageShareSection;
    value: PageShareAccess | '';

    email?: string;
    inherited?: PageInheritedShare;
    own?: PageShareAccess;
}

export interface PageShareEntry {
    access: PageShareAccess;
    granteeId: string;
    granteeType: PageShareGranteeType;
}

export interface PageShares {
    inherited: PageInheritedShare[];
    shares: PageShare[];
}

export interface PageShareTarget {
    id: string;
    name: string;

    email?: string;
}

export interface PageShareTargets {
    groups: PageShareTarget[];
    users: PageShareTarget[];
}

export const PAGE_SHARE_ACCESS_LEVELS: readonly PageShareAccess[] = [PageShareAccess.Read, PageShareAccess.Write];

export const PAGE_SHARE_FORM_PREFIX = 'angular-components.page.share';

export const PAGE_SHARED_LABEL = 'angular-components.page.shared.label';

export const PAGE_SHARED_PATH = '/shared';
