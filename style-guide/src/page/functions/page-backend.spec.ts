import { HttpEvent, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { BeyPageBackendResponse, BeyPageItem } from '@beyonda-labs/angular-components';
import { firstValueFrom, Observable, of } from 'rxjs';

import { pageStyleGuideInterceptor } from './page-backend';

const API_URL = 'https://api.test/api/style-guide/documents';

describe('pageStyleGuideInterceptor', () => {
    let passed: HttpRequest<unknown>[];

    function next(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
        passed.push(request);

        return of(new HttpResponse({ body: 'from the backend', status: 200 }));
    }

    async function answer(
        url: string,
        parameters: Record<string, string> = {},
        method: 'GET' | 'PUT' = 'GET',
        body: unknown = null
    ): Promise<unknown> {
        const request = new HttpRequest(method, url, body, { params: new HttpParams({ fromObject: parameters }) });
        const event = await firstValueFrom(pageStyleGuideInterceptor(request, next));

        return (event as HttpResponse<unknown>).body;
    }

    async function namesOf(url: string, parameters: Record<string, string> = {}): Promise<unknown[]> {
        const { results } = (await answer(url, parameters)) as BeyPageBackendResponse<BeyPageItem & { name: string }>;

        return results.map(({ name }) => name);
    }

    beforeEach(() => {
        passed = [];
    });

    it('lists the own rows at the root, the rows of a folder inside it, and the folders shared with the user', async () => {
        expect(await namesOf(API_URL, { parentId: 'null' })).toEqual(['Contracts', 'Drafts', 'Offer 2026']);
        expect(await namesOf(API_URL, { parentId: 'clients' })).toEqual(['Acme', 'Terms of service']);
        expect(await namesOf(`${API_URL}/shared`)).toEqual(['Clients']);
    });

    it('answers the path of a folder from the root down', async () => {
        const path = (await answer(`${API_URL}/categories/acme/path`)) as { id: string }[];

        expect(path.map(({ id }) => id)).toEqual(['clients', 'acme']);
    });

    it('answers the shares of a folder, the people and groups that match a search, and takes new shares', async () => {
        const shares = { shares: [{ access: 'write', granteeId: 'u2', granteeType: 'user' }] };

        expect(await answer(`${API_URL}/categories/drafts/shares`)).toEqual({ inherited: [], shares: [] });
        expect(await answer(`${API_URL}/categories/drafts/share-targets`, { limit: '20', search: 'gra' })).toEqual({
            groups: [],
            hasMore: false,
            users: [{ email: 'grace@example.test', id: 'u2', name: 'Grace Hopper' }]
        });
        expect(await answer(`${API_URL}/categories/drafts/shares`, {}, 'PUT', shares)).toEqual(shares);
    });

    it('leaves every other request to the backend', async () => {
        expect(await answer('https://api.test/api/products')).toBe('from the backend');
        expect(await answer(`${API_URL}/categories/drafts/usages`)).toBe('from the backend');
        expect(passed).toHaveLength(2);
    });
});
