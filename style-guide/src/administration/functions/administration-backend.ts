import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import {
    BeyGroupMember,
    BeyGroupRow,
    BeyOrganizationSummaryMember,
    BeyPageBackendResponse,
    BeyPageItem,
    BeyPageSearch
} from '@beyonda-labs/angular-components';
import { Observable, of } from 'rxjs';

import {
    STYLE_GUIDE_BACKEND_PATH,
    STYLE_GUIDE_EXTRA_ROLES,
    STYLE_GUIDE_GROUPS,
    STYLE_GUIDE_ORGANIZATION,
    STYLE_GUIDE_PEOPLE,
    STYLE_GUIDE_PERMISSIONS,
    STYLE_GUIDE_ROLES,
    StyleGuideGroup
} from '../models/administration-backend.model';

const CURRENT_ORGANIZATION = 'current';
const GET = 'GET';
const LIMIT_PARAMETER = 'limit';
const MEMBER_OPTIONS = 'member-options';
const PERMISSIONS = 'permissions';
const ROLE_OPTIONS = 'role-options';
const SEARCH_PARAMETER = 'search';

export function administrationStyleGuideInterceptor(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
    const segments = segmentsOf(request.url);
    const body = segments ? answerOf(request, segments) : undefined;

    return body === undefined ? next(request) : of(new HttpResponse({ body, status: 200, url: request.url }));
}

function answerGroups(request: HttpRequest<unknown>, [id, detail]: string[]): unknown {
    if (request.method !== GET) {
        return request.body ?? {};
    }

    if (!id) {
        return listOf(STYLE_GUIDE_GROUPS.map(toGroupRow), request);
    }

    if (detail === MEMBER_OPTIONS) {
        return { users: matching(STYLE_GUIDE_PEOPLE.map(toGroupMember), request) };
    }

    if (detail === ROLE_OPTIONS) {
        return { extraRoles: matching(STYLE_GUIDE_EXTRA_ROLES, request) };
    }

    return detail ? undefined : STYLE_GUIDE_GROUPS.find(group => group.id === id);
}

function answerOf(request: HttpRequest<unknown>, [resource, ...rest]: string[]): unknown {
    if (resource === 'groups') {
        return answerGroups(request, rest);
    }

    if (resource === 'roles') {
        return answerRoles(request, rest);
    }

    return resource === 'organizations' && request.method === GET && rest.join('/') === CURRENT_ORGANIZATION
        ? STYLE_GUIDE_ORGANIZATION
        : undefined;
}

function answerRoles(request: HttpRequest<unknown>, [detail]: string[]): unknown {
    if (request.method !== GET) {
        return request.body ?? {};
    }

    if (detail === PERMISSIONS) {
        return { permissions: STYLE_GUIDE_PERMISSIONS };
    }

    return detail ? undefined : listOf(STYLE_GUIDE_ROLES, request);
}

function decodeSearch(encoded: string | null): Partial<BeyPageSearch> {
    if (!encoded) {
        return {};
    }

    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));

    return JSON.parse(new TextDecoder().decode(bytes)) as BeyPageSearch;
}

function includesText(values: (string | null | undefined)[], text: string): boolean {
    return values.some(value => value?.toLowerCase().includes(text));
}

function listOf<TRow extends BeyPageItem & { name: string }>(
    rows: readonly TRow[],
    request: HttpRequest<unknown>
): BeyPageBackendResponse<TRow> {
    const search = decodeSearch(request.params.get(SEARCH_PARAMETER));
    const text = search.text?.trim().toLowerCase() ?? '';
    const results = rows.filter(({ name }) => includesText([name], text));

    return { globalActions: ['create'], results, search: { ...search, total: results.length } as BeyPageSearch };
}

function matching<
    TOption extends {
        id: string;
        name: string;

        email?: string;
    }
>(options: readonly TOption[], request: HttpRequest<unknown>): TOption[] {
    const text = request.params.get(SEARCH_PARAMETER)?.trim().toLowerCase() ?? '';
    const limit = Number(request.params.get(LIMIT_PARAMETER) ?? options.length);

    return options.filter(({ email, name }) => includesText([name, email], text)).slice(0, limit);
}

function segmentsOf(url: string): string[] | null {
    const start = url.indexOf(STYLE_GUIDE_BACKEND_PATH);

    return start === -1
        ? null
        : url
              .slice(start + STYLE_GUIDE_BACKEND_PATH.length)
              .split('/')
              .filter(Boolean);
}

function toGroupMember({ email, id, name, surname }: BeyOrganizationSummaryMember): BeyGroupMember {
    return { email, id, name: [name, surname].filter(Boolean).join(' ') };
}

function toGroupRow({ actions, createdAt, extraRoleCount, id, memberCount, name }: StyleGuideGroup): BeyGroupRow {
    return { actions, createdAt, extraRoleCount, id, memberCount, name };
}
