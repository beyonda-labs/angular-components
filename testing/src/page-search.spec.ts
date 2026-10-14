import { HttpParams, HttpRequest } from '@angular/common/http';
import { BeyPageSearch } from '@beyonda-labs/angular-components';

import { decodePageSearch, searchOf } from './page-search';

const SEARCH: BeyPageSearch = { filters: [], page: 2, size: 25, text: 'Café' };

function encode(search: BeyPageSearch): string {
    const bytes = new TextEncoder().encode(JSON.stringify(search));

    return btoa(String.fromCharCode(...bytes));
}

function requestWith(parameters: HttpParams): { request: HttpRequest<unknown> } {
    return { request: new HttpRequest('GET', 'https://api.test/api/items', { params: parameters }) };
}

describe('testing/page-search', () => {
    it('decodes a search as the page encodes it, accents included', () => {
        expect(decodePageSearch(encode(SEARCH))).toEqual(SEARCH);
    });

    it('reads the search a request sends', () => {
        expect(searchOf(requestWith(new HttpParams().set('search', encode(SEARCH))))).toEqual(SEARCH);
    });

    it('throws when the request sends no search', () => {
        expect(() => searchOf(requestWith(new HttpParams()))).toThrow('No search parameter');
    });
});
