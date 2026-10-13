import { PageViewMode } from './page-categories.model';

export interface PageLink {
    folderId: string | null;
    view: string | null;
    viewMode: PageViewMode;
}
