import { HttpEvent, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, Observable, of } from 'rxjs';

import { STYLE_GUIDE_ORGANIZATION } from '../models/administration-backend.model';
import { administrationStyleGuideInterceptor } from './administration-backend';

const API_URL = 'https://api.test/api/style-guide';

describe('administrationStyleGuideInterceptor', () => {
    let passed: HttpRequest<unknown>[];

    function next(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
        passed.push(request);

        return of(new HttpResponse({ body: 'from the backend', status: 200 }));
    }

    function encode(search: object): string {
        const bytes = new TextEncoder().encode(JSON.stringify(search));

        return btoa(String.fromCharCode(...bytes));
    }

    async function answer(
        url: string,
        parameters: Record<string, string> = {},
        method: 'DELETE' | 'GET' | 'POST' | 'PUT' = 'GET',
        body: unknown = null
    ): Promise<unknown> {
        const request = new HttpRequest(method, url, body, { params: new HttpParams({ fromObject: parameters }) });
        const event = await firstValueFrom(administrationStyleGuideInterceptor(request, next));

        return (event as HttpResponse<unknown>).body;
    }

    beforeEach(() => {
        passed = [];
    });

    it('lists the groups by name, without their members, and lets the caller create, edit and delete them', async () => {
        const list = (await answer(`${API_URL}/groups`, { search: encode({ filters: [], page: 0, size: 10 }) })) as {
            globalActions: string[];
            results: { actions: string[]; name: string }[];
            search: { total: number };
        };

        expect(list.globalActions).toEqual(['create']);
        expect(list.results.map(({ name }) => name)).toEqual(['Sales', 'Support', 'Legal']);
        expect(list.results[0]).not.toHaveProperty('members');
        expect(list.results[0].actions).toEqual(['edit', 'delete']);
        expect(list.search.total).toBe(3);
    });

    it('finds the rows whose name holds the text of the search, whatever the case', async () => {
        const list = (await answer(`${API_URL}/roles`, {
            search: encode({ filters: [], page: 0, size: 10, text: 'REVIEW' })
        })) as { results: { name: string }[]; search: { total: number } };

        expect(list.results.map(({ name }) => name)).toEqual(['Reviewers']);
        expect(list.search.total).toBe(1);
    });

    it('opens a group with its members and its additional roles', async () => {
        expect(await answer(`${API_URL}/groups/g1`)).toMatchObject({
            extraRoles: [{ id: 'r1', name: 'Reviewers' }],
            members: [
                { email: 'ada@example.test', id: 'u1', name: 'Ada Lovelace' },
                { email: 'grace@example.test', id: 'u2', name: 'Grace Hopper' }
            ],
            name: 'Sales'
        });
    });

    it('suggests the users of the organization by name or email, up to the limit asked for', async () => {
        const options = (await answer(`${API_URL}/groups/g1/member-options`, { limit: '20', search: 'ALAN' })) as {
            users: unknown[];
        };
        const limited = (await answer(`${API_URL}/groups/g1/member-options`, { limit: '2', search: '' })) as {
            users: unknown[];
        };
        const unnamed = (await answer(`${API_URL}/groups/g1/member-options`, { limit: '20', search: 'margaret' })) as {
            users: unknown[];
        };

        expect(options.users).toEqual([{ email: 'alan@example.test', id: 'u3', name: 'Alan Turing' }]);
        expect(limited.users).toHaveLength(2);
        expect(unnamed.users).toEqual([{ email: 'margaret@example.test', id: 'u5', name: '' }]);
    });

    it('suggests the additional roles of the organization by name', async () => {
        expect(await answer(`${API_URL}/groups/g1/role-options`, { limit: '20', search: 'arch' })).toEqual({
            extraRoles: [{ id: 'r2', name: 'Archivists' }]
        });
    });

    it('lists the base roles before the additional ones, and the permissions a role may give', async () => {
        const list = (await answer(`${API_URL}/roles`)) as { results: { isBase: boolean; name: string }[] };
        const permissions = (await answer(`${API_URL}/roles/permissions`)) as { permissions: { group: string }[] };

        expect(list.results.map(({ isBase, name }) => [name, isBase])).toEqual([
            ['admin', true],
            ['editor', true],
            ['Reviewers', false],
            ['Archivists', false]
        ]);
        expect(new Set(permissions.permissions.map(({ group }) => group))).toEqual(
            new Set(['documents', 'organization', 'templates', 'users'])
        );
    });

    it('answers the summary of the current organization', async () => {
        expect(await answer(`${API_URL}/organizations/current`)).toBe(STYLE_GUIDE_ORGANIZATION);
    });

    it('confirms a change by answering what was sent, without keeping it', async () => {
        expect(await answer(`${API_URL}/groups/g1`, {}, 'PUT', { name: 'Sales team' })).toEqual({ name: 'Sales team' });
        expect(await answer(`${API_URL}/roles`, {}, 'DELETE', { ids: ['r1'] })).toEqual({ ids: ['r1'] });
        expect(((await answer(`${API_URL}/roles`)) as { results: unknown[] }).results).toHaveLength(4);
        expect(passed).toEqual([]);
    });

    it('passes on every other request, such as the users or the organizations list', async () => {
        expect(await answer(`${API_URL}/users`)).toBe('from the backend');
        expect(await answer(`${API_URL}/organizations`)).toBe('from the backend');
        expect(await answer(`${API_URL}/groups/g9`)).toBe('from the backend');
        expect(await answer('https://api.test/api/templates')).toBe('from the backend');
        expect(passed.map(({ url }) => url)).toEqual([
            `${API_URL}/users`,
            `${API_URL}/organizations`,
            `${API_URL}/groups/g9`,
            'https://api.test/api/templates'
        ]);
    });
});
