import { BeyPageSearch } from '@beyonda-labs/angular-components';

import { SearchRequest } from './models/testing.model';

const SEARCH_PARAMETER = 'search';

export function decodePageSearch(encoded: string): BeyPageSearch {
    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));

    return JSON.parse(new TextDecoder().decode(bytes)) as BeyPageSearch;
}

export function searchOf(request: SearchRequest): BeyPageSearch {
    const encoded = request.request.params.get(SEARCH_PARAMETER);

    if (encoded === null) {
        throw new Error(`No ${SEARCH_PARAMETER} parameter in ${request.request.urlWithParams}`);
    }

    return decodePageSearch(encoded);
}
