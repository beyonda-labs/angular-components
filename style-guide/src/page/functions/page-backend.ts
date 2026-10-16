import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import {
    BeyPageBackendResponse,
    BeyPageShareTarget,
    BeyPageTransferResponse,
    BeyPageTransferTargets
} from '@beyonda-labs/angular-components';
import { Observable, of } from 'rxjs';

import {
    STYLE_GUIDE_DOCUMENT_OWNER_ID,
    STYLE_GUIDE_DOCUMENT_SHARES,
    STYLE_GUIDE_DOCUMENTS,
    STYLE_GUIDE_DOCUMENTS_URL,
    STYLE_GUIDE_SHARE_GROUPS,
    STYLE_GUIDE_SHARE_USERS,
    STYLE_GUIDE_SHARED_FOLDER_IDS,
    StyleGuideDocument
} from '../models/page-backend.model';

const CATEGORIES = 'categories';
const GET = 'GET';
const NO_SHARES = { inherited: [], shares: [] };
const PARENT_PARAMETER = 'parentId';
const PATH = 'path';
const POST = 'POST';
const PUT = 'PUT';
const ROOT_PARENT = 'null';
const SEARCH_PARAMETER = 'search';
const SHARE_TARGETS = 'share-targets';
const SHARED = 'shared';
const SHARES = 'shares';
const TRANSFER = 'transfer';
const TRANSFER_TARGETS = 'transfer-targets';

export function pageStyleGuideInterceptor(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
    const segments = segmentsOf(request.url);
    const body = segments ? answerOf(request, segments) : undefined;

    return body === undefined ? next(request) : of(new HttpResponse({ body, status: 200, url: request.url }));
}

function answerCategory(request: HttpRequest<unknown>, id: string, detail: string): unknown {
    if (request.method === PUT && detail === SHARES) {
        return request.body ?? NO_SHARES;
    }

    if (request.method !== GET) {
        return undefined;
    }

    if (detail === PATH) {
        return pathOf(id);
    }

    if (detail === SHARES) {
        return STYLE_GUIDE_DOCUMENT_SHARES[id] ?? NO_SHARES;
    }

    return detail === SHARE_TARGETS ? targetsOf(request) : undefined;
}

function answerOf(request: HttpRequest<unknown>, segments: string[]): unknown {
    const [first, id, detail] = segments;

    if (first === CATEGORIES && id && detail) {
        return answerCategory(request, id, detail);
    }

    if (request.method === POST) {
        return first === TRANSFER ? transferredOf(request) : undefined;
    }

    if (request.method !== GET) {
        return undefined;
    }

    if (first === SHARED) {
        return listOf(STYLE_GUIDE_DOCUMENTS.filter(row => STYLE_GUIDE_SHARED_FOLDER_IDS.includes(String(row.id))));
    }

    if (first === TRANSFER_TARGETS) {
        return transferTargetsOf(request);
    }

    return first ? undefined : listOf(childrenOf(request.params.get(PARENT_PARAMETER) ?? ROOT_PARENT));
}

function childrenOf(parentId: string): StyleGuideDocument[] {
    return parentId === ROOT_PARENT
        ? STYLE_GUIDE_DOCUMENTS.filter(row => row.parentId === null && row.ownerId === STYLE_GUIDE_DOCUMENT_OWNER_ID)
        : STYLE_GUIDE_DOCUMENTS.filter(row => row.parentId === parentId);
}

function listOf(results: StyleGuideDocument[]): BeyPageBackendResponse<StyleGuideDocument> {
    return { globalActions: [], results, search: { filters: [], page: 1, size: 25, total: results.length } };
}

function matching(targets: readonly BeyPageShareTarget[], text: string): BeyPageShareTarget[] {
    return targets.filter(({ email, name }) => [name, email].some(value => value?.toLowerCase().includes(text)));
}

function pathOf(id: string): StyleGuideDocument[] {
    const folder = STYLE_GUIDE_DOCUMENTS.find(row => row.id === id);

    return folder ? [...(folder.parentId === null ? [] : pathOf(folder.parentId)), folder] : [];
}

function searchTextOf(request: HttpRequest<unknown>): string {
    return request.params.get(SEARCH_PARAMETER)?.trim().toLowerCase() ?? '';
}

function segmentsOf(url: string): string[] | null {
    const start = url.indexOf(STYLE_GUIDE_DOCUMENTS_URL);

    return start === -1
        ? null
        : url
              .slice(start + STYLE_GUIDE_DOCUMENTS_URL.length)
              .split('/')
              .filter(Boolean);
}

function targetsOf(request: HttpRequest<unknown>): unknown {
    const text = searchTextOf(request);

    return {
        groups: matching(STYLE_GUIDE_SHARE_GROUPS, text),
        hasMore: false,
        users: matching(STYLE_GUIDE_SHARE_USERS, text)
    };
}

function transferredOf(request: HttpRequest<unknown>): BeyPageTransferResponse {
    const { items = [] } = (request.body ?? {}) as { items?: unknown[] };

    return { transferred: items.length };
}

function transferTargetsOf(request: HttpRequest<unknown>): BeyPageTransferTargets {
    return {
        hasMore: false,
        options: matching(STYLE_GUIDE_SHARE_USERS, searchTextOf(request)).map(({ email, id, name }) => ({
            description: email,
            label: name,
            value: id
        }))
    };
}
