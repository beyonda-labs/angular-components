import { Injectable } from '@angular/core';

import { withSearchText } from '../functions/page-search-text';
import { PageSearch } from '../models/page-search.model';

@Injectable({
    providedIn: 'root'
})
export class PageSearchService {
    buildQueryParameters(search: PageSearch, useSearch: boolean, textField?: string): Record<string, string | number> {
        const parameters: Record<string, string | number> = {};

        if (useSearch) {
            parameters['search'] = this.toBase64(withSearchText(search, textField));
        }

        return parameters;
    }

    private toBase64(value: unknown): string {
        const bytes = new TextEncoder().encode(JSON.stringify(value));
        let binary = '';

        for (const byte of bytes) {
            binary += String.fromCharCode(byte);
        }

        return btoa(binary);
    }
}
