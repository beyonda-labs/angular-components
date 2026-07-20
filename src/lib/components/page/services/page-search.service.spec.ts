import { SearchFilterOperator } from '../../search/models/search-filter.model';
import { PageSearch, SearchSortDirection } from '../models/page-search.model';
import { PageSearchService } from './page-search.service';

/** Reverses the service's UTF-8 safe base64 encoding, for assertions. */
function decodeBase64(base64: string): unknown {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

describe('PageSearchService', () => {
    let service: PageSearchService;

    beforeEach(() => {
        service = new PageSearchService();
    });

    it('should return no parameters when useSearch is false', () => {
        const search: PageSearch = { filters: [], page: 1, size: 25 };

        expect(service.buildQueryParameters(search, false)).toEqual({});
    });

    it('should encode the search as a single base64 parameter when useSearch is true', () => {
        const search: PageSearch = { filters: [], page: 2, size: 50 };

        const parameters = service.buildQueryParameters(search, true);

        expect(Object.keys(parameters)).toEqual(['search']);
        expect(decodeBase64(parameters['search'] as string)).toEqual(search);
    });

    it('should round-trip filters and sort through the encoding', () => {
        const search: PageSearch = {
            filters: [{ field: 'name', operator: SearchFilterOperator.Contains, value: 'oat' }],
            page: 1,
            size: 25,
            sort: { direction: SearchSortDirection.Desc, field: 'name' }
        };

        const parameters = service.buildQueryParameters(search, true);

        expect(decodeBase64(parameters['search'] as string)).toEqual(search);
    });

    it('should encode non-Latin1 free text without throwing', () => {
        const search: PageSearch = { filters: [], page: 1, size: 25, text: 'café con ñ' };

        expect(() => service.buildQueryParameters(search, true)).not.toThrow();

        const parameters = service.buildQueryParameters(search, true);

        expect(decodeBase64(parameters['search'] as string)).toEqual(search);
    });
});
