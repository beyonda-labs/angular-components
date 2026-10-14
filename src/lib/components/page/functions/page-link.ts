import { Params } from '@angular/router';

import { PageConfig } from '../models/page.model';
import { PageViewMode } from '../models/page-categories.model';
import { PageLink } from '../models/page-link.model';

type PageLinkSource = Pick<PageConfig, 'baseUrl' | 'tableConfig' | 'views'>;

const FOLDER_PARAM = 'folder';
const VIEW_PARAM = 'view';

export function readPageLink(queryParameters: Params, config: PageLinkSource): PageLink | null {
    const view = readParameter(queryParameters, VIEW_PARAM);
    const folderId = readParameter(queryParameters, FOLDER_PARAM);

    if (view === null && folderId === null) {
        return null;
    }

    const target = resolveView(view, config);
    const hasFolders = Boolean(config.baseUrl && config.tableConfig?.categoriesConfig);
    const isFlatView = config.views.some(current => current.key === target.view && current.baseUrl);

    return {
        ...target,
        folderId: hasFolders && !isFlatView && target.viewMode !== PageViewMode.Trash ? folderId : null
    };
}

export function withoutPageLink(queryParameters: Params): Params {
    return Object.fromEntries(
        Object.entries(queryParameters).filter(([key]) => key !== VIEW_PARAM && key !== FOLDER_PARAM)
    );
}

function readParameter(queryParameters: Params, key: string): string | null {
    const value: unknown = queryParameters[key];
    const first: unknown = Array.isArray(value) ? value[0] : value;

    return typeof first === 'string' && first.length > 0 ? first : null;
}

function resolveView(view: string | null, config: PageLinkSource): Omit<PageLink, 'folderId'> {
    if (view === PageViewMode.Shared && config.tableConfig?.isSharedEnabled) {
        return { view: null, viewMode: PageViewMode.Shared };
    }

    if (view === PageViewMode.Trash && config.tableConfig?.isTrashEnabled) {
        return { view: null, viewMode: PageViewMode.Trash };
    }

    const isOwnView = config.views.some(current => current.key === view);

    return { view: isOwnView ? view : null, viewMode: PageViewMode.Table };
}
